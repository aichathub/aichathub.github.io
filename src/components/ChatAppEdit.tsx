import { Tooltip, Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ErrorIcon from '@mui/icons-material/Error';
import LockIcon from '@mui/icons-material/Lock';
import Box from "@mui/material/Box";
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from "@mui/material/CssBaseline";
import { styled } from "@mui/material/styles";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import { getMessagesByUsernameAndPid, getPostByUsernameAndPid } from "../util/db";
import DrawerHeader from "./DrawerHeader";
import EmptyCard from "./EmptyCard";
import Message from "./Message";
import { MessageInput } from "./MessageInput";
import QRButton from "./QRButton";
import ScrollButton from "./ScrollButton";
import StarButton from "./StarButton";
import TopLeftBar from "./TopLeftBar";

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
  const [reloadInterval, setReloadInterval] = useState<NodeJS.Timeout | undefined>(undefined);

  const reloadMessage = () => {
    if (context.messages.length === 0) {
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
          editdate: msgs[i].editdate,
        });
      }
      const oldMsgLength = context.messages.length === 0 ? Infinity : context.messages.length;
      if (msgs.length > context.messages.length) {
        context.setMessages(msgmodels);
      }
      // if there is new message and the scroll is at the bottom, scroll to the bottom
      if (!context.isFirstLoad && msgs.length > oldMsgLength && window.scrollY + window.innerHeight >= document.body.offsetHeight) {
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

      context.setIsFirstLoad(false);
    });
  };

  const addMessage = (newMsg: MessageModel) => {
    context.addMessage(newMsg);
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
      context.setCurPost(response.result);
    });
  }, [username, postid, context.auth.token]);

  useEffect(() => {
    if (!username || !postid) return;
    getPostByUsernameAndPid(username, postid, context.auth.token).then(response => {
      if (response.message !== "SUCCESS") {
        return;
      }
      context.setCurPost(response.result);
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
  } else if (context.messages.length === 0) {
    bodyContent = (<Box sx={{ textAlign: "center" }}>
      <EmptyCard title={post ? post.title : ""} />
    </Box>);
  } else {
    bodyContent = (
      <Grid container>
        {context.messages.map((x, index) => (
          <Message key={index} message={x} typeEffect={index === context.messages.length - 1 && x.sender === 'ai'} />
        ))}
      </Grid>
    );
  }
  let icon = <ChatBubbleOutlineIcon fontSize="small" />;
  if (context.doesPostExist && context.curPost && context.curPost.isprivate) {
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
                  {context.curPost ? context.curPost.title : ""}
                </Typography>
              </Box>
              {context.curPost &&
                <Box style={{ marginTop: "-5px", marginLeft: "25px" }}>
                  <StarButton post={context.curPost!} />
                </Box>
              }
              {context.curPost &&
                <Box style={{ marginTop: "-4px", marginLeft: "25px" }}>
                  <QRButton post={context.curPost!} />
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
        {context.loggedUser !== "" && context.curPost?.authoremail === context.auth.loggedEmail && context.doesPostExist && <MessageInput addMessage={addMessage} reloadMessage={reloadMessage} />}
      </footer>
    </>
  );
};
export default ChatAppEdit;
