import { Tooltip, Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ErrorIcon from '@mui/icons-material/Error';
import ForkLeftIcon from '@mui/icons-material/ForkLeft';
import LockIcon from '@mui/icons-material/Lock';
import { Skeleton } from "@mui/material";
import Box from "@mui/material/Box";
import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DummyMessageModel } from "../models/DummyMessageModel";
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
          sendernickname: msgs[i].sendernickname
        });
      }
      const oldMsgLength = context.messages.length === 0 ? Infinity : context.messages.length;
      // if there is new message and the scroll is at the bottom, scroll to the bottom
      if (!context.isFirstLoad && msgs.length > oldMsgLength && window.scrollY + window.innerHeight >= document.body.offsetHeight) {
        msgmodels[msgmodels.length - 1].justSent = true;

        setTimeout(() => {
          window.scroll({
            top: document.body.offsetHeight,
          });
        }, 300);
      }
      if (!context.isFirstLoad && msgs.length > oldMsgLength && msgmodels[msgmodels.length - 1].authorusername === undefined && context.sendTriggerAIVoice) {
        msgmodels[msgmodels.length - 1].shouldSpeak = true;
      }
      if (msgs.length > context.messages.length || (context.messages.length && context.messages[context.messages.length - 1].mid === -1)) {
        context.setShouldStopTypingMessage(false);
        context.setMessages(msgmodels);
        if (context.justForked) {
          setTimeout(() => {
            window.scroll({
              top: document.body.offsetHeight,
            });
          }, 300);
          context.setJustForked(false);
        }
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
    reloadMessage();
    const noAuth = !localStorage.getItem("auth");
    if (!username || !postid || (!noAuth && !context.auth)) return;
    getPostByUsernameAndPid(username, postid, context.auth.token).then(response => {
      if (response.message !== "SUCCESS") {
        return;
      }
      context.setCurPost(response.result);
    });
  }, [context.lastMessagesRefresh]);

  useEffect(() => {
    getPostByUsernameAndPid(username ? username : "", postid ? postid : "", context.auth.token).then(response => {
      if (response.message !== "SUCCESS") {
        return;
      }
      const samePost = JSON.stringify(response.result) === JSON.stringify(context.curPost);
      if (!samePost) {
        context.setCurPost(response.result);
        context.setIsSendingMessage(false);
      }
    });
  }, [context.lastPostsRefresh, context.justForked]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    // Cancel autoScroll if user scrolled up
    window.addEventListener("scroll", () => {
      const tolerate = 50;
      if (window.scrollY + tolerate >= document.body.offsetHeight - window.innerHeight) {
        context.setIsAutoScrolling(false);
      } else if (context.isTypingMessage && !context.isAutoScrolling) {
        context.setIsAutoScrolling(true);
      }
    });
  }, []);

  let bodyContent = <></>;

  if (context.isLoadingMessages) {
    bodyContent = (
      <Grid container style={{ marginBottom: "27px" }} >
        {
          [1, 2, 3, 4, 5, 6, 7].map((width) => (
            <Message key={"t_" + width} message={DummyMessageModel} typeEffect={false} isLoading={true} />
          ))
        }
      </Grid>
    );
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
      <Grid container style={{ marginBottom: "27px" }} >
        {context.messages.map((x, index) => (
          <Message
            key={x.mid}
            message={x}
            typeEffect={index === context.messages.length - 1 && x.sender === 'ai'}
            isPythonRuntime={index + 1 < context.messages.length && context.messages[index + 1].sendernickname?.toUpperCase() === "PYTHON RUNTIME"}
          />
        ))}
        {context.isSendingMessage && <Message message={DummyMessageModel} typeEffect={false} isLoading={true} />}
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
      {<>
        <Box sx={{ display: "flex", marginLeft: "40px", marginTop: "20px" }}>
          <Tooltip title="Refresh" arrow>
            <Box sx={{ marginTop: "-7px" }}>
              {
                (context.doesPostExist && context.curPost?.username) ? <PostLink username={context.curPost?.username!} pid={context.curPost?.pid!} /> : <Skeleton variant="text" width={100} />
              }
            </Box>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", marginLeft: "40px", marginTop: "2px" }}>
          {icon}
          <Box sx={{ marginTop: "-7px", marginLeft: "5px" }}>
            <Typography variant="h6" component="h6" gutterBottom>
              {(context.curPost && context.curPost.title) ? context.curPost.title : <Skeleton width={90} />}
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
