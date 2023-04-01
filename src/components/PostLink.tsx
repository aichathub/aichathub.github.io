import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../store/AppContext";
import classes from "./PostLink.module.css";

const PostLink = (props: {
  username: string;
  pid: string
}) => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  return <span className={classes.postlink}> <a
    onClick={(e) => {
      const isMiddleMouseClick = e.button === 1;
      if (isMiddleMouseClick) return;
      e.preventDefault();
      context.setIsLoadingMessages(true);
      context.setIsFirstLoad(true);
      context.setMessages([]);
      context.setLastMessagesRefresh(new Date());
      navigate(`/${props.username}/${props.pid}`);
    }}
    href={`/${props.username}/${props.pid}`}
  >
    {props.username}/{props.pid}
  </a> </span>
}

export default PostLink;
