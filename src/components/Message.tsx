import Grid from "@material-ui/core/Grid";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { deepOrange, deepPurple } from "@mui/material/colors";
import { MessageModel } from "../models/MessageModel";
import Timeago from "react-timeago";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CodeBlock from "./CodeBlock";
import { Box, Tooltip } from "@material-ui/core";
import CopyWrapper from "./CopyWrapper";
import Typewriter from 'react-ts-typewriter';
import { GUEST_EMAIL } from "../util/constants";
import { useContext, useState } from "react";
import { light } from "@material-ui/core/styles/createPalette";
import LikeButton from "./LikeButton";
import DislikeButton from "./DislikeButton";
import LikeDislikePanel from "./LikeDislikePanel";
import EditButton from "./EditButton";
import { editMessage } from "../util/db";
import { AppContext } from "../store/AppContext";
import ReactMarkdown from "react-markdown";
import { generateColor } from "../util/avatarColor";
import { TextField, Button } from "@mui/material";
import remarkGfm from "remark-gfm";

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
      editMessage(props.message.mid, context.auth.loggedEmail, context.auth.token, editedMsg).then(res => {
        context.showSnack(res.message);
      });
      setIsEditing(false);
    }}>Save</Button>
    <Button variant="text" onClick={() => {
      setIsEditing(false);
    }}>Cancel</Button>
  </>;
  return (
    <StyledPaper
      sx={{
        my: 1,
        mx: "0%",
        p: 2,
        minWidth: "100%",
        paddingLeft: 5,
      }}
    >
      <Grid container wrap="nowrap" spacing={2} style={{ marginBottom: "2px" }}>
        <Grid item xs={10}>
          <CopyWrapper content={props.message.content} isEditing={isEditing} setIsEditing={setIsEditing} hasRightToEdit={hasRightToEdit}>
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
                      @{props.message.sender === 'ai' ? "AI" : props.message.sender.substring(0, props.message.sender.indexOf("@"))}
                    </Typography>
                  </ThemeProvider>
                </Box>
              </Grid>
            </Grid>
          </CopyWrapper>
          {!isEditing &&
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              children={props.message.content}
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
