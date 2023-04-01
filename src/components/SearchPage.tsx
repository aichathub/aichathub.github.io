import { Grid, Typography } from "@material-ui/core";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { PostModel } from "../models/PostModel";
import { AppContext } from "../store/AppContext";
import { searchPostsByKeyword } from "../util/db";
import SearchItem from "./SearchItem";

const SearchPage = () => {
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
    document.title = `Search · ${searchQuery}`;
    searchPostsByKeyword(searchQuery!, { username: context.loggedUser, token: context.auth.token }).then((result) => {
      if (result.message !== "SUCCESS") {
        console.log(result.message);
        return;
      }
      setResultNotFound(result.result.length === 0);
      setPosts(result.result);
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

  if (resultNotFound) {
    bodyContent =
      <Box sx={{ marginTop: "30px" }}>
        <Box display="flex" justifyContent="center">
          <SearchIcon />
        </Box>
        <Box display="flex" justifyContent="center">
          <Typography variant="h6" component="h6" gutterBottom>
            We couldn’t find any repositories matching '{searchQuery}'
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
export default SearchPage;
