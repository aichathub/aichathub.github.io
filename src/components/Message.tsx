import { Box, Tooltip } from "@material-ui/core";
import { Button, Grid, SxProps, TextField, Theme } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { deepOrange } from "@mui/material/colors";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import Timeago from "react-timeago";
import remarkGfm from "remark-gfm";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import { generateColor } from "../util/avatarColor";
import { editMessage } from "../util/db";
import CodeBlock from "./CodeBlock";
import LikeDislikePanel from "./LikeDislikePanel";
import classes from "./Message.module.css";
import MessageWrapper from "./MessageWrapper";
import UserLink from "./UserLink";

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  maxWidth: 400,
  color: theme.palette.text.primary,
}));

const theme = createTheme({
  typography: {
    fontSize: 12,
  },
});

const Message: React.FC<{
  message: MessageModel;
  typeEffect?: boolean;
}> = (props) => {
  let avatarName = "You";
  const isAI = props.message.authorusername === undefined;
  const avatarColor = isAI ? deepOrange[500] : generateColor(props.message.authorusername);
  if (props.message.authorusername === undefined) {
    avatarName = "AI";
  } else {
    avatarName = props.message.authorusername.substring(0, 2).toUpperCase();
  }
  const context = useContext(AppContext);
  const tooLong = props.message.content.length > 2000;
  const messages = props.message.content.split("```");
  const trimmedMsg = props.message.content.substring(0, 200).split("```");
  const [showFullMsg, setShowFullMsg] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMsg, setEditedMsg] = useState(props.message.content);
  const justNow = (date: Date, seconds = 60) => {
    if (date === undefined) return false;
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    return diff < 1000 * seconds;
  };
  const shouldAnimate = isAI && props.message.justSent;
  const [content, setContent] = useState(shouldAnimate ? "" : props.message.content);
  const toMessageView = (messages: string[]) => {
    const body = messages.map((content, index) =>
      index % 2 === 0 ? (
        content.split("\n").map((line, lineIdx) => {
          return <Typography
            key={index + "," + lineIdx}
            paragraph
            style={{ paddingTop: "2px" }}
          >
            {line}
          </Typography>
        }
        )
      ) : (
        <CodeBlock key={index} content={content} />
      )
    );
    return <Grid style={{ paddingLeft: 5 }}>
      {body}
    </Grid>;
  };
  const messagesView = toMessageView(messages);
  const trimmedMessagesView = <Grid style={{
    WebkitMaskImage: "-webkit-gradient(linear, left top, left bottom, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)))"
  }}>{toMessageView(trimmedMsg)}</Grid>;
  let timeText = <Timeago date={props.message.time} title="" />;
  // if under one minute, just show Now
  if (justNow(props.message.time)) {
    timeText = <Typography variant="overline" color="common.grey">Now</Typography>;
  }
  const hasRightToEdit = context.auth.loggedEmail === props.message.sender;
  const editor = <>
    <TextField multiline
      value={editedMsg}
      style={{ width: "100%" }}
      onChange={(e) => {
        setEditedMsg(e.target.value);
      }}
    />
    <Button variant="text" onClick={() => {
      setContent(editedMsg);
      props.message.editdate = new Date();
      editMessage(props.message.mid, context.auth.loggedEmail, context.auth.token, editedMsg).then(res => {
        context.showSnack(res.message);
      });
      setIsEditing(false);
    }}>Save</Button>
    <Button variant="text" onClick={() => {
      setIsEditing(false);
    }}>Cancel</Button>
  </>;
  const anchorElement = <span id={"m" + props.message.mid} style={{ position: "absolute", transform: "translateY(-30vh)" }} />;
  const anchor = window.location.hash.slice(1);
  const shouldHighlight = anchor === "m" + props.message.mid;
  const isSpeaking = props.message.mid === context.speakingMid && context.speakingMid !== -1;
  const isMobile = window.innerWidth <= 600;
  const isExtraSmall = window.innerWidth < 375;
  let sx: SxProps<Theme> = {
    my: 1,
    mx: "0%",
    p: 2,
    minWidth: "100%",
    paddingLeft: isMobile ? 2 : 10,
  };
  if (isSpeaking) {
    sx = {
      ...sx,
      backgroundColor: context.darkMode ? "rgba(39,30,20,0.7)" : "rgba(254,251,195,0.7)",
      borderLeft: isMobile ? "2px solid green" : "4px solid green"
    }
  } else if (shouldHighlight) {
    sx = {
      ...sx,
      backgroundColor: context.darkMode ? "rgba(39,30,20,0.7)" : "rgba(254,251,195,0.7)",
      borderLeft: isMobile ? "2px solid #d30" : "4px solid red"
    }
  }
  useEffect(() => {
    if (!shouldAnimate || context.shouldStopTypingMessage) return;
    context.setIsTypingMessage(true);
    let autoScroll = true;
    context.setIsAutoScrolling(true);
    // Cancel autoScroll if user scrolled up
    window.addEventListener("scroll", () => {
      if (window.scrollY < document.body.offsetHeight - window.innerHeight) {
        autoScroll = false;
        context.setIsAutoScrolling(false);
      }
    });
    const interval = setInterval(() => {
      setContent(prev => {
        const curLen = prev.length;
        if (curLen === 5) {
          autoScroll = true;
        }
        if (context.shouldStopTypingMessage || curLen >= props.message.content.length) {
          clearInterval(interval);
          context.setIsTypingMessage(false);
          return prev;
        }
        if (autoScroll) {
          window.scroll({
            top: document.body.offsetHeight,
          });
        }
        return props.message.content.substring(0, curLen + 1);
      })
    }, 50);
    return () => clearInterval(interval);
  }, [context.shouldStopTypingMessage]);
  return (
    <StyledPaper
      sx={sx}
    // className={props.message.shouldHighlight ? classes['high-light'] : ""}
    >
      {anchorElement}
      <Grid container wrap="nowrap" spacing={2} style={{ marginBottom: "2px" }}>
        <Grid item xs={!isExtraSmall && isMobile ? 12 : 10}>
          <MessageWrapper message={props.message} isEditing={isEditing} setIsEditing={setIsEditing}>
            {/* <CopyWrapper content={props.message.content} isEditing={isEditing} setIsEditing={setIsEditing} hasRightToEdit={hasRightToEdit}> */}
            <Grid container spacing={2}>
              <Grid item>
                <Avatar sx={{ bgcolor: avatarColor }}>{avatarName}</Avatar>
              </Grid>
              <Grid
                item
                style={{
                  position: "relative",
                }}
              >
                <Box
                  style={{
                    position: "relative",
                  }}
                >
                  <ThemeProvider theme={theme}>
                    <Tooltip
                      title={
                        new Date(props.message.time).toLocaleDateString() +
                        " " +
                        new Date(props.message.time)
                          .toLocaleTimeString()
                          .slice(0, -3) // Don't show seconds
                      }
                      arrow
                      placement="top"
                    >
                      <Typography variant="overline" color="common.grey">
                        {timeText}
                      </Typography>
                    </Tooltip>
                  </ThemeProvider>
                </Box>
                <Box
                  style={{
                    position: "relative",
                    marginTop: "-10px",
                  }}
                >
                  <ThemeProvider theme={theme}>
                    <Typography variant="overline" color={"common.grey"}>
                      {(props.message.authorusername !== "python" && props.message.authorusername) && <UserLink username={props.message.authorusername} />}
                      {props.message.authorusername === undefined && "@AI"}
                      {props.message.authorusername === "python" && "@Python"}
                    </Typography>
                  </ThemeProvider>
                </Box>
              </Grid>
            </Grid>
          </MessageWrapper>
          {/* </CopyWrapper> */}
          {!isEditing &&
            <>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                children={content + ((content.length < props.message.content.length && context.isTypingMessage) ? "▌" : "")}
                linkTarget="_blank"
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return !inline ? (
                      <CodeBlock content={String(children).replace(/\n$/, '')} />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  a({ node, className, children, ...props }) {
                    return (
                      <span className={classes.mdlink}>
                        <a className={className} {...props}>
                          {children}
                        </a>
                      </span>
                    )
                  },
                }}
              />
              {props.message.editdate && <Typography variant="overline" color="common.grey" sx={{ fontStyle: 'italic' }}>(Edited)</Typography>}
            </>
          }
          {/* {!isEditing && !tooLong && messagesView}
          {tooLong &&
            <>
              {!isEditing && !showFullMsg && trimmedMessagesView}
              {!isEditing && showFullMsg && messagesView}
              {!isEditing && !showFullMsg && <Button variant="text" onClick={() => { setShowFullMsg(true) }}>Read More</Button>}
              {!isEditing && showFullMsg && <Button variant="text" onClick={() => { setShowFullMsg(false) }}>Read Less</Button>}
            </>
          } */}
          {isEditing && editor}
          {props.message.authorusername === undefined && <LikeDislikePanel message={props.message} />}
        </Grid>
      </Grid>
    </StyledPaper>
  );
};
export default Message;
