import { Tooltip } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import * as React from 'react';
import QRCode from "react-qr-code";
import CopyButton from './CopyButton';

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
        <Tooltip title={props.url} arrow>
          <>
            {props.url.substring(0, 25) + "..."}
          </>
        </Tooltip>
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
        {/* <CopyWrapper content={url}>
          <>

          </>
        </CopyWrapper> */}
        {/* <ContentCopyIcon fontSize="small" /> */}
        <CopyButton content={url} placement={"top"} />
      </Dialog>
    </div>
  );
}
export default QRCodeDialog;