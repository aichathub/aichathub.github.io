import { Box } from "@material-ui/core";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Tooltip } from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../store/AppContext";

const LikeButton: React.FC<{
  liked: boolean;
  likeCount: number;
  handleLikeBtnClick: () => void;
}> = (props) => {
  const context = useContext(AppContext);
  const isLogged = context.loggedUser && context.loggedUser.length > 0;

  return <Tooltip title="Like"><Box style={{
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    cursor: isLogged ? "pointer" : "default",
  }} onClick={props.handleLikeBtnClick}>
    {props.liked && <ThumbUpIcon />}
    {!props.liked && <ThumbUpOffAltIcon />}
    <span style={{ color: props.liked ? (context.darkMode ? '#fff' : '#000') : '#777', fontSize: "17px" }}>{props.likeCount === -1 ? '-' : props.likeCount}</span>
  </Box></Tooltip>;
}
export default LikeButton;