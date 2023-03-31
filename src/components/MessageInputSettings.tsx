import { ClickAwayListener, FormControlLabel, Grow, Tooltip } from "@material-ui/core";
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { Checkbox, IconButton, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import { useContext, useState } from "react";
import { AppContext } from "../store/AppContext";

const MessageInputSettings: React.FC<{
  inputText: string;
  setInputText: (inputText: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}> = (props) => {
  const triggerAI = props.inputText.indexOf("@ai") !== -1 || props.inputText.indexOf("@AI") !== -1;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const hasVoice = window.speechSynthesis.getVoices().length > 0;
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
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
  const handleClearInput = () => {
    if (triggerAI) {
      props.setInputText("@AI ");
    } else {
      props.setInputText("");
    }
    props.inputRef.current!.focus();
    handleClose();
  }
  const context = useContext(AppContext);
  return <>
    <Tooltip title="Settings" arrow placement="left-start">
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
                <MenuItem >
                  <FormControlLabel
                    label="AI Response"
                    control={<Checkbox checked={triggerAI} onClick={toggleTriggerAI} />}
                  />
                </MenuItem>
                {
                  hasVoice && (
                    <MenuItem >
                      <FormControlLabel
                        label="AI Voice"
                        control={<Checkbox checked={context.sendTriggerAIVoice} onClick={context.toggleSendTriggerAIVoice} />}
                      />
                    </MenuItem>
                  )
                }
                <MenuItem
                  onClick={handleClearInput}
                >
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Clear Input</ListItemText>
                </MenuItem>
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  </>;
};

export default MessageInputSettings;