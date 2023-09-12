import { useContext, useEffect, useState } from "react";
import { AppContext } from "../store/AppContext";
import { findMidByKeyword } from "../util/db";
import classes from "./PostLink.module.css";

const PostLink: React.FC<{
  username: string;
  pid: string;
  searchQuery?: string;
}> = (props) => {
  const context = useContext(AppContext);
  const [url, setUrl] = useState(`/${props.username}/${props.pid}`);

  const generateMidUrl = () => {
    if (props.searchQuery) {
      findMidByKeyword(props.username, props.pid, props.searchQuery, context.auth.token).then((response) => {
        if (response.message !== "SUCCESS") {
          return;
        }
        const mids = response.result;
        if (mids.length > 0) {
          setUrl(`/${props.username}/${props.pid}#m${mids[mids.length - 1].mid}`);
        }
      });
    }
  }

  useEffect(() => {
    generateMidUrl();
  }, [context.auth.token]);

  useEffect(() => {
    generateMidUrl();
  }, []);

  return <span className={classes.postlink}> <a
    onClick={(e) => {
      const isMiddleMouseClick = e.button === 1;
      if (isMiddleMouseClick) return;
      e.preventDefault();
      context.navigateToPost(url);
    }}
    href={url}
  >
    {props.username}/{props.pid}
  </a> </span>
}

export default PostLink;
