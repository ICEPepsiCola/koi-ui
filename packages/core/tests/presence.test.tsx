import { expect, test } from '@rstest/core';
import { act, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { Overlay } from '../src/components/shared/Overlay';

function OverlayHarness() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(false)}>
        close
      </button>
      <Overlay open={open}>
        <div>panel</div>
      </Overlay>
    </>
  );
}

test('Overlay mounts when open and unmounts after close', async () => {
  render(<OverlayHarness />);
  expect(screen.getByText('panel')).toBeTruthy();

  await act(async () => {
    screen.getByRole('button', { name: 'close' }).click();
  });

  await waitFor(
    () => {
      expect(screen.queryByText('panel')).toBeNull();
    },
    { timeout: 1000 },
  );
});
