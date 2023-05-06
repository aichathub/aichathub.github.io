import { CircularProgress, Tooltip } from "@material-ui/core";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import SendIcon from "@material-ui/icons/Send";
import ClearIcon from '@mui/icons-material/Clear';
import StopIcon from '@mui/icons-material/Stop';
import { IconButton, TextField } from "@mui/material";
import React, { KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import { chatgptReply, customModelReply, insertMessage, pythonReply } from "../util/db";
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
      borderTop: "1px #DDD solid;",
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
    if (context.agent === "yourmodel") {
      const isConnected = await context.pingYourmodel();
      if (!isConnected) {
        context.showSnack("Opps, Seems your model is disconnected! Please check your model and try again.");
        return;
      }
    }
    const ref = inputRef.current!;
    if (ref.value.toLowerCase().replaceAll("@ai", "").trim().length !== 0) {
      const content = ref.value;
      // const triggerAI = content.toLowerCase().indexOf("@ai") !== -1;
      // const triggerPython = content.toLowerCase().indexOf("@python") !== -1;
      const triggerAI = context.agent === "gpt3.5" || context.agent === "gpt4";
      const triggerPython = context.agent === "python";
      if (triggerAI && context.dailyAILimit === context.dailyAIUsuage) {
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
      if (triggerAI || triggerPython) {
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
        triggerAI: false,
        authoremail: context.auth.loggedEmail,
        socketId: optionalSocketId,
        triggerPython: false
      });
      response = result.message;
      if (response.indexOf("ERROR") === -1) {
        props.reloadMessage();
        if (triggerAI) {
          const isGpt4 = context.agent === "gpt4";
          const result: any = await chatgptReply(props.postid, props.username, context.auth.token, isGpt4);
          if (result.message.indexOf("ERROR") === -1) {
            let rep = isGpt4 ? 10 : 1;
            for (let i = 0; i < rep; i++) {
              context.addDailyAIUsuage();
            }
          } else {
            context.showSnack(result.message);
          }
          props.reloadMessage();
        } else if (triggerPython) {
          await pythonReply(props.postid, props.username, context.auth.token, content);
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
        const modelName = context.yourmodelName;
        const aiResponse = await customModelReply(content, api, context.messages);
        await insertMessage({
          username: props.username,
          pid: props.postid,
          content: aiResponse,
          token: context.auth.token,
          triggerAI: false,
          authoremail: context.auth.loggedEmail,
          triggerUserModel: true,
          sendernickname: modelName
        });
        props.reloadMessage();
      }
    }
  };
  const handleInputOnKeyUp = (event: KeyboardEvent) => {
    event.preventDefault();
    if (!event.shiftKey && event.key === "Enter") {
      handleSend();
    }
  };
  const handleInputOnKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
    }
  }
  const sendBtn = <Tooltip title={context.isSendingMessage ? "Loading" :
    context.isTypingMessage ? "Stop" : "Send"} arrow>
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
  return (
    <>
      <div className={classes.wrapForm}
        style={{
          background: context.darkMode ? "rgb(39,39,39)" : "white",
          display: (!context.isAutoScrolling && document.activeElement !== inputRef.current && !isAtBottom) ? "none" : "flex",
        }}
      >
        <TextField
          id="standard-text"
          label={`Your Message, current agent: ${agent} ${(context.agent === "yourmodel" && !context.isYourmodelConnected) ? " (disconnected)" : ""}`}
          className={classes.wrapText}
          // inputProps={{ style: { color: context.darkMode ? "white" : "black" } }}
          //margin="normal"
          inputRef={inputRef}
          value={inputText}
          onChange={(e: any) => setInputText(e.target.value)}
          multiline
          onKeyDownCapture={handleInputOnKeyDown}
          onKeyUpCapture={handleInputOnKeyUp}
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
        {/* <MessageInputUpload setInputText={setInputText} /> */}
        <MessageInputSettings inputText={inputText} setInputText={setInputText} inputRef={inputRef} />
        {sendBtn}
      </div>
    </>
  );
};
