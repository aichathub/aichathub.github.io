import { Typography } from "@material-ui/core";
import { Box } from "@mui/material";
import { useContext, useEffect } from "react";
import logo from "../images/logo.png";
import { AppContext } from "../store/AppContext";
import classes from "./MainLoading.module.css";

const MainLoading: React.FC<{
  darkMode: boolean;
}> = (props) => {
  const context = useContext(AppContext);
  useEffect(() => {
    // Don't spend too much time on this page
    setTimeout(() => {
      context.setIsInitializing(false);
    }, 2000);
  }, []);
  return <Box style={{ height: "85vh" }}>
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <img className={classes.rotate} src={logo} alt="Logo" style={{ width: "250px", height: "250px" }} />
      <Typography variant="h6" style={{ marginTop: "20px", marginLeft: "60px", color: props.darkMode ? "white" : "black" }}>
        Just a moment...
      </Typography>
    </div>
  </Box>;
}

export default MainLoading;