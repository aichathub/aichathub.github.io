import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGeneratedSessionid } from "../util/db";

const ChatAppNewSession = () => {
  const { username, postid } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (!username || !postid) return;
    getGeneratedSessionid(username, postid).then(response => {
      console.log(response);
      if (response.message === "SUCCESS") {
        window.location.replace(`/${username}/${postid}/${response.result}`);
        // navigate(`/${username}/${postid}/${response.result}`, { replace: true });
      }
    });
  }, []);
  return <></>;
};

export default ChatAppNewSession;