import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { MAX_NAME, cleanName } from './sceneState';

interface SceneNameDialogProps {
  open: boolean;
  title: string;
  confirmLabel: string;
  initialName: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

/** Name prompt shared by "Save this mix" and "Rename". The form remounts on every open. */
export function SceneNameDialog({
  open,
  title,
  confirmLabel,
  initialName,
  onClose,
  onSubmit,
}: SceneNameDialogProps) {
  const titleId = useId();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: '18px', m: 2, width: 'calc(100% - 32px)' } } }}
    >
      {open && (
        <NameForm
          titleId={titleId}
          title={title}
          confirmLabel={confirmLabel}
          initialName={initialName}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

function NameForm({
  titleId,
  title,
  confirmLabel,
  initialName,
  onClose,
  onSubmit,
}: Omit<SceneNameDialogProps, 'open'> & { titleId: string }) {
  const [value, setValue] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Opened with Enter, the modal's focus trap restores the opener right after autoFocus ran;
  // a macrotask later the trap has settled and the field can keep focus.
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, []);
  const name = cleanName(value);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name) onSubmit(name);
  };

  return (
    <form onSubmit={submit}>
      <DialogTitle id={titleId} component="h2" variant="h4" sx={{ fontSize: 22 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <TextField
          inputRef={inputRef}
          fullWidth
          label="Scene name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          slotProps={{ htmlInput: { maxLength: MAX_NAME } }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ minHeight: 44 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={!name} sx={{ minHeight: 44 }}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </form>
  );
}
