import { Grid, Tooltip } from "@material-ui/core";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import HomeIcon from '@mui/icons-material/Home';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from "@mui/icons-material/Menu";
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from "@mui/icons-material/Search";
import { CircularProgress } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { alpha, styled, useTheme } from "@mui/material/styles";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PostModel } from "../models/PostModel";
import { AppContext } from "../store/AppContext";
import { findPostsByAuthoremail, getPostByUsernameAndPid } from "../util/db";
import DrawerHeader from "./DrawerHeader";
import LeftBarPostItem from "./LeftBarPostItem";
import NewPostDialog from "./NewPostDialog";
import TopBarAvatar from "./TopBarAvatar";
import classes from "./TopLeftBar.module.css";

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const drawerWidth = 300;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  boxShadow: "none",
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto"
  }
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    borderRadius: "10px",
    border: '1px solid #ccc',
    [theme.breakpoints.up("sm")]: {
      width: window.innerWidth * 0.5,
      // "&:focus": {
      // width: window.innerWidth,
      // width: "70ch"
      // }
    }
  }
}));

const TopLeftBar: React.FC<{
  handleDrawerOpen: () => void;
  handleDrawerClose: () => void;
  open: boolean;
}> = (props) => {
  const theme = useTheme();
  const context = useContext(AppContext);
  const { username, postid } = useParams();
  const [post, setPost] = useState<PostModel | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (!username || !postid) return;
    getPostByUsernameAndPid(username, postid).then(response => {
      if (response.message !== "SUCCESS") return;
      const p = response.result;
      console.log("[client]: post loaded, ", p);
      setPost(p);
    });
  }, [username, postid]);
  const [openNewPostForm, setOpenNewPostForm] = useState(false);
  const navigate = useNavigate();
  const handleNewPostBtnClick = () => {
    if (context.loggedUser === "") {
      navigate("/signin");
      return;
    }
    setOpenNewPostForm(true);
  };
  const [posts, setPosts] = useState<PostModel[]>([]);
  const handleNewPostFormClose = () => {
    setOpenNewPostForm(false);
  };
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // const controlNavbar = () => {
  //   if (typeof window !== "undefined") {
  //     if (document.body.scrollTop > 100 && window.scrollY > lastScrollY && !props.open) {
  //       // if scroll down hide the navbar
  //       setShow(false);
  //     } else {
  //       // if scroll up show the navbar
  //       setShow(true);
  //     }

  //     // remember current page location to use in the next move
  //     setLastScrollY(window.scrollY);
  //   }
  // };

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     window.addEventListener("scroll", controlNavbar);

  //     // cleanup function
  //     return () => {
  //       window.removeEventListener("scroll", controlNavbar);
  //     };
  //   }
  // }, [lastScrollY]);

  useEffect(() => {
    console.log("[client]: start loading posts");
    findPostsByAuthoremail(context.auth.loggedEmail).then((response) => {
      const posts = response.result;
      if (posts) {
        console.log("[client]: posts loaded, ", posts);
        setPosts(posts);
      }
    });
    if (context.auth.loggedEmail === "") {
      setPosts([]);
    }
  }, [context.auth.loggedEmail, context.lastPostsRefresh]);

  const handleThemeBtnClick = () => {
    context.setDarkMode(!context.darkMode);
    localStorage.setItem("darkMode", (!context.darkMode).toString());
  };
  const newPostForm = <NewPostDialog handleClose={handleNewPostFormClose} />
  let menuBtnHint = "Sidebar";
  const platform = (navigator?.platform || 'unknown').toLowerCase();
  // If the client is windows, hint is "CTRL b"
  if (platform.indexOf("win") > -1) {
    menuBtnHint += " (CTRL+B)";
  }
  // If the client is mac, hint is "CMD b"
  if (platform.indexOf("mac") > -1) {
    menuBtnHint += " (CMD+B)";
  }
  return (
    <Grid className={`${show ? classes.show : classes.hide}`}>
      <AppBar
        position="fixed"
        open={props.open}
        sx={!context.darkMode ? { bgcolor: "white", color: "black" } : {}}
      >
        <Toolbar variant="dense">
          <Tooltip title={menuBtnHint} arrow>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={props.handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(props.open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={"Home page"} arrow>
            <IconButton
              color="inherit"
              // onClick={() => { window.location.href = "/"; }}
              onClick={() => { navigate("/"); }}
              edge="start"
              sx={{ mr: 2, ...(props.open && { display: "none" }) }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
          {/* <Typography variant="h6" noWrap component="div">
            {post && post.title}
          </Typography> */}
          <Search sx={{ flexGrow: 0 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
              onChange={(e) => { setSearchText(e.target.value); }}
              value={searchText}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/search?q=${searchText}`);
                  // write your functionality here
                }
              }}
            />
          </Search>
          <div style={{ flexGrow: 1 }} />
          <TopBarAvatar />
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={props.open}
      >
        <DrawerHeader>
          <IconButton onClick={props.handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Typography variant="h6" noWrap sx={{ marginLeft: '5px' }}>
          Your Posts
          <RefreshIcon
            onClick={() => { context.setLastPostsRefresh(new Date()); }}
            style={{ marginLeft: "10px", cursor: "pointer", transform: "translateY(5px)" }}
          />
        </Typography>
        <Divider />
        {context.isLeftBarPostLoading && (
          <List
            sx={{
              maxHeight: 300
            }}
          >
            <CircularProgress size={30} color="inherit" sx={{ marginLeft: '45%' }} />
          </List>
        )}
        {!context.isLeftBarPostLoading && posts.length > 0 && (
          <List sx={{
            maxHeight: window.innerHeight - 200,
            overflow: 'auto'
          }}>
            {posts.map((post) => (
              <LeftBarPostItem post={post} />
            ))}
          </List>
        )}
        {!posts || posts.length === 0 && (
          <List
            sx={{
              maxHeight: 300
            }}
          >
            <Tooltip title="You haven't created any post yet. Click `New Post` to create a new one!">
              <EmojiPeopleIcon sx={{ marginLeft: '45%' }} fontSize="small" />
            </Tooltip>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontStyle: 'italic', marginLeft: '25%' }}>
              No post yet
            </Typography>
          </List>
        )}
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText
                primary={"New Post"}
                onClick={handleNewPostBtnClick}
              />
            </ListItemButton>

          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {
                  context.darkMode ? <LightModeIcon /> : <DarkModeIcon />
                }
              </ListItemIcon>
              <ListItemText
                primary={context.darkMode ? "Light Theme" : "Dark Theme (Beta)"}
                onClick={handleThemeBtnClick}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      {openNewPostForm && newPostForm}
    </Grid>
  );
};
export default TopLeftBar;
