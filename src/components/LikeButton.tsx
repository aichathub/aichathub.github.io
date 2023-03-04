import { Box } from "@material-ui/core";
import { useContext } from "react";
import { AppContext } from "../store/AppContext";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

const LikeButton: React.FC<{
  liked: boolean;
  likeCount: number;
  handleLikeBtnClick: () => void;
}> = (props) => {
  const context = useContext(AppContext);
  const isLogged = context.loggedUser && context.loggedUser.length > 0;

  return <Box style={{
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    cursor: isLogged ? "pointer" : "default",
  }} onClick={props.handleLikeBtnClick}>
    {props.liked && <ThumbUpIcon />}
    {!props.liked && <ThumbUpOffAltIcon />}
    <span style={{ color: props.liked ? '#000' : '#777', fontSize: "17px" }}>{props.likeCount === -1 ? '-' : props.likeCount}</span>
  </Box>;
}
export default LikeButton;