import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
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

export default function SignInByToken() {
  const context = useContext(AppContext);
  const { token } = useParams();
  const [status, setStatus] = React.useState("Checking the token...");
  useEffect(() => {
    const response = fetch(`${backendServer}/api/signin/t`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      mode: "cors",
      body: JSON.stringify({ token: token })
    }).then(async (response) => {
      const responseJson = await response.json();
      if (responseJson.message === "SUCCESS") {
        context.changeAuth({
          loggedEmail: responseJson.loggedEmail,
          token: responseJson.token
        });
        setStatus("You have been signed in successfully! Redirecting to the home page in 2 seconds...");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
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
