import { Button } from "@material-ui/core";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Tooltip } from "@mui/material";
import { useState } from "react";

const CopyButton: React.FC<{
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}> = (props) => {
  const [copied, setCopied] = useState(false);
  const handleCopyBtnClick = async () => {
    if (copied) return;
    await navigator.clipboard.writeText(props.content.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Tooltip title={copied ? "Copied" : "Copy"} arrow placement={props.placement}>
      <div
        style={{
          padding: ".1rem",
          margin: ".0rem 0",
          border: "none",
          borderRadius: "0px",
          cursor: "pointer",
          position: "absolute",
          right: "0px",
          background: "black",
          opacity: copied ? "0.7" : "0.3"
        }}
        onClick={handleCopyBtnClick}
      >
        <Button
          variant="contained"
          size="small"
          style={{
            background: copied ? "white" : "black",
            color: copied ? "black" : "white",
            borderRadius: "0px"
          }}
        >
          <ContentCopyIcon fontSize="small" />
        </Button>
      </div>
    </Tooltip>
  );
};

export default CopyButton;
