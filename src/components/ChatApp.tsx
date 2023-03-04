import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Message from "./Message";
import Grid from "@material-ui/core/Grid";
import { useState, useEffect, useContext } from "react";
import { MessageModel } from "../models/MessageModel";
import { MessageInput } from "./MessageInput";
import { io, Socket } from "socket.io-client";
import TopLeftBar from "./TopLeftBar";
import DrawerHeader from "./DrawerHeader";
import ScrollButton from "./ScrollButton";
import { AppContext } from "../store/AppContext";
import EmptyCard from "./EmptyCard";
import { LocalPostModel } from "../models/LocalPostModel";
import { useParams } from "react-router-dom";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  // padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const ChatApp = () => {
  const context = useContext(AppContext);
  const pagePostId = context.pagePostId;
  const post = context.getPostById(pagePostId);
  const messages = post ? post.messages : [];
  const [socket, setSocket] = useState<Socket>();
  const { id } = useParams();

  const addMessage = (newMsg: MessageModel) => {
    context.addMessage(newMsg);
    setTimeout(() => {
      window.scroll({
        top: document.body.offsetHeight,
        behavior: "smooth",
      });
    }, 300);
  };

  const sendMessage = (msg: MessageModel) => {
    if (socket) {
      let newMessages = post ? [...post!.messages, msg] : [msg];
      socket!.emit("message", {
        ...post,
        messages: newMessages,
      } as LocalPostModel);
    }
  };

  const [open, setOpen] = useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!socket || socket === null) {
      setSocket(io("http://localhost:3001"));
    } else {
      socket!.off("replies");
      socket!.on("replies", (content) => {
        // addMessage({ content: content, sender: "ai", time: new Date() });
      });
      socket!.off("summaries");
      socket!.on("summaries", (content) => {
        context.updateSummary(content);
      });
    }
  }, [socket, context]);

  useEffect(() => {
    context.changePagePostId(id!);
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", marginBottom: "30px" }}>
        <CssBaseline />
        <TopLeftBar
          open={open}
          handleDrawerClose={handleDrawerClose}
          handleDrawerOpen={handleDrawerOpen}
        />
        <Main open={open}>
          <DrawerHeader />

          {messages.length === 0 && (
            <Box sx={{ textAlign: "center" }}>
              <EmptyCard title={post ? post.title : ""} />
            </Box>
          )}
          <Grid container>
            {messages.map((x, index) => (
              <Message key={index} message={x} />
            ))}
          </Grid>
          <Box
            sx={{
              flexGrow: 1,
              justifyContent: "center",
              display: "flex",
              mb: 2,
            }}
          ></Box>
        </Main>
      </Box>
      <footer
        style={{
          color: "gray",
          position: "fixed",
          bottom: 0,
          width: "100%",
          minHeight: "30px",
          paddingLeft: (open ? drawerWidth : 0) + "px",
        }}
      >
        <ScrollButton />
        {/* <MessageInput addMessage={addMessage} sendMessage={sendMessage} /> */}
      </footer>
    </>
  );
};
export default ChatApp;
