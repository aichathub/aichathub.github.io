import { CircularProgress, Tooltip } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import SendIcon from "@material-ui/icons/Send";
import { IconButton, TextField } from "@mui/material";
import React, { KeyboardEvent, useContext, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import { GUEST_EMAIL } from "../util/constants";
import { insertMessage, insertSessionMessage } from "../util/db";
import MessageInputUpload from "./MessageInputUpload";

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
  addMessage: (newMsg: MessageModel) => void;
  reloadMessage: () => void;
}> = (props) => {
  const classes = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const context = useContext(AppContext);
  const { username, postid, sessionid } = useParams();
  const [inputText, setInputText] = useState("@AI ");

  const handleSend = async () => {
    if (!inputRef.current) return;
    const ref = inputRef.current!;
    if (ref.value.trim().length !== 0) {
      const content = ref.value;
      if (content.toLowerCase().indexOf("@ai") !== -1) {
        setInputText("@AI ");
      } else {
        setInputText("");
      }
      // Focus back to the input field if the user is from desktop
      if (window.innerWidth > 600) {
        ref.focus();
      } else {
        // If the user is from mobile, hide the keyboard
        ref.blur();
      }
      context.setIsSendingMessage(true);
      let optionalSocketId: string | undefined;
      if (localStorage.getItem("socketId")) {
        optionalSocketId = localStorage.getItem("socketId")!;
      }
      let response = "";
      if (sessionid) {
        props.addMessage({
          mid: -1,
          sender: GUEST_EMAIL,
          content: content,
          time: new Date()
        });
        const result = await insertSessionMessage({
          username: username!,
          pid: postid!,
          content: content,
          sessionid: sessionid
        });
        response = result.message;
      } else {
        props.addMessage({
          mid: -1,
          sender: context.auth.loggedEmail,
          content: content,
          time: new Date(),
          authorusername: context.loggedUser
        });
        const result = await insertMessage({
          username: username!,
          pid: postid!,
          content: content,
          token: context.auth.token,
          triggerAI: context.sendTriggerApi,
          authoremail: context.auth.loggedEmail,
          socketId: optionalSocketId,
        });
        response = result.message;
      }
      context.setIsSendingMessage(false);
      if (response.indexOf("ERROR") === -1) {
        props.reloadMessage();
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
  return (
    <>
      <div className={classes.wrapForm}
        style={{ background: context.darkMode ? "rgb(39,39,39)" : "white" }}
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
        <MessageInputUpload setInputText={setInputText} />
        {/* <MessageInputSettings /> */}
        {sendBtn}
      </div>
    </>
  );
};