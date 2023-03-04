import { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Tooltip } from "@mui/material";
import { Button } from "@material-ui/core";

const CopyButton: React.FC<{
  content: string;
}> = (props) => {
  const [copied, setCopied] = useState(false);
  const handleCopyBtnClick = async () => {
    if (copied) return;
    await navigator.clipboard.writeText(props.content.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Tooltip title={copied ? "Copied" : "Copy"} arrow>
      <div
        style={{
          padding: ".1rem",
          margin: ".0rem 0",
          border: "none",
          borderRadius: "0px",
          cursor: "pointer",
          position: "absolute",
          right: "0px",
          background: "white",
        }}
        onClick={handleCopyBtnClick}
      >
        <Button
          variant="contained"
          size="small"
          style={{
            background: copied ? "black" : "white",
            color: copied ? "white" : "black",
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
