import { Tooltip } from "@material-ui/core";
import ForkLeftIcon from '@mui/icons-material/ForkLeft';
import { Box, CircularProgress } from "@mui/material";
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PostModel } from "../models/PostModel";
import { AppContext } from "../store/AppContext";
import { forkPost } from "../util/db";

const ForkButton: React.FC<{
  post: PostModel;
}> = (props) => {
  const context = useContext(AppContext);
  const isLogged = context.loggedUser && context.loggedUser.length > 0;
  const [isForking, setIsForking] = useState(false);
  const { username, postid } = useParams();
  const navigate = useNavigate();
  const handleForkClick = async () => {
    if (!isLogged || isForking) return;
    setIsForking(true);
    forkPost(username!, postid!, context.auth.loggedEmail, context.auth.token).then((response) => {
      context.showSnack(response.message);
      if (response.message === "SUCCESS") {
        const result = response.result as PostModel;
        context.setMessages([]);
        context.setLastPostsRefresh(new Date());
        context.setJustForked(true);
        navigate(`/${context.loggedUser}/${result.pid}`);
      }
      setIsForking(false);
    });

    // if (starred) {
    //   unstarPost(props.post.authoremail, props.post.pid, context.auth.loggedEmail, context.auth.token);
    //   setStarred(false);
    //   setForkedCount(prevState => +prevState - 1);
    // } else {
    //   starPost(props.post.authoremail, props.post.pid, context.auth.loggedEmail, context.auth.token);
    //   setStarred(true);
    //   setForkedCount(prevState => +prevState + 1);
    // }
  };

  return <Tooltip
    title={`${!isLogged ? "" : "Fork"}`}
    placement="top"
    arrow
  >
    <Box style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      cursor: isLogged ? "pointer" : "default",
    }} onClick={handleForkClick}>
      {/* {starred && <StarIcon />} */}
      {/* {!starred && <StarBorderIcon style={{ fill: "grey" }} />} */}
      {
        isForking ? <CircularProgress size={20} color="inherit" /> : <ForkLeftIcon fontSize="small" />
      }
      {/* <span style={{ fontSize: "17px" }}>{forkedCount}</span> */}
      {/* <span style={{ color: starred ? (context.darkMode ? '#fff' : '#000') : '#777', fontSize: "17px" }}>{forkedCount}</span> */}
    </Box>
  </Tooltip>;
}
export default ForkButton;