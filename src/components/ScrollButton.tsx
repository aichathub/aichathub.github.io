import Grid from "@material-ui/core/Grid";
import { Fab } from "@material-ui/core";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useEffect, useState, useRef } from "react";
import { Tooltip } from "@material-ui/core";

const ScrollButton = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userHovering, setUserHovering] = useState(false);
  const timeOutHideBtnFunc = useRef<NodeJS.Timeout>();
  const extendTimer = () => {
    if (timeOutHideBtnFunc.current) {
      clearTimeout(timeOutHideBtnFunc.current!);
      timeOutHideBtnFunc.current = undefined;
    }
    timeOutHideBtnFunc.current = setTimeout(() => {
      setShowScrollButton(false);
      timeOutHideBtnFunc.current = undefined;
    }, 2000);
  };
  const handleOnMouseEnter = () => {
    setUserHovering(true);
  };
  const handleOnMouseLeave = () => {
    setUserHovering(false);
  };
  const handleScrollTopBtnClick = () => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleScrollBottomBtnClick = () => {
    window.scroll({
      top: document.body.offsetHeight,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    if (!userHovering) {
      extendTimer();
      setShowScrollButton(true);
    } else {
      if (timeOutHideBtnFunc.current) {
        clearTimeout(timeOutHideBtnFunc.current!);
      }
    }
  }, [userHovering]);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      extendTimer();
      setShowScrollButton(true);
    });
  }, []);

  if (!showScrollButton) return <></>;

  return (
    <Grid
      style={{ float: "right", marginBottom: "12px", marginRight: "15px" }}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
    >
      <Tooltip title="Scroll to top" placement="top" arrow>
        <Fab
          style={{
            background: "white",
            display: "block",
            borderRadius: "0px",
          }}
          size="small"
          onClick={handleScrollTopBtnClick}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Tooltip>
      <Tooltip title="Scroll to bottom" placement="bottom" arrow>
        <Fab
          style={{ background: "white", borderRadius: "0px" }}
          size="small"
          onClick={handleScrollBottomBtnClick}
        >
          <KeyboardArrowDownIcon />
        </Fab>
      </Tooltip>
    </Grid>
  );
};

export default ScrollButton;
