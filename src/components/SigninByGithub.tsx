import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../store/AppContext";
import { backendServer } from "../util/constants";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="/">
        NoteMessages
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme();

export default function SignInByGithub() {
  const context = useContext(AppContext);
  const [status, setStatus] = React.useState("Checking the token...");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code');
  useEffect(() => {
    const username = localStorage.getItem("github_register_username");
    let isSignup = false;
    if (username != null) {
      isSignup = true;
    }
    const url = isSignup ? `${backendServer}/api/githubsignup` : `${backendServer}/api/githublogin`;
    const body = isSignup ? { code: code, username: username } : { code: code };
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      mode: "cors",
      body: JSON.stringify(body)
    }).then(async (response) => {
      const responseJson = await response.json();
      if (responseJson.message === "SUCCESS") {
        context.changeAuth({
          loggedEmail: responseJson.loggedEmail,
          token: responseJson.token
        });
        if (isSignup) {
          localStorage.removeItem("github_register_username");
          context.showSnack("Welcome! You have been registered successfully!");
        }
        setStatus("You have been signed in successfully! Redirecting to the home page in 2 seconds...");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        context.showSnack(responseJson.message);
        setStatus("The token is invalid. Please try again. Redirecting to the home page in 5 seconds...");
        setTimeout(() => {
          window.location.href = "/";
        }, 5000);
      }
    });
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <Typography
          variant="body2"
          color="text.primary"
          align="center"
        >
          {status}
        </Typography>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}
