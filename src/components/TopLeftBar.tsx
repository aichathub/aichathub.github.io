import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { styled, useTheme, alpha } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import DrawerHeader from "./DrawerHeader";
import AddIcon from "@mui/icons-material/Add";
import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../store/AppContext";
import { Grid, Tooltip } from "@material-ui/core";
import classes from "./TopLeftBar.module.css";
import LeftBarPostItem from "./LeftBarPostItem";
import TopBarAvatar from "./TopBarAvatar";
import NewPostDialog from "./NewPostDialog";
import { findPostsByAuthoremail, getPostByUsernameAndPid } from "../util/db";
import { PostModel } from "../models/PostModel";
import { useNavigate } from "react-router-dom";
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import { useParams } from "react-router-dom";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from '@mui/icons-material/Home';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const drawerWidth = 240;

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
        sx={{ bgcolor: "white", color: "black" }}
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
          <Search sx={{ flexGrow: 1 }}>
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
        </Typography>
        <Divider />
        {posts.length > 0 && (
          <List>
            {posts.map((post) => (
              <LeftBarPostItem post={post} />
            ))}
          </List>
        )}
        {!posts || posts.length === 0 && (
          <List>
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
        </List>
      </Drawer>
      {openNewPostForm && newPostForm}
    </Grid>
  );
};
export default TopLeftBar;
