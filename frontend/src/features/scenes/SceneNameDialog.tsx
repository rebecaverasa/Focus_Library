import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
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
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: '18px', m: 2, width: 'calc(100% - 32px)' } } }}
    >
      {open && (
        <NameForm
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
  title,
  confirmLabel,
  initialName,
  onClose,
  onSubmit,
}: Omit<SceneNameDialogProps, 'open'>) {
  const [value, setValue] = useState(initialName);
  const name = cleanName(value);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name) onSubmit(name);
  };

  return (
    <form onSubmit={submit}>
      <DialogTitle component="h2" variant="h4" sx={{ fontSize: 22 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
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
