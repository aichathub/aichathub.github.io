import { Avatar, Box, Grid } from "@material-ui/core";
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';
import ErrorIcon from '@mui/icons-material/Error';
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from '@mui/icons-material/Person';
import { ListItemIcon, ListItemText } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from "@mui/material/Typography";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext, EMPTY_AUTH } from "../store/AppContext";
import { generateColor } from "../util/avatarColor";

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
    context.setLoggedUser("");
    handleClose();
    context.showSnack("Signed Out");
  }

  const navigate = useNavigate();
  if (context.auth.token === "") {
    return <Box sx={{ flexGrow: 0 }}>
      <IconButton onClick={handleMenu} >
        <Avatar>
          <PersonIcon />
        </Avatar>
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left"
        }}
      >
        <MenuItem onClick={() => {
          window.location.href = "/signin?redirect=" + window.location.href;
        }}>
          <ListItemIcon>
            <LoginIcon />
          </ListItemIcon>
          <ListItemText>Sign in</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          window.location.href = "/signup?redirect=" + window.location.href;
        }}>
          <ListItemIcon>
            <AppRegistrationIcon />
          </ListItemIcon>
          <ListItemText>Sign up</ListItemText>
        </MenuItem>
      </Menu>
    </Box>;
  }
  const avatarColor = generateColor(context.loggedUser);
  return <Box sx={{ flexGrow: 0 }}>
    <IconButton onClick={handleMenu} >
      <Avatar
        alt={context.auth.loggedEmail}
        src=""
        style={{ background: avatarColor }}
      >
        {context.loggedUser.substring(0, 2).toUpperCase()}
      </Avatar>
    </IconButton>
    <Menu
      id="menu-appbar"
      anchorEl={anchorEl}
      keepMounted
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right"
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left"
      }}
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItem>
        <Grid container>
          <Grid item xs={4}>
            {context.dailyAILimit === context.dailyAIUsuage ? <ErrorIcon /> : <DataSaverOffIcon />}
          </Grid>
          <Grid item xs={12}>
            <Typography> @AI (CHATGPT) Daily Limit: {context.dailyAIUsuage} / {context.dailyAILimit} </Typography>
          </Grid>
        </Grid>
      </MenuItem>
      <MenuItem onClick={handleSignOutClick}>
        <Grid container>
          <Grid item xs={4}>
            <LoginIcon />
          </Grid>
          <Grid item xs={12}>
            <Typography> Sign Out </Typography>
          </Grid>
        </Grid>
      </MenuItem>
    </Menu>
  </Box>
}
export default TopBarAvatar;