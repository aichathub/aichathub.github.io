import { Checkbox, ClickAwayListener, FormControlLabel, Grow, IconButton, MenuItem, MenuList, Paper, Popper, Tooltip } from "@material-ui/core";
import { useState, useContext, useRef, useEffect } from "react";
import { AppContext } from "../store/AppContext";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useParams } from "react-router-dom";

const MessageInputUpload: React.FC<{
  setInputText: (msg: string) => void;
}> = (props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    fileRef.current?.click();
  };
  const handleFileUpload = async (files: FileList | null) => {
    if (files && files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const content = e.target?.result as string;
        const msg = `@ai Give me the summary of this file (${files[0].name}): \n` + content;
        props.setInputText(msg);
        console.log("Loaded file content: ", content);
      };
      fileReader.readAsText(files[0]);
    }
  };
  return <>
    <Tooltip title="Upload" arrow>
      <IconButton
        component="label"
        style={{ borderRadius: 0 }}
        onClick={handleClick}
      >
        <AttachFileIcon />
      </IconButton>
    </Tooltip>
    <input 
      type="file" 
      accept=".txt"
      onChange={(e) => handleFileUpload(e.target.files)}
      style={{ display: "none" }}
      ref={fileRef}
    />
  </>;
};

export default MessageInputUpload;