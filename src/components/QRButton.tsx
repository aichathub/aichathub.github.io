import { Box, Tooltip } from "@material-ui/core";
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useState } from "react";
import { PostModel } from "../models/PostModel";
import QRCodeDialog from "./QRCodeDialog";

const QRButton: React.FC<{
  post: PostModel;
}> = (props) => {
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const handleQRClick = () => {
    setShowQRCodeDialog(true);
  };
  const handleQRClose = () => {
    setShowQRCodeDialog(false);
  }
  return <><Tooltip title="Generate QRCode link of this post">
    <Box style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      cursor: "pointer",
    }} onClick={handleQRClick}>
      <QrCode2Icon />
    </Box>
  </Tooltip>
    <QRCodeDialog url={window.location.href} onClose={handleQRClose} open={showQRCodeDialog} />
  </>;
}
export default QRButton;