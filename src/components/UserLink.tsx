import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../store/AppContext";
import classes from "./UserLink.module.css";

const UserLink = (props: {
  username: string;
}) => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  return <span className={classes.userlink}> <a
    onClick={(e) => {
      const isMiddleMouseClick = e.button === 1;
      if (isMiddleMouseClick) return;
      e.preventDefault();
      context.setSearchBoxText(`@${props.username} `);
      navigate(`/search?q=@${props.username}`);
    }}
    href={`/search?q=@${props.username}`}
  >
    @{props.username}
  </a> </span>;
}

export default UserLink;
