import { Grid, Link } from "@mui/material";
import { useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { AppContext } from "../store/AppContext";
import { backendServer } from "../util/constants";
import QRCodeDialog from "./QRCodeDialog";
const socket = io(backendServer);

const QRCodeLoginButton: React.FC<{
  redirectUrl: string | null;
}> = (props) => {
  const context = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [authorizeUrl, setAuthorizeUrl] = useState("");
  const handleSignInWithOtherDevicesClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent> | React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.preventDefault();
    const sessionid = Math.random().toString(36).substring(2, 6);
    setAuthorizeUrl(`${window.location.origin}/authorize/${sessionid}`);
    socket.on(`requestLogin-${sessionid}`, (data) => {
      const { message, loggedEmail, token } = data;
      if (message === "SUCCESS") {
        context.changeAuth({
          loggedEmail: loggedEmail,
          token: token
        });
        if (props.redirectUrl) {
          window.location.href = props.redirectUrl;
        } else {
          window.location.href = "/";
        }
      } else {
        context.showSnack(message);
      }
    });
    setShowQRCodeDialog(true);
    context.showSnack("Scan the QR code to sign in with other logged devices");
  };
  const handleQRClose = () => {
    setShowQRCodeDialog(false);
  }
  return <Grid container justifyContent="flex-end">
    <Grid item>
      <Link href="/" variant="body2" onClick={handleSignInWithOtherDevicesClick}>
        Sign In With Other Devices
      </Link>
    </Grid>
    <QRCodeDialog url={authorizeUrl} onClose={handleQRClose} open={showQRCodeDialog} hideUrl={true} />
  </Grid>
}
export default QRCodeLoginButton;