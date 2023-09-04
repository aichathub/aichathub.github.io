import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Authorize from "./components/Authorize";
import ChatAppEdit from "./components/ChatAppEdit";
import ExplorePage from "./components/ExplorePage";
import ForgetPassword from "./components/ForgetPassword";
import SearchPage from "./components/SearchPage";
import SearchTagPage from "./components/SearchTagPage";
import ShortLinkPage from "./components/ShortLinkPage";
import SignIn from "./components/SignIn";
import SignInByToken from "./components/SignInByToken";
import SignUp from "./components/SignUp";
import SignInByGithub from "./components/SigninByGithub";
import { AppContextProvider } from "./store/AppContext";
import { GOOGLE_LOGIN_CLIENT_ID } from "./util/constants";

const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_LOGIN_CLIENT_ID}>
      <BrowserRouter>
        <AppContextProvider>
          <Routes>
            <Route path="/s/:shortid/" element={<ShortLinkPage />} />
            <Route path="/:username/:postid/" element={<ChatAppEdit />} />
            <Route path="/tag" element={<SearchTagPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgetpassword" element={<ForgetPassword />} />
            <Route path="/" element={<ExplorePage />} />
            <Route path="/signin/t/:token" element={<SignInByToken />} />
            <Route path="/signin/github" element={<SignInByGithub />} />
            <Route path="/authorize/:sessionid/" element={<Authorize />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AppContextProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
