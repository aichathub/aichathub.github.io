import { Checkbox, ClickAwayListener, FormControlLabel, Grow, IconButton, MenuItem, MenuList, Paper, Popper, Tooltip } from "@material-ui/core";
import SettingsIcon from '@mui/icons-material/Settings';
import { useState, useContext } from "react";
import { AppContext } from "../store/AppContext";

const MessageInputSettings = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const context = useContext(AppContext);
  return <>
    <Tooltip title="Settings" arrow>
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
                    control={<Checkbox checked={context.sendTriggerApi} onClick={context.toggleSendTriggerApi} />}
                  />
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