import { Grid, Typography } from "@material-ui/core";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { DummyPostModel } from "../models/DummyPostModel";
import { PostModel } from "../models/PostModel";
import { AppContext } from "../store/AppContext";
import { searchPostsByTag } from "../util/db";
import SearchItem from "./SearchItem";

const SearchTagPage = () => {
  const context = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [resultNotFound, setResultNotFound] = useState(false);
  const handleDrawerOpen = () => {
    context.setTopLeftBarOpen(true);
  };
  const handleDrawerClose = () => {
    context.setTopLeftBarOpen(false);
  };

  useEffect(() => {
    document.title = `Tag · ${searchQuery}`;
    context.setIsLoadingMessages(true);
    searchPostsByTag(searchQuery!).then((result) => {
      context.setIsLoadingMessages(false);
      if (result.message !== "SUCCESS") {
        return;
      }
      setResultNotFound(result.result.length === 0);
      setPosts(result.result);
      context.setIsInitializing(false);
    });
  }, [searchParams]);

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
    bodyContent = <Grid container>
      {
        [1, 2, 3, 4, 5, 6, 7].map((x) => {
          return <SearchItem key={Math.random()} post={DummyPostModel} typeEffect={false} isLoading={true} />
        })
      }
    </Grid>
  }

  if (resultNotFound) {
    bodyContent =
      <Box sx={{ marginTop: "30px" }}>
        <Box display="flex" justifyContent="center">
          <SearchIcon />
        </Box>
        <Box display="flex" justifyContent="center">
          <Typography variant="h6" component="h6" gutterBottom>
            We couldn’t find any repositories with tag '{searchQuery}'
          </Typography>
        </Box>
      </Box>;
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
export default SearchTagPage;
