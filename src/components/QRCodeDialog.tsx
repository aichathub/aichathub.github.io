import { Skeleton, Tooltip } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import * as React from 'react';
import { useEffect } from 'react';
import QRCode from "react-qr-code";
import { generateShortUrl } from '../util/db';
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
  genShortUrl?: boolean;
  hideUrl?: boolean;
}> = (props) => {
  const { url, open, onClose, hideUrl } = props;
  const [isGenerating, setIsGenerating] = React.useState(props.genShortUrl);
  const [displayUrl, setDisplayUrl] = React.useState(props.url);
  useEffect(() => {
    if (props.genShortUrl && open) {
      setIsGenerating(true);
      generateShortUrl(props.url, window.location.origin).then((shortUrlResponse) => {
        if (shortUrlResponse.message === "SUCCESS") {
          const shortUrl = shortUrlResponse.result;
          setDisplayUrl(shortUrl);
        }
        setIsGenerating(false);
      });
    }
  }, [open])
  useEffect(() => {
    setDisplayUrl(url);
  }, [url]);
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
        {!hideUrl &&
          (<Tooltip title={props.url} arrow>
            <div style={{ marginBottom: "7px", transform: "translateY(5px)", marginLeft: "2px" }}>
              {isGenerating ? <Skeleton variant="text" width={175} /> :
                displayUrl.replace(/http(s)?:\/\//, "")
              }
            </div>
          </Tooltip>)}
        <QRCode value={displayUrl} />
        {!hideUrl && <CopyButton content={displayUrl} placement={"top"} />}
      </Dialog>
    </div>
  );
}
export default QRCodeDialog;