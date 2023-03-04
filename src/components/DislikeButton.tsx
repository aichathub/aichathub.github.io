import { Box } from "@material-ui/core";
import { useContext } from "react";
import { AppContext } from "../store/AppContext";
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';

const DislikeButton: React.FC<{
  disliked: boolean;
  dislikeCount: number;
  handleDislikeBtnClick: () => void;
}> = (props) => {
  const context = useContext(AppContext);
  const isLogged = context.auth.loggedEmail !== null;
  return <Box style={{
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    cursor: isLogged ? "pointer" : "default",
  }} onClick={props.handleDislikeBtnClick}>
    {props.disliked && <ThumbDownIcon />}
    {!props.disliked && <ThumbDownOffAltIcon />}
    <span style={{ color: props.disliked ? '#000' : '#777', fontSize: "17px" }}>{props.dislikeCount === -1 ? '-' : props.dislikeCount}</span>
  </Box>;
}
export default DislikeButton;