import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import * as React from 'react';
import QRCode from "react-qr-code";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const QRCodeDialog: React.FC<{
  url: string;
  open: boolean;
  onClose: () => void;
}> = (props) => {
  const { url, open, onClose } = props;

  const handleClose = () => {
    onClose();
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        {/* <AppBar sx={{ position: 'relative', bgcolor: "white", color: "black" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar> */}
        <QRCode value={url} />
      </Dialog>
    </div>
  );
}
export default QRCodeDialog;