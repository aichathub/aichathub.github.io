import { CircularProgress, Tooltip } from "@material-ui/core";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import SendIcon from "@material-ui/icons/Send";
import { IconButton, TextField } from "@mui/material";
import React, { KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import { insertMessage } from "../util/db";
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
  const [inputText, setInputText] = useState("@AI ");
  const [isAtBottom, setIsAtBottom] = useState(false);

  const handleSend = async () => {
    if (!inputRef.current) return;
    if (context.isSendingMessage) return;
    const ref = inputRef.current!;
    if (ref.value.trim().length !== 0) {
      const content = ref.value;
      const triggerAI = content.toLowerCase().indexOf("@ai") !== -1;
      const triggerPython = content.toLowerCase().indexOf("@python") !== -1;
      if (triggerAI && context.dailyAILimit === context.dailyAIUsuage) {
        context.showSnack("Opps, Seems you have reached your daily @AI limit! Let's continue tomorrow!");
        return;
      }
      if (triggerAI) {
        setInputText("@AI ");
      } else if (triggerPython) {
        setInputText("@python ");
      } else {
        setInputText("");
      }
      // Focus back to the input field if the user is from desktop
      const isMobile = window.innerWidth <= 600;
      if (!isMobile) {
        ref.focus();
      } else {
        // If the user is from mobile, hide the keyboard
        ref.blur();
      }
      if (content.toLowerCase().indexOf("@ai") !== -1) {
        context.setIsSendingMessage(true);
      }
      if (content.toLowerCase().indexOf("@python") !== -1) {
        context.setIsSendingMessage(true);
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
        triggerAI: context.sendTriggerAIVoice,
        authoremail: context.auth.loggedEmail,
        socketId: optionalSocketId,
      });
      response = result.message;
      if (response.indexOf("ERROR") === -1) {
        props.reloadMessage();
        if (triggerAI) {
          context.addDailyAIUsuage();
        }
      } else {
        context.showSnack(response);
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
  const sendBtn = <Tooltip title={context.isSendingMessage ? "Loading" : "Send"} arrow>
    <IconButton
      onClick={handleSend}
      style={{ borderRadius: 0, borderLeft: '0.1em solid lightgrey', padding: '0.5em' }}
      disabled={context.isSendingMessage}
    >
      {context.isSendingMessage ? <CircularProgress color="inherit" size="24px" /> : <SendIcon />}
    </IconButton>
  </Tooltip>;
  useEffect(() => {
    const onScroll = () => {
      const tolerance = 5;
      setIsAtBottom(window.innerHeight + window.scrollY + tolerance >= document.documentElement.scrollHeight);
    }
    window.removeEventListener("scroll", onScroll);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!context.isLoadingMessages) {
      setIsAtBottom(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight);
    }
  }, [context.isLoadingMessages]);
  return (
    <>
      <div className={classes.wrapForm}
        style={{
          background: context.darkMode ? "rgb(39,39,39)" : "white",
          display: (document.activeElement !== inputRef.current && !isAtBottom) ? "none" : "flex",
        }}
      >
        <TextField
          id="standard-text"
          label="Use @AI to trigger AI response"
          className={classes.wrapText}
          // inputProps={{ style: { color: context.darkMode ? "white" : "black" } }}
          //margin="normal"
          inputRef={inputRef}
          value={inputText}
          onChange={(e: any) => setInputText(e.target.value)}
          multiline
          onKeyDownCapture={handleInputOnKeyDown}
          onKeyUpCapture={handleInputOnKeyUp}
        />
        {/* <MessageInputUpload setInputText={setInputText} /> */}
        <MessageInputSettings inputText={inputText} setInputText={setInputText} inputRef={inputRef} />
        {sendBtn}
      </div>
    </>
  );
};
