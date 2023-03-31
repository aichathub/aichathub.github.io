import { Box, Tooltip } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { Button, SxProps, TextField, Theme } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { deepOrange } from "@mui/material/colors";
import Paper from "@mui/material/Paper";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import Timeago from "react-timeago";
import remarkGfm from "remark-gfm";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import { generateColor } from "../util/avatarColor";
import { editMessage } from "../util/db";
import CodeBlock from "./CodeBlock";
import LikeDislikePanel from "./LikeDislikePanel";
import MessageWrapper from "./MessageWrapper";

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
  const avatarColor = props.message.sender === "ai" ? deepOrange[500] : generateColor(props.message.sender);
  if (props.message.sender === "ai") {
    avatarName = "AI";
  } else {
    avatarName = props.message.sender.substring(0, 2).toUpperCase();
  }
  const context = useContext(AppContext);
  const tooLong = props.message.content.length > 2000;
  const messages = props.message.content.split("```");
  const trimmedMsg = props.message.content.substring(0, 200).split("```");
  const [showFullMsg, setShowFullMsg] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMsg, setEditedMsg] = useState(props.message.content);
  const justNow = (date: Date) => {
    if (date === undefined) return false;
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    return diff < 1000 * 60;
  };

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
      props.message.content = editedMsg;
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
  let sx: SxProps<Theme> = {
    my: 1,
    mx: "0%",
    p: 2,
    minWidth: "100%",
    paddingLeft: 5,
  };
  const anchorElement = <span id={"m" + props.message.mid} style={{ position: "absolute", transform: "translateY(-30vh)" }} />;
  const anchor = window.location.hash.slice(1);
  const shouldHighlight = anchor === "m" + props.message.mid;
  const isSpeaking = props.message.mid === context.speakingMid && context.speakingMid !== -1;
  const isMobile = window.innerWidth <= 600;
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
      borderLeft: isMobile ? "2px solid red" : "4px solid red"
    }
  }
  return (
    <StyledPaper
      sx={sx}
    // className={props.message.shouldHighlight ? classes['high-light'] : ""}
    >
      {anchorElement}
      <Grid container wrap="nowrap" spacing={2} style={{ marginBottom: "2px" }}>
        <Grid item xs={10}>
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
                    <Typography variant="overline" color={props.message.sender === 'ai' ? "darkred" : "common.grey"}>
                      @{props.message.sender === 'ai' ? "AI" : props.message.authorusername}
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
                children={props.message.content}
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
                  }
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
          {props.message.sender === "ai" && <LikeDislikePanel message={props.message} />}
        </Grid>
      </Grid>
    </StyledPaper>
  );
};
export default Message;
