import { Grid } from "@mui/material";
import { useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { AppContext } from "../store/AppContext";
import { backendServer } from "../util/constants";
import CustomQRCodeLoginButton from "./CustomQRCodeLoginButton";
import QRCodeDialog from "./QRCodeDialog";

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
    const socket = io(backendServer);
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
    context.showSnack("Copy the login code or scan the QR code from other logged devices");
  };
  const handleQRClose = () => {
    setShowQRCodeDialog(false);
  }
  return <Grid container justifyContent="flex-end">
    <Grid item>
      <span onClick={handleSignInWithOtherDevicesClick}>
        <CustomQRCodeLoginButton />
      </span>
      {/* <Link href="/" variant="body2" onClick={handleSignInWithOtherDevicesClick}>
        Sign In With Other Devices
      </Link> */}
    </Grid>
    <QRCodeDialog url={authorizeUrl} onClose={handleQRClose} open={showQRCodeDialog} customDisplayText={authorizeUrl.slice(-4).toUpperCase()} />
  </Grid>
}
export default QRCodeLoginButton;