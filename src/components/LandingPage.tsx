import { Link } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createTheme } from "@mui/material/styles";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../store/AppContext";

const Copyright = () => {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="/">
        NoteMessages
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
};

const cards = [1, 2, 3];
const images = [
  require("../resources/Python.png"),
  require("../resources/Edit.png"),
  require("../resources/CustomLLM.png"),
];
const headings = ["Python", "Chat Control", "Custom LLM"];
const content = [
  "Interact with our Python bot for quick code execution",
  "Edit the chat to nudge the bot in the right direction",
  "Interact with your custom model from your localhost"
];

const theme = createTheme();

const LandPage = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const handleSignInClick = () => {
    navigate("/signin");
  };
  const handleSignUpClick = () => {
    navigate("/signup");
  };
  const handleViewPostsClick = () => {
    navigate(`/search?q=@${context.loggedUser}`);
  };
  const handleNewPostClick = () => {
    context.setOpenNewPostForm(true);
  }
  useEffect(() => {
    context.setIsInitializing(false);
  }, []);
  return (
    <>
      <CssBaseline />
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: "background.paper",
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              NoteMessages
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="text.secondary"
              paragraph
            >
              Easily search and share your notes
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              paragraph
            >
              Or just use it as a note taking app with chat interface
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              {context.loggedUser && (
                <>
                  <Button variant="outlined" onClick={handleNewPostClick}>
                    New Post
                  </Button>
                  <Button variant="outlined" onClick={handleViewPostsClick}>
                    Your Posts
                  </Button>
                </>
              )}
              {!context.loggedUser && (
                <>
                  <Button variant="outlined" onClick={handleSignInClick}>
                    Sign In
                  </Button>
                  <Button variant="outlined" onClick={handleSignUpClick}>
                    Sign Up
                  </Button>
                </>
              )}
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          <Grid container spacing={4}>
            {cards.map((card, idx) => (
              <Grid item key={card} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      pt: "56.25%",
                    }}
                    image={images[idx]}
                    alt={headings[idx]}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {headings[idx]}
                    </Typography>
                    <Typography>{content[idx]}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          NoteMessages
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          All rights reserved
        </Typography>
        <Copyright />
      </Box>
      {/* End footer */}
    </>
  );
};
export default LandPage;