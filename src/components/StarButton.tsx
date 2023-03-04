import { Box, Tooltip } from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import { PostModel } from "../models/PostModel";
import { AppContext } from "../store/AppContext";
import { getStarCount, getUsernameByEmail, starPost, unstarPost } from "../util/db";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const StarButton: React.FC<{
  post: PostModel;
}> = (props) => {
  const context = useContext(AppContext);
  const isLogged = context.loggedUser && context.loggedUser.length > 0;
  const [starred, setStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const handleStarClick = async () => {
    if (!isLogged) return;
    if (starred) {
      unstarPost(props.post.authoremail, props.post.pid, context.auth.loggedEmail, context.auth.token);
      setStarred(false);
      setStarCount(prevState => +prevState - 1);
    } else {
      starPost(props.post.authoremail, props.post.pid, context.auth.loggedEmail, context.auth.token);
      setStarred(true);
      setStarCount(prevState => +prevState + 1);
    }
  };
  useEffect(() => {
    getUsernameByEmail(props.post.authoremail).then((res) => {
      if (res.message === "SUCCESS") {
        const author = res.result;
        getStarCount(author, props.post.pid).then((res) => {
          if (res.message === "SUCCESS") {
            setStarCount(res.result);
          }
        });
      }
    });
  }, []);
  useEffect(() => {
    setStarred(context.isPostStarred(props.post.authoremail, props.post.pid));
  }, [context.starredPosts]);
  return <Tooltip
    title={`${!isLogged ? "" : (starred ? "UnStar" : "Star")}`}
    placement="bottom"
  >
    <Box style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      cursor: isLogged ? "pointer" : "default",
    }} onClick={handleStarClick}>
      {starred && <StarIcon />}
      {!starred && <StarBorderIcon style={{ fill: "grey" }} />}
      <span style={{ color: starred ? '#000' : '#777', fontSize: "17px" }}>{starCount}</span>
    </Box>
  </Tooltip>;
}
export default StarButton;