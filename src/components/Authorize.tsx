import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { AppContext } from "../store/AppContext";
import { backendServer } from "../util/constants";
const socket = io(backendServer);

const Authorize = () => {
  const { sessionid } = useParams();
  const context = useContext(AppContext);
  const [message, setMessage] = useState("Loading...");
  useEffect(() => {
    if (sessionid && context.auth) {
      socket.emit("authorize", {
        sessionid: sessionid,
        token: context.auth.token,
        loggedEmail: context.auth.loggedEmail
      });
      socket.on("authorize", (data) => {
        if (data.message === "SUCCESS") {
          setMessage("You have authorized the request successfully! Redirecting to the home page in 3 seconds...");
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        } else {
          setMessage(data.message);
        }
      });
    }
  }, [sessionid, context.auth]);
  return <>{message}</>;
}
export default Authorize;