import { Tooltip, Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ErrorIcon from '@mui/icons-material/Error';
import ForkLeftIcon from '@mui/icons-material/ForkLeft';
import LockIcon from '@mui/icons-material/Lock';
import Box from "@mui/material/Box";
import CircularProgress from '@mui/material/CircularProgress';
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import { getMessagesByUsernameAndPid, getPostByUsernameAndPid } from "../util/db";
import EmptyCard from "./EmptyCard";
import Message from "./Message";
import PostLink from "./PostLink";
import QRButton from "./QRButton";
import StarButton from "./StarButton";

const ChatAppEdit = () => {
  const context = useContext(AppContext);
  const pagePostId = context.pagePostId;
  const post = context.getPostById(pagePostId);
  const { username, postid } = useParams();
  const [reloadInterval, setReloadInterval] = useState<NodeJS.Timeout | undefined>(undefined);

  const reloadMessage = () => {
    if (context.messages.length === 0) {
      context.setIsLoadingMessages(true);
    }
    const noAuth = !(localStorage.getItem("auth"));
    const contextHasAuth = context.auth && context.auth.token && context.auth.token.trim() !== "";
    if (!username || !postid || (!noAuth && !contextHasAuth)) return;
    getMessagesByUsernameAndPid(username, postid, context.auth.token).then(response => {
      context.setIsLoadingMessages(false);
      if (response.message !== "SUCCESS") {
        context.setDoesPostExist(false);
        context.showSnack("GET MESSAGES: " + response.message);
        return;
      }
      context.setDoesPostExist(true);
      const msgs = response.result;
      const msgmodels: MessageModel[] = [];
      for (let i = 0; i < msgs.length; i++) {
        msgmodels.push({
          mid: msgs[i].mid,
          content: msgs[i].content,
          // sender: msgs[i].authoremail ? msgs[i].authoremail : "ai",
          time: msgs[i].createdate,
          authorusername: msgs[i].authorusername,
          editdate: msgs[i].editdate,
        });
      }
      const oldMsgLength = context.messages.length === 0 ? Infinity : context.messages.length;
      // if there is new message and the scroll is at the bottom, scroll to the bottom
      if (!context.isFirstLoad && msgs.length > oldMsgLength && window.scrollY + window.innerHeight >= document.body.offsetHeight) {
        setTimeout(() => {
          window.scroll({
            top: document.body.offsetHeight,
            behavior: "smooth",
          });
        }, 300);
      }
      if (!context.isFirstLoad && msgs.length > oldMsgLength && msgmodels[msgmodels.length - 1].sender === 'ai' && context.sendTriggerAIVoice) {
        msgmodels[msgmodels.length - 1].shouldSpeak = true;
      }
      if (msgs.length > context.messages.length) {
        context.setMessages(msgmodels);
      }
      if (context.isSendingMessage) {
        const aiReplied = msgs.length > oldMsgLength && !msgs[msgs.length - 1].authoremail;
        if (aiReplied) {
          context.setIsSendingMessage(false);
        }
      }

      context.setIsFirstLoad(false);
      context.setIsInitializing(false);
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
    context.setIsLoadingMessages(true);
    reloadMessage();
    const noAuth = !localStorage.getItem("auth");
    if (!username || !postid || (!noAuth && !context.auth)) return;
    getPostByUsernameAndPid(username, postid, context.auth.token).then(response => {
      if (response.message !== "SUCCESS") {
        return;
      }
      context.setCurPost(response.result);
      document.title = `${response.result.title} · ${username}/${postid}`;
    });
  }, [username, postid, context.auth.token]);

  useEffect(() => {
    if (!username || !postid) return;
    context.setIsLeftBarPostLoading(true);
    getPostByUsernameAndPid(username, postid, context.auth.token).then(response => {
      context.setIsLeftBarPostLoading(false);
      if (response.message !== "SUCCESS") {
        return;
      }
      context.setCurPost(response.result);
    });
  }, [context.lastPostsRefresh]);

  useEffect(() => {
    reloadMessage();
  }, []);

  useEffect(() => {
    reloadMessage();
  }, [context.lastMessagesRefresh]);

  let bodyContent = <></>;

  if (context.isLoadingMessages) {
    bodyContent = <Box sx={{ textAlign: "center", marginTop: "20%" }}><CircularProgress color="inherit" /></Box>;
  } else if (!context.doesPostExist) {
    bodyContent = (<Box sx={{ textAlign: "center" }}>
      <ErrorIcon sx={{ fontSize: 100 }} />
      <Typography variant="h5" component="h5" gutterBottom>
        Oops!
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
      <Grid container style={{ marginBottom: "20px" }} >
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
      {context.doesPostExist &&
        <>
          <Box sx={{ display: "flex", marginLeft: "40px" }}>
            <Tooltip title="Refresh" arrow>
              <Box sx={{ marginTop: "-7px" }}>
                <PostLink username={context.curPost?.username!} pid={context.curPost?.pid!} />
              </Box>
            </Tooltip>
          </Box>
          <Box sx={{ display: "flex", marginLeft: "40px", marginTop: "2px" }}>
            {icon}
            <Box sx={{ marginTop: "-7px", marginLeft: "5px" }}>
              <Typography variant="h6" component="h6" gutterBottom>
                {context.curPost ? context.curPost.title : ""}
              </Typography>
            </Box>
            {context.curPost &&
              <Box style={{ marginTop: "-5px", marginLeft: "25px" }}>
                <StarButton post={context.curPost} canClick={true} />
              </Box>
            }
            {context.curPost &&
              <Box style={{ marginTop: "-4px", marginLeft: "25px" }}>
                <QRButton url={window.location.href.split('#')[0]} />
              </Box>
            }
          </Box>

          {context.curPost && context.curPost.forkedfromauthorusername && context.curPost.forkedfrompid &&
            <Box sx={{ display: "flex", marginLeft: "40px", marginTop: "-15px" }}>
              <Box style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
              }} >
                {
                  <ForkLeftIcon fontSize="small" style={{ transform: "translateY(-2px)" }} />
                }
                <span style={{ fontSize: "17px", marginRight: "3px" }}>
                  Forked from
                </span>
                <PostLink username={context.curPost.forkedfromauthorusername} pid={context.curPost.forkedfrompid} />
              </Box></Box>
          }
        </>
      }
      {bodyContent}
    </>
  );
};
export default ChatAppEdit;
