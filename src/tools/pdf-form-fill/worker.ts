/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfFormFillWorkerInput, PdfFormFillWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfFormFillWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

function classify(field: unknown): string {
  const ctorName = (field as { constructor: { name: string } }).constructor?.name ?? 'PDFField';
  // e.g. PDFTextField → TextField
  return ctorName.replace(/^PDF/, '');
}

function isTruthy(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes' || v === 'on' || v === 'checked';
}

ctx.addEventListener('message', async (e: MessageEvent<PdfFormFillWorkerInput>) => {
  try {
    const { buffer, options } = e.data;
    const {
      PDFDocument,
      PDFTextField,
      PDFCheckBox,
      PDFDropdown,
      PDFOptionList,
      PDFRadioGroup,
    } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });
    const form = doc.getForm();
    const allFields = form.getFields();

    if (options.mode === 'detect') {
      const detected = allFields.map((f) => {
        const name = f.getName();
        const kind = classify(f);
        let currentValue: string | string[] | boolean | undefined;
        try {
          if (f instanceof PDFTextField) currentValue = f.getText() ?? undefined;
          else if (f instanceof PDFCheckBox) currentValue = f.isChecked();
          else if (f instanceof PDFDropdown) currentValue = f.getSelected();
          else if (f instanceof PDFOptionList) currentValue = f.getSelected();
          else if (f instanceof PDFRadioGroup) currentValue = f.getSelected() ?? undefined;
        } catch {
          /* ignore */
        }
        return { name, type: kind, value: currentValue };
      });
      const json = JSON.stringify({ fieldCount: detected.length, fields: detected }, null, 2);
      post({ type: 'result', value: { kind: 'json', json } });
      return;
    }

    // Fill mode.
    const warnings: string[] = [];
    const pairs = options.fields
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) {
          warnings.push(`Skipped malformed line (missing ':'): ${line}`);
          return null;
        }
        return { name: line.slice(0, colonIdx).trim(), value: line.slice(colonIdx + 1).trim() };
      })
      .filter((p): p is { name: string; value: string } => p !== null);

    for (const { name, value } of pairs) {
      const field = form.getFieldMaybe(name);
      if (!field) {
        warnings.push(`Field not found: "${name}"`);
        continue;
      }
      try {
        if (field instanceof PDFTextField) {
          field.setText(value);
        } else if (field instanceof PDFCheckBox) {
          if (isTruthy(value)) field.check();
          else field.uncheck();
        } else if (field instanceof PDFRadioGroup) {
          field.select(value);
        } else if (field instanceof PDFDropdown) {
          field.select(value);
        } else if (field instanceof PDFOptionList) {
          // Allow "a; b; c" or "a, b" for multiple selections.
          const values = value
            .split(/[;,]/)
            .map((v) => v.trim())
            .filter(Boolean);
          field.select(values.length ? values : [value]);
        } else {
          warnings.push(`Unsupported field type for "${name}": ${classify(field)}`);
        }
      } catch (err) {
        warnings.push(
          `Failed to set "${name}": ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    if (options.flatten) {
      try {
        form.flatten();
      } catch {
        /* ignore */
      }
    }

    post({ type: 'progress', value: 0.9 });

    const bytes = await doc.save();
    post({ type: 'result', value: { kind: 'pdf', bytes, warnings } }, [
      bytes.buffer as ArrayBuffer,
    ]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
