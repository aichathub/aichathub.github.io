import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AppContext } from "../store/AppContext";

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
        AIChatHub
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
    const response = fetch(`http://localhost:3001/api/signin/t`, {
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
