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
import { GoogleLogin } from "@react-oauth/google";
import * as React from "react";
import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GithubLoginButton } from "react-social-login-buttons";
import { NumberDictionary, adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { AppContext } from "../store/AppContext";
import { GITHUB_LOGIN_CLIENT_ID, backendServer } from "../util/constants";
import { signupWithGoogle } from "../util/db";

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

export default function SignUp() {
  const context = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const navigate = useNavigate();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const jsonBody = {
      email: data.get("email"),
      username: data.get("username")
    };
    const response = await fetch(`${backendServer}/signup/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      mode: "cors",
      body: JSON.stringify(jsonBody),
    });
    const responseJson = await response.json();
    if (responseJson.loggedEmail && responseJson.token) {
      // context.changeAuth({
      //   loggedEmail: responseJson.loggedEmail,
      //   token: responseJson.token
      // });
      alert("SIGN UP SUCCESSFUL, A LOGIN LINK HAS BEEN SENT TO YOUR EMAIL");
      window.location.href = "/";
    } else if (responseJson.message) {
      alert(responseJson.message)
    } else {
      alert("UNKNOWN ERROR, PLEASE TRY AGAIN LATER");
    }
  };
  const numberDictionary = NumberDictionary.generate({ min: 100, max: 999 });
  const randomUsername = uniqueNamesGenerator({
    dictionaries: [adjectives, Math.random() > .5 ? animals : colors, numberDictionary],
    separator: '-',
    style: 'lowerCase'
  });
  const usernameRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    context.setShouldDisplayTopLeftBar(false);
    context.setIsInitializing(false);
    context.setTopLeftBarOpen(false);
  }, []);
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
            Sign up
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
                  inputRef={usernameRef}
                  autoComplete="username"
                  name="username"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  defaultValue={randomUsername}
                />
              </Grid>
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
              {/* <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password-repeat"
                  label="Enter your password again"
                  type="password"
                  id="password-repeat"
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox value="allowExtraEmails" color="primary" />
                  }
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid> */}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Divider style={{ marginBottom: "10px" }}>
              <Chip label="OR" />
            </Divider>
            <Box style={{ marginLeft: "5px" }}>
              <GoogleLogin
                shape="rectangular"
                logo_alignment="left"
                text="signup_with"
                useOneTap={true}
                onSuccess={credentialResponse => {
                  const idToken = credentialResponse.credential;
                  signupWithGoogle(idToken!, usernameRef.current!.value).then((responseJson) => {
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
                }}
                onError={() => {
                  context.showSnack("Login failed");
                }}
              />
            </Box>
            <GithubLoginButton
              style={{ height: "40px", marginTop: "10px" }}
              onClick={() => {
                localStorage.setItem("github_register_username", usernameRef.current!.value);
                window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_LOGIN_CLIENT_ID}&scope=user`;
              }} text="Sign up with Github" />
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/signin" variant="body2">
                  Already have an account? Sign in
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
