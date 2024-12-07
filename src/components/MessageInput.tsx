import { CircularProgress, Tooltip } from "@material-ui/core";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import SendIcon from "@material-ui/icons/Send";
import ClearIcon from '@mui/icons-material/Clear';
import StopIcon from '@mui/icons-material/Stop';
import { IconButton, TextField } from "@mui/material";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import { GUEST_EMAIL } from "../util/constants";
import { chatgptReply, customModelReply, googleaiReply, insertMessage, llama70BReply, uploadImage } from "../util/db";
import { runPythonLocal } from "../util/python";
import { convertContentToPythonCode } from "../util/util";
import MessageInputSettings from "./MessageInputSettings";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapForm: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
      margin: `${theme.spacing(0)} auto`,
      position: "sticky",
      bottom: "0px",
      padding: "10px",
    },
    wrapText: {
      width: "100%",
      color: "#FEFEFE",
    },
    button: {
      margin: theme.spacing(1),
      maxHeight: "30px",
    }
  })
);

export const MessageInput: React.FC<{
  username: string;
  postid: string;
  addMessage: (newMsg: MessageModel) => void;
  reloadMessage: () => void;
}> = (props) => {
  const classes = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const context = useContext(AppContext);
  const [inputText, setInputText] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(false);

  const handleStop = () => {
    context.setShouldStopTypingMessage(true);
    context.setIsTypingMessage(false);
  };
  const handleSend = async () => {
    if (!inputRef.current) return;
    if (context.isSendingMessage || context.isTypingMessage) return;
    const ref = inputRef.current!;
    let content = ref.value;
    const triggerOpenAI = context.agent === "o1-mini" || context.agent === "gpt4";
    const triggerGoogleAI = context.agent === "gemini1.5";
    const triggerPython = context.agent === "python";
    const isGuest = !context.loggedUser;
    if (!isGuest && (triggerOpenAI || triggerGoogleAI) && +context.dailyAIUsuage + 1 > +context.dailyAILimit) {
      context.showSnack("Opps, Seems you have reached your daily @AI limit! Let's continue tomorrow!");
      return;
    }
    setInputText("");
    // Focus back to the input field if the user is from desktop
    const isMobile = window.innerWidth <= 600;
    if (!isMobile) {
      ref.focus();
    } else {
      // If the user is from mobile, hide the keyboard
      ref.blur();
    }
    if (triggerOpenAI || triggerPython || triggerGoogleAI) {
      context.setIsSendingMessage(true);
      setTimeout(() => {
        window.scroll({
          top: document.body.offsetHeight,
        });
      }, 500);
    }
    let optionalSocketId: string | undefined;
    if (localStorage.getItem("socketId")) {
      optionalSocketId = localStorage.getItem("socketId")!;
    }
    let response = "";
    if (triggerPython) {
      if (!content.startsWith("```")) {
        content = "```python\n" + content + "\n```";
      }
    }
    const isEmptyMsg = ref.value.toLowerCase().replaceAll("@ai", "").trim().length === 0;
    if (!isEmptyMsg) {
      props.addMessage({
        mid: -1,
        sender: context.auth.loggedEmail,
        content: content,
        time: new Date(),
        authorusername: context.loggedUser
      });
      const result = await insertMessage({
        username: props.username,
        pid: props.postid,
        content: content,
        token: context.auth.token,
        triggerAI: triggerOpenAI || triggerGoogleAI,
        authoremail: !context.loggedUser ? GUEST_EMAIL : context.auth.loggedEmail,
        socketId: optionalSocketId,
        triggerPython: false
      });
      response = result.message;
    }
    if (isEmptyMsg || response.indexOf("ERROR") === -1) {
      props.reloadMessage();
      if (triggerOpenAI) {
        const isGpt4 = context.agent === "gpt4";
        const result = await chatgptReply(props.postid, props.username, context.auth.token, isGpt4);
        if (result.message.indexOf("ERROR") === -1) {
          let rep = isGpt4 ? 1 : 3;
          for (let i = 0; i < rep; i++) {
            context.addDailyAIUsuage();
          }
        } else {
          context.showSnack(result.message);
        }
        props.reloadMessage();
      } else if (triggerPython) {
        context.setIsSendingMessage(true);
        setTimeout(() => {
          window.scroll({
            top: document.body.offsetHeight,
          });
        }, 500);
        // const pythonReply = await pythonRuntimeReply(content);
        const pythonReply = await runPythonLocal(convertContentToPythonCode(content));
        await insertMessage({
          username: props.username,
          pid: props.postid,
          content: "#### *Execution Result*\n```plaintext\n" + pythonReply + "\n```",
          token: context.auth.token,
          triggerAI: false,
          authoremail: context.auth.loggedEmail,
          triggerUserModel: true,
          sendernickname: "Python Runtime"
        });
        props.reloadMessage();
      } else if (triggerGoogleAI) {
        const result = await googleaiReply(props.postid, props.username, context.auth.token);
        if (result.message.indexOf("ERROR") === -1) {
          context.addDailyAIUsuage();
        } else {
          context.showSnack(result.message);
        }
        props.reloadMessage();
      }
    } else {
      context.showSnack(response);
      return;
    }

    const triggerCustomModel = context.agent === "yourmodel";

    if (triggerCustomModel) {
      context.setIsSendingMessage(true);
      setTimeout(() => {
        window.scroll({
          top: document.body.offsetHeight,
        });
      }, 500);
      const api = context.yourmodelUrl;
      const { aiResponse, model } = await customModelReply(content, api, context.messages.filter(m => !m.ishiddenfromai));
      context.setYourmodelName(model);
      await insertMessage({
        username: props.username,
        pid: props.postid,
        content: aiResponse,
        token: context.auth.token,
        triggerAI: false,
        authoremail: context.auth.loggedEmail,
        triggerUserModel: true,
        sendernickname: model
      });
      props.reloadMessage();
    }

    const triggerLLaMA70B = context.agent === "llama70b";
    if (triggerLLaMA70B) {
      context.setIsSendingMessage(true);
      setTimeout(() => {
        window.scroll({
          top: document.body.offsetHeight,
        });
      }, 500);
      const aiResponse = await llama70BReply(content, context.messages);
      await insertMessage({
        username: props.username,
        pid: props.postid,
        content: aiResponse,
        token: context.auth.token,
        triggerAI: false,
        authoremail: context.auth.loggedEmail,
        triggerUserModel: true,
        sendernickname: "LLaMA-2 70B"
      });
      props.reloadMessage();
    }
  };
  const handleInputOnKeyUp = (event: React.KeyboardEvent) => {
    event.preventDefault();
    if (!event.shiftKey && event.key === "Enter") {
      handleSend();
    }
  };
  const handleInputOnKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
    }
  }
  const handlePaste = async (e: React.ClipboardEvent) => {
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
        let imgInMarkDown = `![${data.id}](${data.media})`;
        const inputElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
        const cursorPos = inputElement.selectionStart!;
        const textBeforeCursorPosition = inputText.substring(0, cursorPos);
        const textAfterCursorPosition = inputText.substring(cursorPos);
        if (textBeforeCursorPosition.length > 0) imgInMarkDown = " " + imgInMarkDown;
        if (textAfterCursorPosition.length > 0) imgInMarkDown += " ";
        setInputText(textBeforeCursorPosition + imgInMarkDown + textAfterCursorPosition);
      }
    }
  }
  const sendBtn = <Tooltip title={
    context.isSendingMessage ? "Loading" :
      context.isTypingMessage ? "Stop" :
        inputText.length === 0 ? "Send an empty message to trigger response" : "Send"} arrow
    placement="top"
  >
    <IconButton
      onClick={context.isTypingMessage ? handleStop : handleSend}
      style={{ borderRadius: 0, borderLeft: '0.1em solid lightgrey', padding: '0.5em' }}
      disabled={context.isSendingMessage}
    >
      {context.isSendingMessage ? <CircularProgress color="inherit" size="24px" /> :
        context.isTypingMessage ? <StopIcon /> : <SendIcon />}
    </IconButton>
  </Tooltip>;
  useEffect(() => {
    const onScroll = () => {
      const tolerance = 50;
      setIsAtBottom(window.innerHeight + window.scrollY + tolerance >= document.documentElement.scrollHeight);
    }
    window.removeEventListener("scroll", onScroll);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tolerance = 50;
    if (!context.isLoadingMessages) {
      setIsAtBottom(window.innerHeight + window.scrollY + tolerance >= document.documentElement.scrollHeight);
    }
  }, [context.isLoadingMessages]);

  let agent: string = context.agent;
  if (agent === "yourmodel") {
    agent = context.yourmodelName;
  }
  const handleClearClick = () => {
    setInputText("");
    inputRef.current?.focus();
  }
  const [shouldHide, setShouldHide] = useState(!context.isAutoScrolling && document.activeElement !== inputRef.current && !isAtBottom);
  const [isTogglingOpen, setIsTogglingOpen] = useState(false);
  const [isHoveringInput, setIsHoveringInput] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);
  const keyDownHandler = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    const isCtrlKey = event.ctrlKey || event.metaKey;
    const isJ = key.toLowerCase() === "j";
    if (isCtrlKey && isJ) {
      if (shouldHide) {
        setIsTogglingOpen(true);
        setShouldHide(false);
      } else if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      } else {
        setShouldHide(true);
      }
      event.preventDefault();
    }
  }, [shouldHide, isAtBottom, inputRef]);
  const platform = (navigator?.platform || 'unknown').toLowerCase();
  let shortcutHint = "";
  // If the client is windows, hint is "CTRL+J"
  if (platform.indexOf("win") > -1) {
    shortcutHint = "CTRL+J";
  }
  // If the client is mac, hint is "CMD+J"
  if (platform.indexOf("mac") > -1) {
    shortcutHint = "CMD+J";
  }
  useEffect(() => {
    if (!shouldHide && isTogglingOpen) {
      inputRef.current?.focus();
      setIsTogglingOpen(false);
    }
  }, [shouldHide, isTogglingOpen]);
  useEffect(() => {
    window.addEventListener("keydown", keyDownHandler);
    return () => window.removeEventListener("keydown", keyDownHandler);
  }, [keyDownHandler]);
  useEffect(() => {
    setShouldHide(!context.isAutoScrolling && document.activeElement !== inputRef.current && !isAtBottom);
  }, [context.isAutoScrolling, isAtBottom, inputRef]);
  return (
    <>
      <div className={classes.wrapForm}
        style={{
          background: context.darkMode ? "rgb(37, 43, 51)" : "white",
          display: shouldHide ? "none" : "flex",
        }}
      >
        <Tooltip title={shortcutHint} open={isHoveringInput && !isFocusing}>
          <TextField
            id="standard-text"
            label={`Your Message, current agent: ${agent} ${(context.agent === "yourmodel" && !context.isYourmodelConnected) ? " (disconnected)" : ""}`}
            className={classes.wrapText}
            // inputProps={{ style: { color: context.darkMode ? "white" : "black" } }}
            //margin="normal"
            inputRef={inputRef}
            onMouseEnter={() => setIsHoveringInput(true)}
            onMouseLeave={() => setIsHoveringInput(false)}
            onFocus={() => setIsFocusing(true)}
            onBlur={() => setIsFocusing(false)}
            value={inputText}
            onChange={(e: any) => setInputText(e.target.value)}
            multiline
            onKeyDownCapture={handleInputOnKeyDown}
            onKeyUpCapture={handleInputOnKeyUp}
            onPaste={handlePaste}
            InputProps={{
              endAdornment: (
                <IconButton
                  sx={{ visibility: inputText ? "visible" : "hidden" }}
                  onClick={handleClearClick}
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              ),
            }}
          />
        </Tooltip>
        <MessageInputSettings inputText={inputText} setInputText={setInputText} inputRef={inputRef} />
        {sendBtn}
      </div>
    </>
  );
};
