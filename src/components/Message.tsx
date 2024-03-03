import { Box, Tooltip } from "@material-ui/core";
import Editor from "@monaco-editor/react";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Button, Checkbox, CircularProgress, FormControlLabel, Grid, Skeleton, SxProps, TextField, Theme } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { deepOrange } from "@mui/material/colors";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import { useContext, useEffect, useState } from "react";
import Timeago from "react-timeago";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import { generateColor } from "../util/avatarColor";
import { editMessage, uploadImage } from "../util/db";
import { runPythonLocal } from "../util/python";
import { convertContentToPythonCode } from "../util/util";
import LikeDislikePanel from "./LikeDislikePanel";
import MarkdownComponent from "./MarkdownComponent";
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
  isLoading?: boolean;
  isPythonRuntime?: boolean;
}> = (props) => {
  const markdownPythonToCode = (input: string) => {
    if (input.startsWith("```python\n")) {
      input = input.replace("```python\n", "");
    }
    if (input.endsWith("\n```")) {
      input = input.slice(0, -4);
    }
    return input;
  };
  const pythonCodeToMarkdown = (input: string) => {
    return "```python\n" + input + "\n```";
  }
  let avatarName = "You";
  const isAI = props.message.authorusername === undefined;
  const avatarColor = isAI ? deepOrange[500] : generateColor(props.message.authorusername);
  if (props.message.authorusername === undefined) {
    avatarName = "AI";
  } else {
    avatarName = props.message.authorusername.substring(0, 2).toUpperCase();
  }
  const context = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMsg, setEditedMsg] = useState(props.message.content);
  const [pythonEditorText, setPythonEditorText] = useState(markdownPythonToCode(props.message.content));
  const [lastSyncedAt, setLastSyncedAt] = useState(new Date());
  const numOfLines = props.message.content.split("\n").length;

  const justNow = (date: Date, seconds = 60) => {
    if (date === undefined) return false;
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    return diff < 1000 * seconds;
  };
  const shouldAnimate = isAI && props.message.justSent;
  const [content, setContent] = useState(shouldAnimate ? "" : props.message.content.replaceAll("\n", "\n\n"));

  let timeText = <Timeago date={props.message.time} title="" />;
  // if under one minute, just show Now
  if (justNow(props.message.time)) {
    timeText = <Typography variant="overline" color="common.grey">Now</Typography>;
  }
  let invisibleIcon = <span className={classes["invisible-icon"]}>
    <Tooltip title="This message is currently hidden from the AI" placement="top" arrow>
      <VisibilityOffIcon fontSize="small" />
    </Tooltip>
  </span>;
  const handleEditOnPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        context.setShowLoadingBackdrop(true);
        const response = await uploadImage(item);
        context.setShowLoadingBackdrop(false);
        if (response.message !== "SUCCESS") {
          context.showSnack(response.message);
          return;
        }
        const data = response.result.data;
        setEditedMsg(editedMsg + `![${data.id}](${data.media})`)
        let imgInMarkDown = `![${data.id}](${data.media})`;
        const inputElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
        const cursorPos = inputElement.selectionStart!;
        const textBeforeCursorPosition = editedMsg.substring(0, cursorPos);
        const textAfterCursorPosition = editedMsg.substring(cursorPos);
        if (textBeforeCursorPosition.length > 0) imgInMarkDown = " " + imgInMarkDown;
        if (textAfterCursorPosition.length > 0) imgInMarkDown += " ";
        setEditedMsg(textBeforeCursorPosition + imgInMarkDown + textAfterCursorPosition);
      }
    }
  }
  const fullHeight = window.innerHeight;
  const [pythonEditorTimeout, setPythonEditorTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [isPythonRunning, setIsPythonRunning] = useState(false);
  const [isVimMode, setIsVimMode] = useState(localStorage.getItem("vimMode") === "true");
  const lastSyncedTag = <>
    Last synced at <Timeago date={lastSyncedAt} title="" />
  </>
  const [monacoEditor, setMonacoEditor] = useState<any>(undefined);
  const [monacoVimEditor, setMonacoVimEditor] = useState<any>(undefined);
  const [monacoVim, setMonacoVim] = useState<any>(undefined);
  const [shouldUseMonaco, setShouldUseMonaco] = useState(false);
  const handleEditorDidMount = (editor: any, monaco: any) => {
    (window as any).require.config({
      paths: {
        "monaco-vim": "https://unpkg.com/monaco-vim/dist/monaco-vim"
      }
    });
    (window as any).require(["monaco-vim"], function (MonacoVim: any) {
      if (isVimMode) {
        const statusNode = document.querySelector(".status-node");
        const vi = MonacoVim.initVimMode(editor, statusNode);
        setMonacoVimEditor(vi);
      }
      setMonacoVim(MonacoVim);
    });
    setMonacoEditor(editor);
  };
  useEffect(() => {
    if (isVimMode) {
      if (monacoEditor && monacoVim) {
        const statusNode = document.querySelector(".status-node");
        const vi = monacoVim.initVimMode(monacoEditor, statusNode);
        setMonacoVimEditor(vi);
      }
    } else {
      if (monacoVimEditor) {
        monacoVimEditor.dispose();
      }
    }
  }, [isVimMode]);
  const editor = <>
    {
      !props.isPythonRuntime && !shouldUseMonaco && <TextField multiline
        autoFocus
        value={editedMsg}
        style={{ width: "100%" }}
        onChange={(e) => {
          setEditedMsg(e.target.value);
        }}
        onPaste={handleEditOnPaste}
      />
    }
    {
      !props.isPythonRuntime && shouldUseMonaco &&
      <Editor
        height={(Math.max(fullHeight * 0.2, Math.min(fullHeight * 0.7, numOfLines * 12))) + "px"}
        language="markdown"
        theme={context.darkMode ? "vs-dark" : "vs-light"}
        onMount={handleEditorDidMount}
        onChange={(val) => {
          if (val) {
            setEditedMsg(val);
          }
        }}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false
        }}
        defaultValue={editedMsg}
      />
    }
    {
      props.isPythonRuntime &&
      <Editor
        height={(Math.max(fullHeight * 0.2, Math.min(fullHeight * 0.7, numOfLines * 12))) + "px"}
        language="python"
        theme={context.darkMode ? "vs-dark" : "vs-light"}
        onMount={handleEditorDidMount}
        onChange={val => {
          if (val) {
            setPythonEditorText(val);
            // Automatically edit the message after the user stops typing for 2 second
            if (pythonEditorTimeout) {
              clearTimeout(pythonEditorTimeout);
            }
            const newPythonEditorTimeout = setTimeout(() => {
              const newContent = pythonCodeToMarkdown(val);
              setContent(newContent);
              props.message.editdate = new Date();
              props.message.content = newContent;
              localStorage.setItem(`code_backup_${props.message.mid}`, newContent);
              setIsAutoSyncing(true);
              editMessage(props.message.mid, context.auth.loggedEmail, context.auth.token, newContent).then(res => {
                setLastSyncedAt(new Date());
                setIsAutoSyncing(false);
              });
            }, 2000);
            setPythonEditorTimeout(newPythonEditorTimeout);
          }
        }}
        defaultValue={markdownPythonToCode(props.message.content)}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false
        }}
      />
    }
    {(props.isPythonRuntime || shouldUseMonaco) &&
      <FormControlLabel control={
        <Checkbox
          checked={isVimMode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setIsVimMode(e.target.checked);
            localStorage.setItem("vimMode", e.target.checked ? "true" : "false");
          }} />} label="Vim" />
    }

    <Button variant="text" onClick={() => {
      const newContent = props.isPythonRuntime ? pythonCodeToMarkdown(pythonEditorText) : editedMsg.replaceAll("\n", "\n\n");
      setContent(newContent);
      props.message.editdate = new Date();
      props.message.content = newContent;

      if (props.isPythonRuntime) {
        let nextMsg: MessageModel | undefined = undefined;
        for (let i = 0; i < context.messages.length; i++) {
          if (context.messages[i].mid === props.message.mid) {
            if (i + 1 < context.messages.length) {
              nextMsg = context.messages[i + 1];
            }
          }
        }
        setTimeout(() => {
          const msgEl = document.getElementById("m" + nextMsg?.mid);
          if (msgEl) {
            msgEl.scrollIntoView();
          }
        }, 500);
        context.setMessages(context.messages.map(x => x.mid !== nextMsg?.mid ? x : {
          ...x,
          content: "Loading..."
        }));
        // pythonRuntimeReply(newContent).then(result => {
        setIsPythonRunning(true);
        runPythonLocal(convertContentToPythonCode(newContent)).then(result => {
          setIsPythonRunning(false);
          const displayResult = "#### *Execution Result*\n```plaintext\n" + result + "\n```";
          context.setMessages(context.messages.map(x => x.mid !== nextMsg?.mid ? x : {
            ...x,
            content: displayResult,
            editdate: new Date()
          }));
          editMessage(nextMsg!.mid, context.auth.loggedEmail, context.auth.token, displayResult);
        });
      }
      editMessage(props.message.mid, context.auth.loggedEmail, context.auth.token, props.isPythonRuntime ? newContent : editedMsg).then(res => {
        context.showSnack(res.message);
        setLastSyncedAt(new Date());
      });
      if (!props.isPythonRuntime && !shouldUseMonaco) {
        setIsEditing(false);
      }
    }}>{props.isPythonRuntime ? <>
      {isPythonRunning ? <CircularProgress size={20} color="inherit" /> : <> Run </>}
    </> : <>Save</>}</Button>
    {
      props.isPythonRuntime && <Tooltip title={lastSyncedTag} arrow>
        <Button variant="text" onClick={() => {
          setIsEditing(false);
        }}>
          {isAutoSyncing ? <CircularProgress size={20} color="inherit" /> : "Save & Close"}
        </Button>
      </Tooltip>
    }
    {
      !props.isPythonRuntime && !shouldUseMonaco && <Button variant="text" onClick={() => {
        setIsEditing(false);
      }}>
        Cancel
      </Button>
    }
    {
      !props.isPythonRuntime && shouldUseMonaco && <Tooltip title={lastSyncedTag} arrow>
        <Button variant="text" onClick={() => {
          setIsEditing(false);
        }}>
          Close
        </Button>
      </Tooltip>
    }
    {isVimMode && (shouldUseMonaco || props.isPythonRuntime) && <code className="status-node"></code>}
  </>;
  const anchorElement = <span id={"m" + props.message.mid} style={{ position: "absolute", transform: "translateY(-30vh)" }} />;
  const anchor = window.location.hash.slice(1);
  const shouldHighlight = anchor === "m" + props.message.mid;
  const isSpeaking = props.message.mid === context.speakingMid && context.speakingMid !== -1;
  const isMobile = window.innerWidth <= 600;
  const isExtraSmall = window.innerWidth < 375;
  const [isHiddenFromAI, setIsHiddenFromAI] = useState(props.message.ishiddenfromai);
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
  const isLoading = props.isLoading;
  useEffect(() => {
    if (!shouldAnimate || context.shouldStopTypingMessage) return;
    context.setIsTypingMessage(true);
    let autoScroll = true;
    let autoScrollStarted = false;
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
        if (curLen > 10 && !autoScrollStarted) {
          autoScroll = true;
          autoScrollStarted = true;
          context.setIsAutoScrolling(true);
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
        let nextStart = curLen + 1;
        while (nextStart + 1 < props.message.content.length && props.message.content[nextStart] != ' ') {
          nextStart++;
        }
        return props.message.content.substring(0, nextStart);
      })
    }, 50);
    return () => clearInterval(interval);
  }, [context.shouldStopTypingMessage]);
  useEffect(() => {
    if (props.message.sendernickname?.toUpperCase() === "PYTHON RUNTIME") {
      setContent(props.message.content);
    }
  }, [props.message]);
  return (
    <StyledPaper
      sx={sx}
    >
      {anchorElement}
      <Grid container wrap="nowrap" spacing={2} style={{ marginBottom: "2px" }}>
        <Grid item xs={!isExtraSmall && isMobile ? 12 : 10}>
          <MessageWrapper
            message={props.message}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            setShouldUseMonaco={setShouldUseMonaco}
            isLoading={isLoading}
            isPythonRuntime={props.isPythonRuntime}
            setIsHiddenFromAI={setIsHiddenFromAI}>
            <Grid container spacing={2}>
              <Grid item>
                {isLoading ? <Skeleton variant="circular" width={40} height={40} /> : <Avatar sx={{ bgcolor: avatarColor }}>{avatarName}</Avatar>}
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
                        {isLoading ? <Skeleton width="100px" /> : timeText}
                      </Typography>
                    </Tooltip>
                    {isHiddenFromAI && invisibleIcon}
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
                      {
                        isLoading ? <Skeleton variant="text" width="50px" sx={{ marginTop: "5px" }} /> :
                          <>
                            {(props.message.authorusername !== "python" && props.message.authorusername) && <UserLink username={props.message.authorusername} />}
                            {props.message.authorusername === undefined && ("@AI" + (props.message.sendernickname ? " (" + props.message.sendernickname + ")" : ""))}
                            {props.message.authorusername === "python" && "@Python"}
                          </>
                      }
                    </Typography>
                  </ThemeProvider>
                </Box>
              </Grid>
            </Grid>
          </MessageWrapper>
          {!isEditing && (
            (isLoading || props.message.isLoading || content === "Loading...") ? <>
              {
                ((props.message.isLoading || content === "Loading...") ? [30, 50] : [30, 50, 80, 40]).map((width, i) => <Skeleton sx={{ marginTop: "5px" }} key={i} variant="text" width={`${width}%`} />)
              }
            </> :
              <>
                <MarkdownComponent content={content} message={props.message} />
                {props.message.editdate && <Typography variant="overline" color="common.grey" sx={{ fontStyle: 'italic' }}>(Edited)</Typography>}
              </>
          )
          }
          {isEditing && editor}
          {props.message.authorusername === undefined && !isLoading && <LikeDislikePanel message={props.message} />}
        </Grid>
      </Grid>
    </StyledPaper>
  );
};
export default Message;
