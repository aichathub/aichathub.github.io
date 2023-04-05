import { Grid } from "@material-ui/core";
import Box from "@mui/material/Box";
import CircularProgress from '@mui/material/CircularProgress';
import { useContext, useEffect, useState } from "react";
import { PostModel } from "../models/PostModel";
import { AppContext } from "../store/AppContext";
import { getRecommendations } from "../util/db";
import SearchItem from "./SearchItem";

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
        return;
      }
      setPosts(result.result);
      context.setIsInitializing(false);
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
      {bodyContent}
      <Box
        sx={{
          flexGrow: 1,
          justifyContent: "center",
          display: "flex",
          mb: 2,
        }}
      ></Box>
    </>
  );
};
export default ExplorePage;
