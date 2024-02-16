import { ContentCopy } from "@mui/icons-material";
import CodeIcon from '@mui/icons-material/Code';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ForkLeftIcon from '@mui/icons-material/ForkLeft';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QRCode2Icon from "@mui/icons-material/QrCode2";
import StopIcon from '@mui/icons-material/Stop';
import { Button, CircularProgress, ClickAwayListener, Grow, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Popper, Tooltip } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageModel } from "../models/MessageModel";
import { PostModel } from "../models/PostModel";
import { AppContext } from "../store/AppContext";
import { deleteMessageByMid, forkPost, toggleIsHiddenFromAI } from "../util/db";
import QRCodeDialog from "./QRCodeDialog";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

const MessageMoreButton: React.FC<{
  message: MessageModel;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isPythonRuntime?: boolean;
  setIsHiddenFromAI: (isHiddenFromAI: boolean) => void;
}> = (props) => {
  const context = useContext(AppContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const hasRightToEdit = context.curPost?.username === context.loggedUser;
  const hasRightToToggleVisibility = hasRightToEdit;
  const hasRightToDelete = context.auth && context.curPost && context.curPost.username === context.loggedUser;
  const utterance = new SpeechSynthesisUtterance(props.message.content.replaceAll("@ai", "").replaceAll("@AI", ""));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasVoice = window.speechSynthesis.getVoices().length > 0;
  const [isForking, setIsForking] = useState(false);
  const { username, postid } = useParams();
  const navigate = useNavigate();
  const [isHiddenFromAI, setIsHiddenFromAI] = useState(props.message.ishiddenfromai);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  if (props.message.authorusername === undefined) {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      utterance.pitch = 1;
    } else {
      utterance.pitch = 0.5;
    }
  } else {
    utterance.pitch = 2;
  }
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      context.setSpeakingMid(-1);
      setIsSpeaking(false);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCopyClick = () => {
    context.showSnack("Copied to clipboard!");
    navigator.clipboard.writeText(props.message.content.replaceAll("\n\n", "\n")); // Remove double \n
    handleClose();
  }
  const handleEditClick = () => {
    props.setIsEditing(true);
    handleClose();
  }
  const handleSpeak = () => {
    context.setSpeakingMid(props.message.mid);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    utterance.onend = () => {
      const nxtMsg = context.findNextMessage(props.message.mid);
      if (nxtMsg) {
        context.setSpeakingMid(nxtMsg.mid);
      } else {
        context.setSpeakingMid(-1);
      }
      setIsSpeaking(false);
    }
  }
  const handleSpeakClick = () => {
    handleSpeak();
    handleClose();
  }
  useEffect(() => {
    if (props.message.shouldSpeak && !isSpeaking && hasVoice) {
      handleSpeak();
    }
  }, []);
  useEffect(() => {
    if (!isSpeaking && context.speakingMid !== -1 && context.speakingMid === props.message.mid) {
      // Smooth scroll to the message
      const msgEl = document.getElementById("m" + props.message.mid);
      if (msgEl) {
        msgEl.scrollIntoView({
          behavior: "smooth",
        });
        window.history.replaceState({}, "", window.location.href.split('#')[0]);
      }
      handleSpeak();
    }
  }, [context.speakingMid]);
  const handleDeleteClick = async () => {
    handleClose();
    props.message.isLoading = true;
    context.hideMessage(props.message.mid);
    const result = await deleteMessageByMid(props.message.mid, context.auth.token, context.loggedUser);
    if (result.message === "SUCCESS") {
      context.deleteMessage(props.message.mid);
    } else {
      context.showSnack("DELETE MESSAGE: " + result.message);
    }
  }
  const handleShareClick = () => {
    setShowQRCodeDialog(true);
    handleClose();
  }
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const handleQRClose = () => {
    setShowQRCodeDialog(false);
  }
  const hasRightToFork = context.auth && context.auth.token && context.loggedUser && context.curPost;
  const handleForkClick = () => {
    setIsForking(true);
    forkPost(username!, postid!, context.auth.loggedEmail, context.auth.token, props.message.mid).then((response) => {
      context.setLastPostsRefresh(new Date());
      context.showSnack("FORKED: " + response.message);
      if (response.message === "SUCCESS") {
        const result = response.result as PostModel;
        context.setJustForked(true);
        context.setMessages([]);
        navigate(`/${context.loggedUser}/${result.pid}`);
      }
      setIsForking(false);
    });
  }
  const handleToggleVisibilityClick = async () => {
    setIsTogglingVisibility(true);
    const result = await toggleIsHiddenFromAI(props.message.mid, context.auth.loggedEmail, context.auth.token);
    setIsTogglingVisibility(false);
    if (result.message === "SUCCESS") {
      const isHiddenFromAIRes = result.result as boolean;
      setIsHiddenFromAI(isHiddenFromAIRes);
      props.message.ishiddenfromai = isHiddenFromAIRes;
      props.setIsHiddenFromAI(isHiddenFromAIRes);
      handleClose()
    } else {
      context.showSnack("TOGGLE VISIBILITY FAILED: " + result.message);
    }
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
        }}
        onClick={handleClick}
      >
        <Button
          variant="text"
          size="small"
          color="inherit"
        >
          {isSpeaking ? <StopIcon fontSize="small" /> : <MoreHorizIcon fontSize="small" />}
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
                        {props.isPythonRuntime ? <CodeIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText>Edit</ListItemText>
                    </MenuItem>
                  )
                  }
                  <MenuItem onClick={handleShareClick}>
                    <ListItemIcon>
                      <QRCode2Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Share</ListItemText>
                  </MenuItem>
                  {hasVoice &&
                    (<MenuItem onClick={handleSpeakClick}>
                      <ListItemIcon>
                        {isSpeaking ? <StopIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText>
                        {isSpeaking ? "Stop" : "Speak"}
                      </ListItemText>
                    </MenuItem>)
                  }
                  {hasRightToFork && (
                    <Tooltip placement="left" arrow title="Continue the conversation from this point privately">
                      <MenuItem
                        onClick={handleForkClick}
                      >
                        <ListItemIcon>
                          {
                            isForking ? <CircularProgress size={20} color="inherit" /> : <ForkLeftIcon fontSize="small" />
                          }
                        </ListItemIcon>
                        <ListItemText>Fork</ListItemText>
                      </MenuItem>
                    </Tooltip>)
                  }
                  {hasRightToToggleVisibility && (
                    <Tooltip placement="left" arrow title={isHiddenFromAI ? "Show this message to AI" : "Hide this message to AI"}>
                      <MenuItem
                        onClick={handleToggleVisibilityClick}
                      >
                        <ListItemIcon>
                          { isTogglingVisibility ? <CircularProgress size={20} color="inherit" /> :
                            isHiddenFromAI ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>{isHiddenFromAI ? "Show" : "Hide" }</ListItemText>
                      </MenuItem>
                    </Tooltip>)
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
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      <QRCodeDialog url={window.location.href.split('#')[0] + "#m" + props.message.mid} onClose={handleQRClose} open={showQRCodeDialog} genShortUrl={true} />
    </>
  );
};

export default MessageMoreButton;
