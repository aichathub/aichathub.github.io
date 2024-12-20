import { Grid, Tooltip } from "@material-ui/core";
import AddIcon from "@mui/icons-material/Add";
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import LightModeIcon from '@mui/icons-material/LightMode';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from "@mui/icons-material/Menu";
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete, Avatar, CircularProgress, FilterOptionsState, TextField } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { createFilterOptions } from '@mui/material/Autocomplete';
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
import { useMatch, useNavigate, useParams, useSearchParams } from "react-router-dom";
import logo from "../images/logo.png";
import { DummyPostModel } from "../models/DummyPostModel";
import { PostModel } from "../models/PostModel";
import { AppContext, AutocompleteItem } from "../store/AppContext";
import { GUEST_EMAIL, GUEST_USERNAME } from "../util/constants";
import { chatgptReply, findPostsByAuthoremail, getPostByUsernameAndPid, insertMessage, insertPostByUsernameAndTitle } from "../util/db";
import AutocompleteComponent from "./AutocompleteComponent";
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
  boxShadow: "none",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: 0
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: 0
    })
  })
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
  const isOnSearchPage = useMatch("/search");
  const [searchParams,] = useSearchParams();
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [isSearchAutocompleteOpen, setIsSearchAutocompleteOpen] = useState(false);
  let hint = "";

  const [searchBoxText, setSearchBoxText] = useState((isOnSearchPage && searchParams.get("q")) ? searchParams.get("q") : "");
  const shouldHide = !context.shouldDisplayTopLeftBar || (!isAtTop && !props.open && document.activeElement !== inputRef.current);

  // const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (!username || !postid) return;
    getPostByUsernameAndPid(username, postid).then(response => {
      if (response.message !== "SUCCESS") return;
      const p = response.result;
      setPost(p);
    });
  }, [username, postid]);

  const navigate = useNavigate();
  const handleNewPostBtnClick = () => {
    if (context.loggedUser === "") {
      context.showSnack("You need to sign in to create a new post.");
      return;
    }
    context.setOpenNewPostForm(true);
  };
  const [posts, setPosts] = useState<PostModel[]>([]);
  const handleNewPostFormClose = () => {
    context.setOpenNewPostForm(false);
  };
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const removePost = (post: PostModel) => {
    setPosts(posts.filter(p => p.username !== post.username || p.pid !== post.pid));
  }
  useEffect(() => {
    if (!context.auth.loggedEmail) return;
    context.setIsLeftBarPostLoading(true);
    findPostsByAuthoremail(context.auth.loggedEmail).then((response) => {
      context.setIsLeftBarPostLoading(false);
      if (response.message !== "SUCCESS") {
        context.showSnack(response.message);
        return;
      }
      const posts = response.result;
      if (posts) {
        setPosts(posts);

        // Add posts to search box autocomplete
        const autocompleteItems: AutocompleteItem[] = [];
        posts.forEach(x => {
          if (!autocompleteItems.find(y => y.keyword === x.title)) {
            autocompleteItems.push({ keyword: x.title, type: x.isprivate ? "post-private" : "post", pid: x.pid, username: x.username });
          }
        });
        context.setSearchBoxAutoComplete(autocompleteItems);
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
  const handleFAQBtnClick = () => {
    const url = "https://aichathub.app/s/n1vd";
    window.open(url, "_blank");
  }
  const newPostForm = <NewPostDialog handleClose={handleNewPostFormClose} />
  let menuBtnHint = "Sidebar";
  const platform = (navigator?.platform || 'unknown').toLowerCase();
  // If the client is windows, hint is "CTRL b"
  if (platform.indexOf("win") > -1 || platform.indexOf("linux") > -1) {
    menuBtnHint += " (CTRL+B)";
    hint = "CTRL+SHIFT+F";
  }
  // If the client is mac, hint is "CMD b"
  if (platform.indexOf("mac") > -1) {
    menuBtnHint += " (CMD+B)";
    hint = "CMD+SHIFT+F";
  }
  const [searchBarShortcutHint, setSearchBarShortcutHint] = useState(hint);
  const keyDownHandler = (event: KeyboardEvent) => {
    const { key } = event;
    const isCtrlKey = event.ctrlKey || event.metaKey;
    const isShiftKey = event.shiftKey;
    const isF = key.toLowerCase() === "f";
    if (isCtrlKey && isShiftKey && isF) {
      inputRef.current!.focus();
      setIsAtTop(true);
    }
  };
  useEffect(() => {
    const onScroll = () => {
      const tolerance = 5;
      setIsAtTop(window.scrollY <= tolerance);
    }
    window.removeEventListener("scroll", onScroll);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("keydown", keyDownHandler);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const OPTIONS_LIMIT = 5;
  const defaultFilterOptions = createFilterOptions();

  const filterOptions = (options: unknown[], state: FilterOptionsState<unknown>) => {
    const { inputValue } = state;
    const result = defaultFilterOptions(options, state).slice(0, OPTIONS_LIMIT);
    if (inputValue.trim() !== "") {
      result.push(inputValue);
    }
    if (inputValue.trim() !== "" && !inputValue.trim().startsWith("@") && !inputValue.trim().startsWith("!")) {
      result.push("!Ask: " + inputValue);
    }

    if (inputValue.trim() !== "") {
      result.push({ type: "python", keyword: inputValue } as AutocompleteItem);
    }
    return result;
  };

  const handleAskBtnClick = async (question: string) => {
    setIsAskingQuestion(true);
    const response = await insertPostByUsernameAndTitle(
      context.loggedUser ? context.loggedUser : GUEST_USERNAME,
      question,
      context.auth.token,
      [],
      context.loggedUser ? true : false,
      []
    );
    if (response.message !== "SUCCESS") {
      context.showSnack("INSERT POST: " + response.message);
      setIsAskingQuestion(false);
      return;
    }
    const post = response.result;
    const insertResponse = await insertMessage({
      username: context.loggedUser ? context.loggedUser : GUEST_USERNAME,
      pid: post.pid,
      content: question,
      token: context.auth.token,
      triggerAI: false,
      authoremail: context.auth.loggedEmail ? context.auth.loggedEmail : GUEST_EMAIL,
      triggerPython: false
    });
    if (insertResponse.message !== "SUCCESS") {
      context.showSnack("INSERT MESSAGE: " + insertResponse.message);
      setIsAskingQuestion(false);
      return;
    }
    context.showSnack("Your question has been posted. The AI will reply to you soon.");
    const replyResponse = await chatgptReply(post.pid, post.username, context.auth.token, true);
    if (replyResponse.message.indexOf("ERROR") === -1) {
      for (let i = 0; i < 2; i++) {
        context.addDailyAIUsuage();
      }
    } else {
      context.showSnack("CHATREPLY: " + replyResponse.message);
      setIsAskingQuestion(false);
      return;
    }
    setIsAskingQuestion(false);
    context.setLastPostsRefresh(new Date());
    context.setMessages([]);
    navigate(`/${context.loggedUser ? context.loggedUser : GUEST_USERNAME}/${response.result.pid}`);
  }

  const redirectSearch = (str: string) => {
    if (str.startsWith("!Ask: ")) {
      const question = str.slice("!Ask: ".length);
      handleAskBtnClick(question);
    } else {
      navigate(`/search?q=${str}`);
      context.addLocalKeyword(str);
    }
  }

  const handleHardRefresh = async () => {
    // await removePostsFromCache(context.auth.loggedEmail);
    context.setLastPostsRefresh(new Date());
  }

  return (
    <Grid className={`${shouldHide ? classes.hide : classes.show}`}>
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
              onClick={() => {
                context.setCurPost(DummyPostModel);
                navigate("/");
                document.title = "AIChatHub";
              }}
            >
              <Avatar src={logo} className={(context.isLoadingMessages || (context.loggedUser && context.isLeftBarPostLoading)) ? classes.rotate : classes['rotate-slowstop']} />
            </IconButton>
          </Tooltip>
          <Tooltip title={searchBoxText ? "" : searchBarShortcutHint}>
            <Search sx={{ flexGrow: 1, marginTop: "5px" }}>
              <Autocomplete
                open={isSearchAutocompleteOpen}
                getOptionLabel={(option) => typeof option === "string" ? option : (option as AutocompleteItem).keyword}
                id="free-solo-demo"
                freeSolo
                filterOptions={filterOptions}
                options={context.searchBoxAutoComplete}
                autoComplete={true}
                value={searchBoxText}
                renderOption={(props, option) => {
                  let item: AutocompleteItem;
                  if (typeof option === "string") {
                    item = { keyword: option as string, type: "plaintext" };
                  } else {
                    item = option as AutocompleteItem;
                  }
                  return <AutocompleteComponent
                    key={`${item.type} ${item.keyword}`}
                    item={item}
                    setSearchBoxText={setSearchBoxText}
                    setIsSearchAutocompleteOpen={setIsSearchAutocompleteOpen}
                    redirectSearch={redirectSearch}
                    renderProps={props}
                  />;
                }}
                onChange={(event, value) => {
                  event?.preventDefault();
                  if (!value) return;
                  if (typeof value === "string") {
                    redirectSearch(value);
                  } else {
                    const item = value as AutocompleteItem;
                    if (item.type === "post" || item.type === "post-private") {
                      context.setIsFirstLoad(true);
                      context.setMessages([]);
                      context.setIsLoadingMessages(true);
                      navigate(`/${item.username}/${item.pid}`);
                    } else if (item.type === "python") {
                      navigator.clipboard.writeText(localStorage.getItem("lastExecutionResult") || "");
                      context.showSnack("Copied result to clipboard");
                    }
                  }
                  setIsSearchAutocompleteOpen(false);
                  if (typeof value === "string") {
                    setSearchBoxText(value);
                  } else {
                    const item = value as AutocompleteItem;
                    setSearchBoxText(item.keyword);
                  }
                  setTimeout(() => {
                    inputRef.current!.blur();
                  }, 100);
                }}
                renderInput={(params) => (
                  <TextField {...params}
                    value={searchBoxText}
                    onFocus={event => {
                      event.target.select();
                      setSearchBarShortcutHint("");
                    }}
                    onBlur={() => {
                      setSearchBarShortcutHint(hint);
                      setIsSearchAutocompleteOpen(false);
                    }}
                    inputRef={inputRef}
                    placeholder={"Search/Ask anything…"}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        isAskingQuestion ? <CircularProgress size={20} color="inherit" /> : <SearchIcon sx={{ marginRight: "5px" }} />
                      )
                    }}
                    onFocusCapture={() => {
                      setIsSearchAutocompleteOpen(true);
                    }}
                  // onKeyPress={(e) => {
                  //   setIsSearchAutocompleteOpen(true);
                  //   if (e.key === 'Enter') {
                  //     if (!searchBoxText) return;
                  //     navigate(`/search?q=${searchBoxText}`);
                  //     context.addLocalKeyword(searchBoxText);
                  //   }
                  // }}
                  />
                )}
              />
            </Search>
          </Tooltip>
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
        transitionDuration={0}
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
        {
          context.auth.loggedEmail &&
          <>
            <Typography variant="h6" noWrap sx={{ marginLeft: "10px", marginBottom: "15px", minHeight: "25px" }}>
              Your Posts
              <Tooltip title="Hard Refresh">
                <RefreshIcon
                  onClick={handleHardRefresh}
                  style={{ marginLeft: "10px", cursor: "pointer", transform: "translateY(5px)" }}
                />
              </Tooltip>
            </Typography>
            <Divider />
          </>
        }
        {context.isLeftBarPostLoading && context.auth.loggedEmail && (
          <List
            sx={{
              maxHeight: window.innerHeight - 200,
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {Array.from(new Array(posts.length === 0 ? 7 : posts.length)).map((_, index) => (
              <LeftBarPostItem key={Math.random() + "_leftbarpostitem_" + index} post={DummyPostModel} removePost={removePost} isLoading={true} />
            ))
            }
          </List>
        )}
        {!context.isLeftBarPostLoading && context.auth.loggedEmail && posts.length > 0 && (
          <List sx={{
            maxHeight: window.innerHeight - 200,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {posts.map((post) => (
              <LeftBarPostItem key={post.pid + "/" + post.username} post={post} removePost={removePost} />
            ))}
          </List>
        )}
        {!context.isLeftBarPostLoading && context.auth.loggedEmail && (!posts || posts.length === 0) && (
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
          {!context.auth.loggedEmail && <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText
                primary={"Sign In"}
                onClick={() => {
                  const curUrl = window.location.href;
                  window.location.href = "/signin?redirect=" + curUrl;
                }}
              />
            </ListItemButton>
          </ListItem>}
          {!context.auth.loggedEmail &&
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <AppRegistrationIcon />
                </ListItemIcon>
                <ListItemText
                  primary={"Sign Up"}
                  onClick={() => {
                    const curUrl = window.location.href;
                    window.location.href = "/signup?redirect=" + curUrl;
                  }}
                />
              </ListItemButton>
            </ListItem>}
          {context.auth.loggedEmail &&
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
            </ListItem>}
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {
                  context.darkMode ? <LightModeIcon /> : <DarkModeIcon />
                }
              </ListItemIcon>
              <ListItemText
                primary={context.darkMode ? "Light Theme" : "Dark Theme"}
                onClick={handleThemeBtnClick}
              />
            </ListItemButton>
          </ListItem>
          {/* <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {
                  <QuestionAnswerIcon />
                }
              </ListItemIcon>
              <ListItemText
                primary={"FAQ"}
                onClick={handleFAQBtnClick}
              />
            </ListItemButton>
          </ListItem> */}
        </List>
      </Drawer>
      {context.openNewPostForm && newPostForm}
    </Grid>
  );
};
export default TopLeftBar;
