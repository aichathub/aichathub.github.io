import { Typography } from "@material-ui/core";
import { Box } from "@mui/material";
import logo from "../images/logo.png";
import classes from "./MainLoading.module.css";

const MainLoading: React.FC<{
  darkMode: boolean;
}> = (props) => {
  return <Box style={{ height: "100vh", background: props.darkMode ? "black" : "white" }}>
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <img className={classes.rotate} src={logo} alt="Logo" style={{ width: "250px", height: "250px" }} />
      <Typography variant="h6" style={{ marginTop: "20px", marginLeft: "75px", color: props.darkMode ? "white" : "black" }}>
        Initializing...
      </Typography>
    </div>
  </Box>;
}

export default MainLoading;