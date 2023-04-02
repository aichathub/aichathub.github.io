import { Box, Tooltip } from "@material-ui/core";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { CircularProgress } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { PostModel } from "../models/PostModel";
import { AppContext } from "../store/AppContext";
import { getStarCount, isStarred, starPost, unstarPost } from "../util/db";

const StarButton: React.FC<{
  post: PostModel;
  canClick?: boolean;
}> = (props) => {
  const context = useContext(AppContext);
  const isLogged = context.loggedUser && context.loggedUser.length > 0;
  const [starred, setStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const handleStarClick = async () => {
    if (!isLogged || !props.canClick) return;
    if (starred) {
      setIsLoading(true);
      unstarPost(props.post.authoremail, props.post.pid, context.auth.loggedEmail, context.auth.token).then((response) => {
        setIsLoading(false);
        if (response.message === "SUCCESS") {
          setStarred(false);
          setStarCount(prevState => +prevState - 1);
        } else {
          context.showSnack("UNSTAR: " + response.message);
        }
      });
    } else {
      setIsLoading(true);
      starPost(props.post.authoremail, props.post.pid, context.auth.loggedEmail, context.auth.token).then((response) => {
        setIsLoading(false);
        if (response.message === "SUCCESS") {
          setStarred(true);
          setStarCount(prevState => +prevState + 1);
        } else {
          context.showSnack("STAR: " + response.message);
        }
      });
    }
  };
  useEffect(() => {
    setIsReady(true);
    getStarCount(props.post.username!, props.post.pid).then((response2) => {
      if (!context.auth) {
        setIsReady(true);
      }
      if (response2.message !== "SUCCESS") {
        context.showSnack("GET START COUNT: " + response2.message);
        return;
      }
      setStarCount(response2.result);
      if (!context.loggedUser) return;
      isStarred(context.loggedUser, props.post.username!, props.post.pid).then((response1) => {
        setIsReady(true);
        if (response1.message !== "SUCCESS") {
          context.showSnack("IS STARRED: " + response1.message);
          return;
        }
        setStarred(response1.result);
      });
    });
  }, []);
  return <Tooltip
    title={`${(!isLogged || !props.canClick) ? "" : (starred ? "UnStar" : "Star")}`}
    arrow
  >
    <Box style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      cursor: isLogged && props.canClick ? "pointer" : "default",
      opacity: isReady ? 1 : 0,
    }} onClick={handleStarClick}>
      {isLoading && <CircularProgress color="inherit" size={20} style={{ marginRight: "5px" }} />}
      {!isLoading && starred && <StarIcon />}
      {!isLoading && !starred && <StarBorderIcon style={{ fill: "grey" }} />}
      <span style={{ color: starred ? (context.darkMode ? '#fff' : '#000') : '#777', fontSize: "17px" }}>{starCount}</span>
    </Box>
  </Tooltip>;
}
export default StarButton;