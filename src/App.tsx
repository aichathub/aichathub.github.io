import { Route, Routes } from "react-router-dom";
import ChatApp from "./components/ChatApp";
import ChatAppEdit from "./components/ChatAppEdit";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import { AppContextProvider } from "./store/AppContext";
import { BrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import SearchPage from "./components/SearchPage";
import ChatAppSession from "./components/ChatAppSession";
import ChatAppNewSession from "./components/ChatAppNewSession";
import ExplorePage from "./components/ExplorePage";
import SearchTagPage from "./components/SearchTagPage";
import ForgetPassword from "./components/ForgetPassword";
import SignInByToken from "./components/SignInByToken";

const App = () => {
  return (
    <BrowserRouter>
      <AppContextProvider>
        <Routes>
          {/* <Route path="/:username/:postid/edit" element={<ChatAppEdit />} /> */}
          {/* <Route path="/:username/:postid/:sessionid" element={<ChatAppSession />} /> */}
          <Route path="/:username/:postid/" element={<ChatAppEdit />} />
          {/* <Route path="/:username/:postid" element={<ChatAppNewSession />} /> */}
          <Route path="/tag" element={<SearchTagPage />} />
          <Route path="/search" element={<SearchPage />} />
          {/* <Route path="/post/:id" element={<ChatApp />} /> */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          {/* <Route path="/" element={<Navigate to="/search?q=r" />} /> */}
          <Route path="/" element={<ExplorePage />} />
          <Route path="/signin/t/:token" element={<SignInByToken />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppContextProvider>
    </BrowserRouter>
  );
};

export default App;
