import { ClickAwayListener, Grow, Tooltip } from "@material-ui/core";
import AdbIcon from '@mui/icons-material/Adb';
import SettingsIcon from '@mui/icons-material/Settings';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import { IconButton, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import { useContext, useState } from "react";
import { AppContext } from "../store/AppContext";
import AgentDialog from "./AgentDialog";

const MessageInputSettings: React.FC<{
  inputText: string;
  setInputText: (inputText: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}> = (props) => {
  const triggerAI = props.inputText.indexOf("@ai") !== -1 || props.inputText.indexOf("@AI") !== -1;
  const triggerPython = props.inputText.indexOf("@python") !== -1 || props.inputText.indexOf("@PYTHON") !== -1;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const hasVoice = window.speechSynthesis.getVoices().length > 0;
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // setAnchorEl(event.currentTarget);
    // context.pingYourmodel();
    handleAgentBtnClick();
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const toggleTriggerAI = () => {
    if (triggerAI) {
      props.setInputText(props.inputText.replace("@ai", "").replace("@AI", ""));
    } else {
      props.setInputText("@AI " + props.inputText.trim());
    }
  }
  const toggleTriggerPython = () => {
    if (triggerPython) {
      props.setInputText(props.inputText.replace("@python", "").replace("@PYTHON", ""));
    } else {
      props.setInputText("@python " + props.inputText.trim());
    }
  }
  const handleClearInput = () => {
    props.setInputText("");
    props.inputRef.current!.focus();
    handleClose();
  }
  const context = useContext(AppContext);
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  const handleAgentBtnClick = () => {
    setShowAgentDialog(true);
  }
  const handleAgentDialogClose = () => {
    setShowAgentDialog(false);
  }
  let agent: string = context.agent;
  if (agent === "yourmodel") {
    agent = context.yourmodelUrl;
  }
  return <>
    <Tooltip title="Change Agent" arrow placement="left-start">
      <IconButton
        component="label"
        style={{ borderRadius: 0, borderLeft: '0.1em solid lightgrey' }}
        onClick={handleClick}
      >
        <SettingsIcon />
      </IconButton>
    </Tooltip>
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
                <MenuItem
                  onClick={handleAgentBtnClick}
                >
                  <ListItemIcon>
                    {(context.agent === "yourmodel" && !context.isYourmodelConnected) ?
                      <SignalWifiOffIcon fontSize="small" /> :
                      <AdbIcon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText>Agent: {agent}</ListItemText>
                </MenuItem>
                {/* <MenuItem >
                  <FormControlLabel
                    label="@AI"
                    control={<Checkbox style={{
                      color: "#d30",
                    }} checked={triggerAI} onClick={toggleTriggerAI} />}
                  />
                </MenuItem>
                <MenuItem >
                  <FormControlLabel
                    label="@python"
                    control={<Checkbox style={{
                      color: "#d30",
                    }} checked={triggerPython} onClick={toggleTriggerPython} />}
                  />
                </MenuItem>
                {
                  hasVoice && (
                    <MenuItem >
                      <FormControlLabel
                        label="AI Voice"
                        control={<Checkbox style={{
                          color: "#d30",
                        }}
                          checked={context.sendTriggerAIVoice} onClick={context.toggleSendTriggerAIVoice} />}
                      />
                    </MenuItem>
                  )
                } */}
                {/* <MenuItem
                  onClick={handleClearInput}
                >
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Clear Input</ListItemText>
                </MenuItem> */}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
    <AgentDialog onClose={handleAgentDialogClose} open={showAgentDialog} inputRef={props.inputRef} />
  </>;
};

export default MessageInputSettings;