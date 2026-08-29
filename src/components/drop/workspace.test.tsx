import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Workspace } from './workspace';
import { useFilesStore } from '@/stores/files-store';

function makeFile(name: string, type = 'text/plain') {
  return new File(['hello'], name, { type });
}

describe('Workspace', () => {
  beforeEach(() => {
    useFilesStore.getState().clear();
  });

  it('shows the DropZone by default with a Choose files button', () => {
    render(<Workspace />);
    expect(screen.getByRole('button', { name: /choose files/i })).toBeInTheDocument();
    expect(screen.getByText(/drop files here/i)).toBeInTheDocument();
  });

  it('renders the file list when a file is added via the picker', async () => {
    const user = userEvent.setup();
    render(<Workspace />);

    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    await user.upload(input!, makeFile('greeting.txt'));

    expect(await screen.findByText('greeting.txt')).toBeInTheDocument();
    expect(screen.getByText(/1 file ready/i)).toBeInTheDocument();
    // Tool picker shows its empty state since no tools are registered yet
    expect(screen.getByTestId('tool-picker-empty')).toBeInTheDocument();
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
