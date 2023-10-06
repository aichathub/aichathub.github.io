import ForkLeftIcon from '@mui/icons-material/ForkLeft';
import { Backdrop, Box, Button, CircularProgress, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import { styled } from "@mui/material/styles";
import { Result } from '@zxing/library';
import React, { ReactNode, createContext, useCallback, useEffect, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { useMatch, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Alert from "../components/Alert";
import AuthInput from '../components/AuthInput';
import DrawerHeader from "../components/DrawerHeader";
import MainLoading from "../components/MainLoading";
import { MessageInput } from "../components/MessageInput";
import ScrollButton from "../components/ScrollButton";
import TopLeftBar from "../components/TopLeftBar";
import { LocalPostModel } from "../models/LocalPostModel";
import { MessageModel } from "../models/MessageModel";
import { PostModel } from "../models/PostModel";
import { TagModel } from "../models/TagModel";
import { backendServer } from "../util/constants";
import { findTopKSearch, forkPost, getCustomModelName, getDailyAILimit, getTags, getTodayAIUsage, verify } from "../util/db";
import useDidMountEffect from "../util/useDidMountEffect";

type AuthObj = {
  loggedEmail: string;
  token: string;
}

export type Agent = "gpt3.5" | "gpt4" | "python" | "yourmodel" | "none" | "llama70b";

type AppContextObj = {
  pagePostId: string;
  posts: LocalPostModel[];
  auth: AuthObj;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  sendTriggerAIVoice: boolean;
  loggedUser: string;
  lastPostsRefresh: Date;
  doesPostExist: boolean;
  starredPosts: PostModel[];
  tags: TagModel[];
  topLeftBarOpen: boolean;
  darkMode: boolean;
  curPost?: PostModel;
  messages: MessageModel[];
  isFirstLoad: boolean;
  speakingMid: number;
  lastMessagesRefresh: Date;
  isLeftBarPostLoading: boolean;
  searchBoxText: string;
  isInitializing: boolean;
  shouldDisplayTopLeftBar: boolean;
  dailyAIUsuage: number;
  dailyAILimit: number;
  isTypingMessage: boolean;
  shouldStopTypingMessage: boolean;
  isAutoScrolling: boolean;
  agent: Agent;
  yourmodelUrl: string;
  yourmodelName: string;
  isYourmodelConnected: boolean;
  searchBoxAutoComplete: string[];
  isForking: boolean;
  showLoadingBackdrop: boolean;
  showQrReader: boolean;

  setShowQrReader: (showQrReader: boolean) => void;
  setShowLoadingBackdrop: (showLoadingBackdrop: boolean) => void;
  addLocalKeyword: (keyword: string) => void;
  pingYourmodel: () => Promise<boolean>;
  setIsYourmodelConnected: (isYourmodelConnected: boolean) => void;
  setYourmodelName: (yourmodelName: string) => void;
  setYourmodelUrl: (yourmodelUrl: string) => void;
  setAgent: (agent: Agent) => void;
  setIsAutoScrolling: (isAutoScrolling: boolean) => void;
  setShouldStopTypingMessage: (shouldStopTypingMessage: boolean) => void;
  setIsTypingMessage: (isTypingMessage: boolean) => void;
  setDailyAILimit: (dailyAILimit: number) => void;
  setDailyAIUsuage: (dailyAIUsuage: number) => void;
  addDailyAIUsuage: () => void;
  setShouldDisplayTopLeftBar: (showDisplayTopLeftBar: boolean) => void;
  setIsInitializing: (isInitializing: boolean) => void;
  setSearchBoxText: (searchBoxText: string) => void;
  setIsLeftBarPostLoading: (isLeftBarPostLoading: boolean) => void;
  setLastMessagesRefresh: (lastMessagesRefresh: Date) => void;
  setSpeakingMid: (mid: number) => void;
  findNextMessage: (mid: number) => MessageModel | undefined;
  setIsFirstLoad: (isFirstLoad: boolean) => void;
  hideMessage: (messageId: number) => void;
  deleteMessage: (messageId: number) => void;
  setMessages: (messages: MessageModel[]) => void;
  setCurPost: (post: PostModel) => void;
  setDarkMode: (darkMode: boolean) => void;
  setTopLeftBarOpen: (open: boolean) => void;
  isPostStarred: (authoremail: string, pid: string) => boolean;
  setStarredPosts: (starredPosts: PostModel[]) => void;
  setDoesPostExist: (doesPostExist: boolean) => void;
  setLastPostsRefresh: (lastPostsRefresh: Date) => void;
  setIsSendingMessage: (isSendingMessage: boolean) => void;
  toggleSendTriggerAIVoice: () => void;
  setIsLoadingMessages: (isLoading: boolean) => void;
  changePagePostId: (postId: string) => void;
  getPostById: (postId: string) => LocalPostModel | undefined;
  addMessage: (newMsg: MessageModel) => void;
  addPost: (title: string) => void;
  updateSummary: (content: string) => void;
  changeAuth: (authObj: AuthObj) => void;
  deletePostById: (postId: string) => void;
  updatePost: (post: LocalPostModel) => void;
  showSnack: (message: string, action?: ReactNode) => void;
  setLoggedUser: (loggedUser: string) => void;
  navigateToPost: (url: string) => void;
};

export const EMPTY_AUTH = {
  loggedEmail: "",
  token: ""
} as AuthObj;

export const AppContext = createContext<AppContextObj>({
  pagePostId: "",
  auth: EMPTY_AUTH,
  posts: [],
  isLoadingMessages: false,
  sendTriggerAIVoice: false,
  isSendingMessage: false,
  loggedUser: "",
  lastPostsRefresh: new Date(),
  doesPostExist: false,
  starredPosts: [],
  tags: [],
  topLeftBarOpen: false,
  darkMode: false,
  curPost: undefined,
  messages: [],
  isFirstLoad: true,
  speakingMid: -1,
  lastMessagesRefresh: new Date(),
  isLeftBarPostLoading: false,
  searchBoxText: "",
  isInitializing: true,
  shouldDisplayTopLeftBar: true,
  dailyAILimit: 0,
  dailyAIUsuage: 0,
  isTypingMessage: false,
  shouldStopTypingMessage: false,
  isAutoScrolling: false,
  agent: "none",
  yourmodelUrl: "",
  yourmodelName: "",
  isYourmodelConnected: false,
  searchBoxAutoComplete: [],
  isForking: false,
  showLoadingBackdrop: false,
  showQrReader: false,

  setShowQrReader: () => { },
  setShowLoadingBackdrop: () => { },
  addLocalKeyword: () => { },
  pingYourmodel: () => Promise.resolve(false),
  setIsYourmodelConnected: () => { },
  setYourmodelName: () => { },
  setYourmodelUrl: () => { },
  setAgent: () => { },
  setIsAutoScrolling: () => { },
  setShouldStopTypingMessage: () => { },
  setIsTypingMessage: () => { },
  setDailyAILimit: () => { },
  setDailyAIUsuage: () => { },
  addDailyAIUsuage: () => { },
  setShouldDisplayTopLeftBar: () => { },
  setIsInitializing: () => { },
  setSearchBoxText: () => { },
  setIsLeftBarPostLoading: () => { },
  setLastMessagesRefresh: () => { },
  setSpeakingMid: () => { },
  findNextMessage: () => undefined,
  setIsFirstLoad: () => { },
  hideMessage: () => { },
  deleteMessage: () => { },
  setMessages: () => { },
  setCurPost: () => { },
  setDarkMode: () => { },
  setTopLeftBarOpen: () => { },
  isPostStarred: () => false,
  setStarredPosts: () => { },
  setDoesPostExist: () => { },
  setLastPostsRefresh: () => { },
  setIsSendingMessage: () => { },
  setIsLoadingMessages: () => { },
  changePagePostId: () => { },
  getPostById: () => undefined,
  addMessage: () => { },
  addPost: () => { },
  updateSummary: () => { },
  deletePostById: () => { },
  changeAuth: () => { },
  updatePost: () => { },
  showSnack: () => { },
  toggleSendTriggerAIVoice: () => { },
  setLoggedUser: () => { },
  navigateToPost: () => { },
});
const drawerWidth = 300;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  // padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: 0,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: 0,
    }),
    marginLeft: 0,
  }),
}));

const socket = io(backendServer);

export const AppContextProvider: React.FC<{ children: ReactNode }> = (
  props
) => {
  const [isSnackShown, setIsSnackShown] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [pagePostId, setPagePostId] = useState("chat");
  const [auth, setAuth] = useState<AuthObj>(EMPTY_AUTH);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [posts, setPosts] = useState<LocalPostModel[]>([]);
  let defaultTriggerAIVoice = false;
  if (localStorage.getItem("sendTriggerAIVoice") === "true") {
    defaultTriggerAIVoice = true;
  }
  const [sendTriggerAIVoice, setSendTriggerAIVoice] = useState(defaultTriggerAIVoice);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [loggedUser, setLoggedUser] = useState("");
  const [starredPosts, setStarredPosts] = useState<PostModel[]>([]);
  const [lastPostsRefresh, setLastPostsRefresh] = useState(new Date());
  const [doesPostExist, setDoesPostExist] = useState(false);
  const [tags, setTags] = useState<TagModel[]>([]);
  const [topLeftBarOpen, setTopLeftBarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [curPost, setCurPost] = useState<PostModel>();
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [speakingMid, setSpeakingMid] = useState(-1);
  const [lastMessagesRefresh, setLastMessagesRefresh] = useState(new Date());
  const [isLeftBarPostLoading, setIsLeftBarPostLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [shouldDisplayTopLeftBar, setShouldDisplayTopLeftBar] = useState(true);
  const [dailyAIUsuage, setDailyAIUsuage] = useState(0);
  const [dailyAILimit, setDailyAILimit] = useState(0);
  const [isTypingMessage, setIsTypingMessage] = useState(false);
  const [shouldStopTypingMessage, setShouldStopTypingMessage] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [agent, setAgent] = useState<Agent>((localStorage.getItem("agent") || "gpt3.5") as Agent);
  const [yourmodelUrl, setYourmodelUrl] = useState(localStorage.getItem("yourmodelUrl") || "");
  const [yourmodelName, setYourmodelName] = useState(localStorage.getItem("yourmodelName") || "");
  const [isYourmodelConnected, setIsYourmodelConnected] = useState(false);
  const [searchBoxAutoComplete, setSearchBoxAutoComplete] = useState<string[]>([]);
  const [isForking, setIsForking] = useState(false);
  const [snackAction, setSnackAction] = useState<ReactNode>(undefined);
  const [showLoadingBackdrop, setShowLoadingBackdrop] = useState(false);
  const [showQrReader, setShowQrReader] = useState(false);
  const [detectedSessionid, setDetectedSessionid] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(false);

  const isOnPostPage = useMatch("/:username/:postid");
  const hasRightToSendMsg = isOnPostPage && curPost && curPost.username === loggedUser;
  const isPostStarred = (authoremail: string, postId: string) => {
    // return starredPosts.filter(x => x.authoremail === authoremail && x.pid === postId).length > 0;
    return false;
  }
  const changeAuth = (authObj: AuthObj) => {
    localStorage.setItem("auth", JSON.stringify(authObj));
    setAuth(authObj);
  }
  const arePostsEmpty = () => {
    return !(posts && posts.length > 0);
  }
  const changePagePostId = (postId: string) => {
    setPagePostId(postId);
  };
  const getPostById = (postId: string, source = posts) => {
    const result = source.filter((x) => x.id === postId);
    if (result.length === 0) return undefined;
    return result[0];
  };
  const toggleSendTriggerApi = () => {
    setSendTriggerAIVoice(prevState => !prevState);
  }
  const deletePostById = (postId: string) => {
    setPosts((prevState) => prevState.filter(post => post.id !== postId));
  }
  const addMessage = (newMsg: MessageModel) => {
    setTimeout(() => {
      window.scroll({
        top: document.body.offsetHeight,
        behavior: "smooth",
      });
    }, 300);
    setMessages((prevState) => [...prevState, newMsg]);
  };
  const deleteMessage = (msgId: number) => {
    setMessages((prevState) => prevState.filter(x => x.mid !== msgId));
  }
  const hideMessage = (msgId: number) => {
    setMessages((prevState) => {
      const newmsgs: MessageModel[] = [];
      for (let i = 0; i < prevState.length; i++) {
        if (prevState[i].mid !== msgId) {
          newmsgs.push(messages[i]);
        } else {
          messages[i].isLoading = true;
          newmsgs.push(messages[i]);
        }
      }
      return newmsgs;
    });
  }
  const updateSummary = (newSummary: string) => {
    setPosts((prevState) => {
      const post = getPostById(pagePostId, prevState);
      if (!post) return prevState;
      const newPost = {
        ...post,
        summary: newSummary
      } as LocalPostModel;
      const result = [...prevState.filter((x) => x.id !== post.id), newPost];
      return result;
    });
  }
  const updatePost = (newPost: LocalPostModel) => {
    setPosts((prevState) => {
      return [...prevState.filter(x => x.id !== newPost.id), newPost];
    });
  }
  const titleToId = (title: string) => {
    return encodeURIComponent(title.replace(/\s+/g, "-").toLowerCase());
  };
  const addPost = (title: string) => {
    const id = titleToId(title);
    const newPost = {
      title: title,
      messages: [],
      id: id,
      summary: ""
    };
    setPosts(prevState => [...prevState, newPost]);
  };
  const showSnack = (message: string, action?: ReactNode) => {
    setIsSnackShown(true);
    setSnackAction(action);
    setSnackMessage(message);
  }
  const snackOnClose = () => {
    setIsSnackShown(false);
    setSnackMessage("");
  };
  const findNextMessage = (mid: number) => {
    const index = messages.findIndex(x => x.mid === mid);
    if (index === -1) return undefined;
    if (index === messages.length - 1) return undefined;
    return messages[index + 1];
  };
  const handleDrawerOpen = () => {
    setTopLeftBarOpen(true);
  };

  const handleDrawerClose = () => {
    setTopLeftBarOpen(false);
  };
  const addDailyAIUsuage = () => {
    setDailyAIUsuage(prev => +prev + 1);
  }
  const pingYourmodel = async () => {
    if (agent !== "yourmodel") return true;
    try {
      const name = await getCustomModelName(yourmodelUrl);
      setYourmodelName(name);
      setIsYourmodelConnected(true);
      return true;
    } catch (e) {
      setIsYourmodelConnected(false);
      return false;
    }
  }
  const refreshKeywords = (loggedUser?: string, token?: string) => {
    findTopKSearch(100, loggedUser, token).then(response => {
      if (response.message !== "SUCCESS") {
        showSnack(response.message);
        return;
      }
      const keywords: { keyword: string, from: "server" | "local" }[] = [];

      const localKeywords = localStorage.getItem("keywords");
      if (localKeywords) {
        const localKeywordsObj = JSON.parse(localKeywords) as string[];
        // Only care about the latest 3 local keywords
        const localKeywordsObjLatest = localKeywordsObj.slice(Math.max(localKeywordsObj.length - 3, 0));
        localKeywordsObjLatest.forEach(x => {
          if (!keywords.find(y => y.keyword === x)) {
            keywords.push({ keyword: x, from: "local" });
          }
        });
      }
      keywords.reverse();
      response.result.forEach((x: any) => {
        if (!keywords.find(y => y.keyword === x.keyword)) {
          keywords.push({ keyword: x.keyword, from: "server" });
        }
      });
      setSearchBoxAutoComplete(keywords.map(x => x.keyword));
    });
  }
  const addLocalKeyword = (keyword: string) => {
    if (keyword.startsWith("!")) return;
    const localKeywords = localStorage.getItem("keywords");
    if (localKeywords) {
      const localKeywordsObj = JSON.parse(localKeywords) as string[];
      localKeywordsObj.push(keyword);
      localStorage.setItem("keywords", JSON.stringify(localKeywordsObj));
    } else {
      localStorage.setItem("keywords", JSON.stringify([keyword]));
    }
    refreshKeywords(loggedUser, auth.token);
  }
  const navigateToPost = (url: string) => {
    setIsLoadingMessages(true);
    setIsFirstLoad(true);
    setMessages([]);
    setLastMessagesRefresh(new Date());
    setCurPost(undefined);
    navigate(url);
  }
  const contextValue = {
    pagePostId: pagePostId,
    auth: auth,
    posts: posts,
    isLoadingMessages: isLoadingMessages,
    sendTriggerAIVoice: sendTriggerAIVoice,
    isSendingMessage: isSendingMessage,
    loggedUser: loggedUser,
    lastPostsRefresh: lastPostsRefresh,
    doesPostExist: doesPostExist,
    starredPosts: starredPosts,
    tags: tags,
    topLeftBarOpen: topLeftBarOpen,
    darkMode: darkMode,
    curPost: curPost,
    messages: messages,
    isFirstLoad: isFirstLoad,
    speakingMid: speakingMid,
    lastMessagesRefresh: lastMessagesRefresh,
    isLeftBarPostLoading: isLeftBarPostLoading,
    isInitializing: isInitializing,
    shouldDisplayTopLeftBar: shouldDisplayTopLeftBar,
    dailyAIUsuage: dailyAIUsuage,
    dailyAILimit: dailyAILimit,
    isTypingMessage: isTypingMessage,
    shouldStopTypingMessage: shouldStopTypingMessage,
    isAutoScrolling: isAutoScrolling,
    agent: agent,
    yourmodelUrl: yourmodelUrl,
    yourmodelName: yourmodelName,
    isYourmodelConnected: isYourmodelConnected,
    searchBoxAutoComplete: searchBoxAutoComplete,
    isForking: isForking,
    showLoadingBackdrop: showLoadingBackdrop,
    showQrReader: showQrReader,

    setShowQrReader: setShowQrReader,
    setShowLoadingBackdrop: setShowLoadingBackdrop,
    addLocalKeyword: addLocalKeyword,
    pingYourmodel: pingYourmodel,
    setIsYourmodelConnected: setIsYourmodelConnected,
    setYourmodelName: setYourmodelName,
    setYourmodelUrl: setYourmodelUrl,
    setAgent: setAgent,
    setIsAutoScrolling: setIsAutoScrolling,
    setShouldStopTypingMessage: setShouldStopTypingMessage,
    setIsTypingMessage: setIsTypingMessage,
    addDailyAIUsuage: addDailyAIUsuage,
    setDailyAILimit: setDailyAILimit,
    setDailyAIUsuage: setDailyAIUsuage,
    setShouldDisplayTopLeftBar: setShouldDisplayTopLeftBar,
    setIsInitializing: setIsInitializing,
    setIsLeftBarPostLoading: setIsLeftBarPostLoading,
    setLastMessagesRefresh: setLastMessagesRefresh,
    setSpeakingMid: setSpeakingMid,
    findNextMessage: findNextMessage,
    setIsFirstLoad: setIsFirstLoad,
    deleteMessage: deleteMessage,
    hideMessage: hideMessage,
    setMessages: setMessages,
    setCurPost: setCurPost,
    setDarkMode: setDarkMode,
    setTopLeftBarOpen: setTopLeftBarOpen,
    isPostStarred: isPostStarred,
    setStarredPosts: setStarredPosts,
    setDoesPostExist: setDoesPostExist,
    setLastPostsRefresh: setLastPostsRefresh,
    setIsSendingMessage: setIsSendingMessage,
    setIsLoadingMessages: setIsLoadingMessages,
    toggleSendTriggerAIVoice: toggleSendTriggerApi,
    changePagePostId: changePagePostId,
    getPostById: getPostById,
    addMessage: addMessage,
    addPost: addPost,
    updateSummary: updateSummary,
    deletePostById: deletePostById,
    changeAuth: changeAuth,
    updatePost: updatePost,
    showSnack: showSnack,
    setLoggedUser: setLoggedUser,
    navigateToPost: navigateToPost,
  } as AppContextObj;
  const keyDownHandler = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    const isCtrlKey = event.ctrlKey || event.metaKey;
    const isB = key.toLowerCase() === "b";
    if (isCtrlKey && isB) {
      if (topLeftBarOpen) {
        setTopLeftBarOpen(false);
      } else {
        setTopLeftBarOpen(true);
      }
      event.preventDefault();
    }
  }, [topLeftBarOpen]);
  useEffect(() => {
    window.addEventListener("keydown", keyDownHandler);
    return () => window.removeEventListener("keydown", keyDownHandler);
  }, [keyDownHandler]);
  useEffect(() => {
    if (arePostsEmpty()) return;
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);
  useDidMountEffect(() => {
    if (sendTriggerAIVoice) {
      localStorage.setItem("sendTriggerAIVoice", "true");
    } else {
      localStorage.setItem("sendTriggerAIVoice", "false");
    }
  }, [sendTriggerAIVoice]);
  useEffect(() => {
    const authFromLocal = localStorage.getItem("auth");
    if (authFromLocal) {
      const authObj = JSON.parse(authFromLocal);
      verify(authObj).then(response => {
        if (response.message === "SUCCESS") {
          changeAuth(JSON.parse(authFromLocal));
          setLoggedUser(response.loggedUser.username);
          // getStarredPosts(response.loggedUser.username).then(r => {
          //   if (r.message === "SUCCESS") {
          //     setStarredPosts(r.result);
          //   }
          // });
          // showSnack("Welcome Back, " + response.loggedUser.username);
        } else {
          showSnack("Session Expired. Please Signin Again");
          localStorage.removeItem("auth");
        }
      });
    }
  }, []);
  useEffect(() => {
    const postsObj = localStorage.getItem("posts");
    if (!postsObj) return;
    const posts = JSON.parse(postsObj)! as LocalPostModel[];
    setPosts(posts);
  }, []);
  useEffect(() => {
    getTags().then(response => {
      if (response.message === "SUCCESS") {
        setTags(response.result);
      }
    });
  }, []);

  useEffect(() => {
    function checkDarkMode() {
      const darkMode = localStorage.getItem("darkMode");

      if (darkMode == null) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setDarkMode(true);
        } else {
          setDarkMode(false);
        }
      } else if (darkMode === "true") {
        setDarkMode(true);
      } else {
        setDarkMode(false);
      }
    }

    window.addEventListener('storage', checkDarkMode)

    return () => {
      window.removeEventListener('storage', checkDarkMode)
    }
  }, []);

  useEffect(() => {
    if (isLoadingMessages)
      return;
    const anchor = window.location.hash.slice(1);
    if (anchor) {
      const anchorEl = document.getElementById(anchor);
      if (anchorEl) {
        anchorEl.scrollIntoView();
      }
    }
  }, [isLoadingMessages]);

  useEffect(() => {
    if (!loggedUser) return;
    getTodayAIUsage(loggedUser, auth.token).then(response => {
      if (response.message !== "SUCCESS") {
        showSnack(response.message);
        return;
      }
      setDailyAIUsuage(response.result);
    });
    getDailyAILimit().then(response => {
      if (response.message !== "SUCCESS") {
        showSnack(response.message);
        return;
      }
      setDailyAILimit(response.result);
    });
  }, [loggedUser]);

  useEffect(() => {
    localStorage.setItem("agent", agent);
  }, [agent]);

  useEffect(() => {
    localStorage.setItem("yourmodelUrl", yourmodelUrl);
    pingYourmodel();
  }, [yourmodelUrl]);

  useEffect(() => {
    localStorage.setItem("yourmodelName", yourmodelName);
  }, [yourmodelName]);

  useEffect(() => {
    refreshKeywords();
  }, []);

  useEffect(() => {
    refreshKeywords(loggedUser, auth.token);
  }, [loggedUser, auth.token]);

  useEffect(() => {
    const onScroll = () => {
      const tolerance = 50;
      setIsAtBottom(window.innerHeight + window.scrollY + tolerance >= document.documentElement.scrollHeight);
    }
    window.removeEventListener("scroll", onScroll);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getSeverity = (message: string) => {
    if (message.toLowerCase().indexOf("error") !== -1) return "error";
    if (message.toLowerCase().indexOf("success") !== -1) return "success";
    return "info";
  }

  const navigate = useNavigate();

  const handleSigninClick = () => {
    window.location.href = "/signin?redirect=" + window.location.href;
  }

  const handleSignupClick = () => {
    window.location.href = "/signup?redirect=" + window.location.href;
  }

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleSigninClick}>
        SIGNIN
      </Button>
      <Button color="secondary" size="small" onClick={handleSignupClick}>
        SIGNUP
      </Button>
    </React.Fragment>
  );

  const handleAskFollowupClick = () => {
    if (loggedUser === "") {
      showSnack("Join for free to ask follow-ups", action);
      return;
    }
    if (!curPost) {
      showSnack("Error: Please select a post first");
      return;
    }
    setIsForking(true);
    forkPost(curPost.username, curPost.pid, auth.loggedEmail, auth.token).then((response) => {
      setLastPostsRefresh(new Date());
      showSnack("FORKED: " + response.message);
      if (response.message === "SUCCESS") {
        const result = response.result as PostModel;
        setMessages([]);
        navigate(`/${loggedUser}/${result.pid}`);
      }
      setIsForking(false);
    });
  }

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const showInputMessage = hasRightToSendMsg && !isLoadingMessages;
  const showAskFollowupButton = !showInputMessage && isOnPostPage && curPost && isAtBottom;

  const mainBody = <Box sx={{ display: isInitializing ? "none" : "flex", marginBottom: "30px" }}>
    <CssBaseline />
    <TopLeftBar
      open={topLeftBarOpen}
      handleDrawerClose={handleDrawerClose}
      handleDrawerOpen={handleDrawerOpen}
    />
    <Main open={topLeftBarOpen}>
      <DrawerHeader />
      {props.children}
    </Main>
    <footer
      style={{
        color: "gray",
        position: "fixed",
        bottom: 0,
        width: "100%",
        minHeight: "30px",
        paddingLeft: (topLeftBarOpen ? drawerWidth : 0) + "px",
      }}
    >
      {!showAskFollowupButton && <ScrollButton />}
      {showInputMessage && <MessageInput username={isOnPostPage.params.username!} postid={isOnPostPage.params.postid!} addMessage={addMessage} reloadMessage={() => {
        setLastMessagesRefresh(new Date());
      }} />}
      {showAskFollowupButton && <Box textAlign="center" style={{ marginBottom: "5px" }}>
        {isForking ? <CircularProgress size={20} color="inherit" style={{ marginBottom: "-2px" }} /> : <ForkLeftIcon fontSize="small" style={{ marginBottom: "-2px" }} />}
        <Button variant="text" color="error" onClick={handleAskFollowupClick}>
          Ask follow-up questions
        </Button>
      </Box>}
    </footer>
  </Box>;

  const loadingBackdrop = <Backdrop
    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
    open={showLoadingBackdrop}
  >
    <CircularProgress color="inherit" />
  </Backdrop>;


  const authorize = (sessionid: string) => {
    sessionid = sessionid.toLowerCase();
    socket.emit("authorize", {
      sessionid: sessionid,
      token: auth.token,
      loggedEmail: auth.loggedEmail
    });
    socket.on("authorize", (data) => {
      showSnack(data.message);
      if (data.message === "SUCCESS") {
        setShowQrReader(false);
        setDetectedSessionid("");
      }
    });
  }

  const onQRReaderResult = (result?: Result | undefined | null) => {
    if (result) {
      showSnack("Detected QR Text... Trying to autorize...");
      const url = result.getText();
      const regExp = /^.*authorize\/(.*)/;
      const match = url.match(regExp);
      if (match && match.length > 1) {
        setDetectedSessionid(match[1]);
        authorize(match[1]);
      } else {
        showSnack("ERROR: QR content is not valid");
      }
    }
  };

  const qrReader = <Backdrop
    sx={{ color: '#fff' }}
    open={showQrReader}
    onClick={() => { setShowQrReader(false); }}
  >
    {showQrReader &&
      <>
        <QrReader
          constraints={{ facingMode: "environment" }}
          onResult={onQRReaderResult}
          containerStyle={{
            width: "300px",
            position: "absolute",
            top: "calc(50% - 150px)",
            left: "0",
            right: "0",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
        <AuthInput
          style={{ position: "absolute", top: "calc(50% + 150px)", background: (darkMode ? "black" : "white") }}
          callback={(sessionid) => {
            authorize(sessionid);
          }}
          initialCode={detectedSessionid}
        />
      </>
    }</Backdrop>;

  return (
    <AppContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        {
          !snackAction ?
            <Snackbar open={isSnackShown} autoHideDuration={4000} onClose={snackOnClose}>
              <Alert onClose={snackOnClose} severity={getSeverity(snackMessage)} sx={{ width: '100%' }}>
                {snackMessage}
              </Alert>
            </Snackbar> :
            <Snackbar open={isSnackShown} message={snackMessage} autoHideDuration={4000} onClose={snackOnClose} action={action} />
        }
        {isInitializing && <MainLoading darkMode={darkMode} />}
        {mainBody}
        {loadingBackdrop}
        {qrReader}
      </ThemeProvider>
    </AppContext.Provider>
  );
};
