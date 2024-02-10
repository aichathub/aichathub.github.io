import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Chip, Divider } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useGoogleLogin } from "@react-oauth/google";
import * as React from "react";
import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GithubLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import { AppContext } from "../store/AppContext";
import { GITHUB_LOGIN_CLIENT_ID, backendServer } from "../util/constants";
import { loginWithGoogleUsingAccessToken } from "../util/db";
import QRCodeLoginButton from "./QRCodeLoginButton";

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

export default function SignIn() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch(`${backendServer}/api/sendsigninlink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      mode: "cors",
      body: JSON.stringify({ email: data.get("email") }),
    });
    const responseJson = await response.json();
    alert(responseJson.message);
  };

  useEffect(() => {
    context.setShouldDisplayTopLeftBar(false);
    context.setIsInitializing(false);
  }, []);

  const customGoogleLogin = useGoogleLogin({
    onSuccess: async credentialResponse => {
      const accessToken = credentialResponse.access_token;
      loginWithGoogleUsingAccessToken(accessToken).then((responseJson) => {
        if (responseJson.message === "SUCCESS") {
          context.changeAuth({
            loggedEmail: responseJson.loggedEmail,
            token: responseJson.token
          });
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            window.location.href = "/";
          }
        } else {
          context.showSnack("Login failed: " + responseJson.message);
        }
      });
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  type="email"
                  autoFocus
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Divider style={{ marginBottom: "10px" }}>
              <Chip label="OR" />
            </Divider>
            <GoogleLoginButton
              style={{ height: "40px", marginTop: "10px" }}
              onClick={customGoogleLogin} text="Sign in with Google" />
            <GithubLoginButton
              style={{ height: "40px" }}
              onClick={() => {
                window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_LOGIN_CLIENT_ID}&scope=user`;
              }} text="Sign in with Github" />
            <QRCodeLoginButton redirectUrl={redirectUrl} />
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/signup" variant="body2">
                  Don't have an account? Sign up
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}
