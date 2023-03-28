import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Message from "./Message";
import Grid from "@material-ui/core/Grid";
import { useState, useEffect, useContext, useCallback } from "react";
import { MessageModel } from "../models/MessageModel";
import { MessageInput } from "./MessageInput";
import { io, Socket } from "socket.io-client";
import TopLeftBar from "./TopLeftBar";
import DrawerHeader from "./DrawerHeader";
import ScrollButton from "./ScrollButton";
import { AppContext } from "../store/AppContext";
import EmptyCard from "./EmptyCard";
import { LocalPostModel } from "../models/LocalPostModel";
import { useParams } from "react-router-dom";
import { getMessagesByUsernameAndPid, getPostByUsernameAndPid } from "../util/db";
import CircularProgress from '@mui/material/CircularProgress';
import { Tooltip, Typography } from "@material-ui/core";
import ErrorIcon from '@mui/icons-material/Error';
import { PostModel } from "../models/PostModel";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LockIcon from '@mui/icons-material/Lock';
import StarButton from "./StarButton";
import { backendServer } from "../util/constants";
import QRButton from "./QRButton";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  // padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const ChatAppEdit = () => {
  const context = useContext(AppContext);
  const pagePostId = context.pagePostId;
  const post = context.getPostById(pagePostId);
  // const messages = post ? post.messages : [];
  const { username, postid } = useParams();
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [curPost, setCurPost] = useState<PostModel | undefined>(undefined);
  const [reloadInterval, setReloadInterval] = useState<NodeJS.Timeout | undefined>(undefined);

  const reloadMessage = () => {
    if (messages.length === 0) {
      context.setIsLoadingMessages(true);
    }
    console.log(username, postid);
    if (!username || !postid) return;
    getMessagesByUsernameAndPid(username, postid, context.auth.token).then(response => {
      console.log(response);
      context.setIsLoadingMessages(false);
      if (response.message !== "SUCCESS") {
        context.setDoesPostExist(false);
        return;
      }
      context.setDoesPostExist(true);
      const msgs = response.result;
      const msgmodels: MessageModel[] = [];
      for (let i = 0; i < msgs.length; i++) {
        msgmodels.push({
          mid: msgs[i].mid,
          content: msgs[i].content,
          sender: msgs[i].authoremail ? msgs[i].authoremail : "ai",
          time: msgs[i].createdate,
          authorusername: msgs[i].authorusername,
        });
      }
      const oldMsgLength = messages.length === 0 ? Infinity : messages.length;
      setMessages(msgmodels);
      // if there is new message and the scroll is at the bottom, scroll to the bottom
      if (msgs.length > oldMsgLength && window.scrollY + window.innerHeight >= document.body.offsetHeight) {
        setTimeout(() => {
          window.scroll({
            top: document.body.offsetHeight,
            behavior: "smooth",
          });
        }, 300);
      }

      if (context.isSendingMessage) {
        const aiReplied = msgs.length > oldMsgLength && !msgs[msgs.length - 1].authoremail;
        if (aiReplied) {
          context.setIsSendingMessage(false);
        }
      }

      if (msgs && msgs[msgs.length - 1].content.toLowerCase().includes("@ai")) {
        context.setIsSendingMessage(true);
      }
    });
  };

  const addMessage = (newMsg: MessageModel) => {
    setMessages(prevState => [...prevState, newMsg]);
    setTimeout(() => {
      window.scroll({
        top: document.body.offsetHeight,
        behavior: "smooth",
      });
    }, 300);
  };

  const [open, setOpen] = useState(false);
  const handleDrawerOpen = () => {
    context.setTopLeftBarOpen(true);
  };

  const handleDrawerClose = () => {
    context.setTopLeftBarOpen(false);
  };

  useEffect(() => {
    if (context.isSendingMessage) {
      const interval = setInterval(() => {
        reloadMessage();
      }, 500);
      setReloadInterval(interval);
    } else {
      if (reloadInterval) clearInterval(reloadInterval);
      setReloadInterval(undefined);
    }
  }, [context.isSendingMessage]);

  useEffect(() => {
    console.log(username, postid);
    document.title = `${username}/${postid}`;
    context.setIsLoadingMessages(true);
    reloadMessage();
    if (!username || !postid) return;
    getPostByUsernameAndPid(username, postid, context.auth.token).then(response => {
      if (response.message !== "SUCCESS") {
        return;
      }
      setCurPost(response.result);
    });
  }, [username, postid, context.auth.token]);

  useEffect(() => {
    if (!username || !postid) return;
    getPostByUsernameAndPid(username, postid, context.auth.token).then(response => {
      if (response.message !== "SUCCESS") {
        return;
      }
      setCurPost(response.result);
    });
  }, [context.lastPostsRefresh]);

  useEffect(() => {
    reloadMessage();
  }, []);
  let bodyContent = <></>;

  if (context.isLoadingMessages) {
    bodyContent = <Box sx={{ textAlign: "center", marginTop: "20%" }}><CircularProgress color="inherit" /></Box>;
  } else if (!context.doesPostExist) {
    bodyContent = (<Box sx={{ textAlign: "center" }}>
      <ErrorIcon sx={{ fontSize: 100 }} />
      <Typography variant="h5" component="h5" gutterBottom>
        Opps!
      </Typography>
      <Typography variant="h6" component="h6" gutterBottom>
        {username}/{postid} does not exist
      </Typography>
    </Box>);
  } else if (messages.length === 0) {
    bodyContent = (<Box sx={{ textAlign: "center" }}>
      <EmptyCard title={post ? post.title : ""} />
    </Box>);
  } else {
    bodyContent = (
      <Grid container>
        {messages.map((x, index) => (
          <Message key={index} message={x} typeEffect={index === messages.length - 1 && x.sender === 'ai'} />
        ))}
      </Grid>
    );
  }
  let icon = <ChatBubbleOutlineIcon fontSize="small" />;
  if (context.doesPostExist && curPost && curPost.isprivate) {
    icon = <Tooltip title="This is a private post" arrow>
      <LockIcon fontSize="small" />
    </Tooltip>;
  }
  return (
    <>
      <Box sx={{ display: "flex", marginBottom: "30px" }}>
        <CssBaseline />
        <TopLeftBar
          open={context.topLeftBarOpen}
          handleDrawerClose={handleDrawerClose}
          handleDrawerOpen={handleDrawerOpen}
        />
        <Main open={open}>
          <DrawerHeader />
          {context.doesPostExist &&
            <Box sx={{ display: "flex", marginLeft: "40px", marginTop: "15px" }}>
              {icon}
              <Box sx={{ marginTop: "-7px", marginLeft: "5px" }}>
                <Typography variant="h6" component="h6" gutterBottom>
                  {curPost ? curPost.title : ""}
                </Typography>
              </Box>
              {curPost &&
                <Box style={{ marginTop: "-5px", marginLeft: "25px" }}>
                  <StarButton post={curPost!} />
                </Box>
              }
              {curPost &&
                <Box style={{ marginTop: "-4px", marginLeft: "25px" }}>
                  <QRButton post={curPost!} />
                </Box>
              }
            </Box>
          }
          {bodyContent}
          <Box
            sx={{
              flexGrow: 1,
              justifyContent: "center",
              display: "flex",
              mb: 2,
            }}
          ></Box>
        </Main>
      </Box>
      <footer
        style={{
          color: "gray",
          position: "fixed",
          bottom: 0,
          width: "100%",
          minHeight: "30px",
          paddingLeft: (open ? drawerWidth : 0) + "px",
        }}
      >
        <ScrollButton />
        {context.loggedUser !== "" && curPost?.authoremail === context.auth.loggedEmail && context.doesPostExist && <MessageInput addMessage={addMessage} reloadMessage={reloadMessage} />}
      </footer>
    </>
  );
};
export default ChatAppEdit;