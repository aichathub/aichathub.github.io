import { createButton } from "react-social-login-buttons";

const config = {
  text: "Sign in with QR Code",
  icon: "qrcode",
  iconFormat: (name: string) => `fa fa-${name}`,
  style: { background: "#293e69", height: "40px" },
  activeStyle: { background: "#3b5998", height: "40px" }
};
const CustomQRCodeLoginButton = createButton(config);

export default CustomQRCodeLoginButton;