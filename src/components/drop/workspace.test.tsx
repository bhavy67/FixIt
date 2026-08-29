import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Workspace } from './workspace';
import { useFilesStore } from '@/stores/files-store';
import { useJobStore } from '@/stores/job-store';
import { registerAllTools } from '@/tools';

function makeFile(name: string, type = 'text/plain') {
  return new File(['hello'], name, { type });
}

describe('Workspace', () => {
  beforeEach(() => {
    useFilesStore.getState().clear();
    useJobStore.getState().reset();
    registerAllTools();
  });

  it('shows the DropZone by default with a Choose files button', () => {
    render(<Workspace />);
    expect(screen.getByRole('button', { name: /choose files/i })).toBeInTheDocument();
    expect(screen.getByText(/drop files here/i)).toBeInTheDocument();
  });

  it('shows the empty tool picker when files have no matching tool', async () => {
    const user = userEvent.setup();
    render(<Workspace />);

    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    await user.upload(input!, makeFile('greeting.txt'));

    expect(await screen.findByText('greeting.txt')).toBeInTheDocument();
    expect(screen.getByText(/1 file ready/i)).toBeInTheDocument();
    expect(screen.getByTestId('tool-picker-empty')).toBeInTheDocument();
  });

  it('shows Image Resize as a match for an image file and opens Configure on click', async () => {
    const user = userEvent.setup();
    await useFilesStore.getState().add([makeFile('cat.png', 'image/png')]);
    render(<Workspace />);

    const pickerCard = await screen.findByRole('button', { name: /image resize/i });
    await user.click(pickerCard);

    // Configure panel shows a Run button; picker is gone
    expect(await screen.findByRole('button', { name: /run image resize/i })).toBeInTheDocument();
    expect(screen.queryByTestId('tool-picker-empty')).not.toBeInTheDocument();
  });

  it('removes an individual file', async () => {
    const user = userEvent.setup();
    await useFilesStore.getState().add([makeFile('a.txt'), makeFile('b.txt')]);
    render(<Workspace />);

    expect(screen.getByText('a.txt')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remove a\.txt/i }));
    expect(screen.queryByText('a.txt')).not.toBeInTheDocument();
    expect(screen.getByText('b.txt')).toBeInTheDocument();
  });

  it('clears all files', async () => {
    const user = userEvent.setup();
    await useFilesStore.getState().add([makeFile('a.txt')]);
    render(<Workspace />);

    await user.click(screen.getByRole('button', { name: /clear all/i }));
    expect(screen.queryByText('a.txt')).not.toBeInTheDocument();
    expect(screen.getByText(/drop files here/i)).toBeInTheDocument();
  });
});
