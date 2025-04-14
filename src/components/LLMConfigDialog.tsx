import { useState, ChangeEvent } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

interface LLMConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: { endpoint: string; key: string; model: string }) => void;
  initialConfig: {
    endpoint: string;
    key: string;
    model: string;
  };
}

export default function LLMConfigDialog({
  open,
  onClose,
  onSave,
  initialConfig,
}: LLMConfigDialogProps) {
  const [endpoint, setEndpoint] = useState(initialConfig.endpoint);
  const [key, setKey] = useState(initialConfig.key);
  const [model, setModel] = useState(initialConfig.model);

  const handleSave = () => {
    onSave({ endpoint, key, model });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>LLM API Config</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="base url"
          fullWidth
          variant="outlined"
          value={endpoint}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEndpoint(e.target.value)}
        />
        <TextField
          margin="dense"
          label="key"
          fullWidth
          variant="outlined"
          type="password"
          value={key}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
        />
        <TextField
          margin="dense"
          label="model"
          fullWidth
          variant="outlined"
          value={model}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setModel(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>concel</Button>
        <Button onClick={handleSave} color="primary">
          save
        </Button>
      </DialogActions>
    </Dialog>
  );
}