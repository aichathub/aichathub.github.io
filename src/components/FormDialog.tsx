import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useRef } from "react";
import { KeyboardEvent } from "react";

const FormDialog: React.FC<{
  title: string;
  content: string;
  handleOK: (content: string) => void;
  handleClose: () => void;
}> = (props) => {
  const [open, setOpen] = React.useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setOpen(false);
    props.handleClose();
  };

  const handleOK = () => {
    handleClose();
    props.handleOK(inputRef.current!.value!);
  };

  const handleInputOnKeyUp = (event: KeyboardEvent) => {
    event.preventDefault();
    if (event.key === "Enter") {
      handleOK();
    }
  };

  return (
    <div style={{ position: "absolute" }}>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{props.content}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            type="text"
            label="Type Something"
            fullWidth
            variant="standard"
            inputProps={{ maxLength: 20 }}
            inputRef={inputRef}
            onKeyUpCapture={handleInputOnKeyUp}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleOK}>OK</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FormDialog;
