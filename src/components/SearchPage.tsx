import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { useState, useEffect, useContext } from "react";
import TopLeftBar from "./TopLeftBar";
import DrawerHeader from "./DrawerHeader";
import ScrollButton from "./ScrollButton";
import { AppContext } from "../store/AppContext";
import { useSearchParams } from 'react-router-dom';
import { Grid, Typography } from "@material-ui/core";
import Message from "./Message";
import { MessageModel } from "../models/MessageModel";
import SearchItem from "./SearchItem";
import { PostModel } from "../models/PostModel";
import { searchPostsByKeyword } from "../util/db";
import SearchIcon from "@mui/icons-material/Search";

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
    searchPostsByKeyword(searchQuery!).then((result) => {
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
    <Box sx={{marginTop: "30px"}}>
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
export default SearchPage;
