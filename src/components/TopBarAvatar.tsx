import IconButton from "@mui/material/IconButton";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, useContext } from "react";
import { Box, Tooltip, Avatar, Grid } from "@material-ui/core";
import { AppContext, EMPTY_AUTH } from "../store/AppContext";
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";
import Typography from "@mui/material/Typography";

const TopBarAvatar = () => {
  const context = useContext(AppContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOutClick = () => {
    context.changeAuth(EMPTY_AUTH);
    handleClose();
    context.showSnack("Signed Out");
  }

  const navigate = useNavigate();
  if (context.auth.token === "") {
    return <>
      <Button color="inherit" onClick={() => navigate("/signin")}>Signin</Button>
      <Button color="inherit" onClick={() => navigate("/signup")}>Signup</Button>
    </>;
  }
  return <Box sx={{ flexGrow: 0 }}>
    <Tooltip title={context.auth.loggedEmail}>
      <IconButton onClick={handleMenu} >
        <Avatar alt={context.auth.loggedEmail} src="">
          {context.auth.loggedEmail.charAt(0).toUpperCase() + context.auth.loggedEmail.charAt(1).toLowerCase()}
        </Avatar>
      </IconButton>
    </Tooltip>
    <Menu
      id="menu-appbar"
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItem onClick={handleSignOutClick}>
        <Grid container>
          <Grid item xs={4}>
          <LoginIcon />
          </Grid>
          <Grid item xs={4}>
          <Typography> Sign Out </Typography>
          </Grid>
        </Grid>
      </MenuItem>
    </Menu>
  </Box>
}
export default TopBarAvatar;