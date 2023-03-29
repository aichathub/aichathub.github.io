import { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { ClickAwayListener, FormControlLabel, Grow, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Popper, Tooltip } from "@mui/material";
import { Button } from "@material-ui/core";
import { MessageModel } from "../models/MessageModel";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { ContentCopy } from "@mui/icons-material";
import { useContext } from "react";
import { AppContext } from "../store/AppContext";
import EditIcon from '@mui/icons-material/Edit';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteMessageByMid } from "../util/db";

const MessageMoreButton: React.FC<{
  message: MessageModel;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}> = (props) => {
  const context = useContext(AppContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const hasRightToEdit = props.message.authorusername === context.loggedUser;
  const hasRightToDelete = context.auth && context.curPost && context.curPost.authoremail === context.auth.loggedEmail;
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCopyClick = () => {
    context.showSnack("Copied to clipboard!");
    navigator.clipboard.writeText(props.message.content);
    handleClose();
  }
  const handleEditClick = () => {
    props.setIsEditing(true);
    handleClose();
  }
  const handleSpeakClick = () => {
    // const utterance = new SpeechSynthesisUtterance(props.message.content);
    // window.speechSynthesis.speak(utterance);
    context.showSnack("Coming soon!");
    handleClose();
  }
  const handleDeleteClick = async () => {
    const result = await deleteMessageByMid(props.message.mid, context.auth.token, context.loggedUser);
    if (result.message === "SUCCESS") {
      context.deleteMessage(props.message.mid);
    }
    context.showSnack("DELETE MESSAGE: " + result.message);
  }
  return (
    <>
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
        onClick={handleClick}
      >
        <Button
          variant="contained"
          size="small"
          style={{
            background: "white",
            color: "black",
            borderRadius: "0px"
          }}
        >
          <MoreHorizIcon fontSize="small" />
        </Button>
      </div>
      <Popper open={open} anchorEl={anchorEl} transition>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom"
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  <MenuItem onClick={handleCopyClick}>
                    <ListItemIcon>
                      <ContentCopy fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Copy</ListItemText>
                  </MenuItem>
                  {hasRightToEdit && (
                    <MenuItem
                      onClick={handleEditClick}
                    >
                      <ListItemIcon>
                        <EditIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Edit</ListItemText>
                    </MenuItem>
                  )
                  }
                  {hasRightToDelete && (
                    <MenuItem
                      onClick={handleDeleteClick}
                    >
                      <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Delete</ListItemText>
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleSpeakClick}>
                    <ListItemIcon>
                      <VolumeUpIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Speak</ListItemText>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default MessageMoreButton;
