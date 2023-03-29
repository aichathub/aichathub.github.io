import { Grid } from "@material-ui/core";
import Box from "@mui/material/Box";
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from "@mui/material/CssBaseline";
import { styled } from "@mui/material/styles";
import { useContext, useEffect, useState } from "react";
import { PostModel } from "../models/PostModel";
import { AppContext } from "../store/AppContext";
import { getRecommendations } from "../util/db";
import DrawerHeader from "./DrawerHeader";
import ScrollButton from "./ScrollButton";
import SearchItem from "./SearchItem";
import TopLeftBar from "./TopLeftBar";

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

const ExplorePage = () => {
  const context = useContext(AppContext);
  const [posts, setPosts] = useState<PostModel[]>([]);
  const handleDrawerOpen = () => {
    context.setTopLeftBarOpen(true);
  };
  const handleDrawerClose = () => {
    context.setTopLeftBarOpen(false);
  };

  useEffect(() => {
    context.setIsLoadingMessages(true);
    getRecommendations(context.loggedUser).then((result) => {
      context.setIsLoadingMessages(false);
      if (result.message !== "SUCCESS") {
        console.log(result.message);
        return;
      }
      setPosts(result.result);
    });
  }, [context.loggedUser, context.lastPostsRefresh]);

  let bodyContent = <>
    <Grid container>
      {
        posts.map((post, index) => {
          return <SearchItem key={index} post={post} typeEffect={true} />
        })
      }
    </Grid>
  </>;

  if (context.isLoadingMessages) {
    bodyContent = <Box sx={{ textAlign: "center", marginTop: "20%" }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <>
      <Box sx={{ display: "flex", marginBottom: "30px" }}>
        <CssBaseline />
        <TopLeftBar
          open={context.topLeftBarOpen}
          handleDrawerClose={handleDrawerClose}
          handleDrawerOpen={handleDrawerOpen}
        />
        <Main open={context.topLeftBarOpen}>
          <DrawerHeader />
          {bodyContent}
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
          paddingLeft: (context.topLeftBarOpen ? drawerWidth : 0) + "px",
        }}
      >
        <ScrollButton />
      </footer>
    </>
  );
};
export default ExplorePage;
