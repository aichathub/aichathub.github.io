import { Grid, ListItemText } from "@material-ui/core";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { ListItemButton, ListItemIcon, Tooltip } from "@mui/material";
import ListItem from "@mui/material/ListItem";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PostModel } from "../models/PostModel";
import { AppContext } from "../store/AppContext";
import { deletePostByUsernameAndPid } from "../util/db";
import EditPostDialog from "./EditPostDialog";

const LeftBarPostItem: React.FC<{ post: PostModel; removePost: (post: PostModel) => void; }> = (props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showEditPostDialog, setShowEditPostDialog] = useState(false);
  const open = Boolean(anchorEl);
  const context = useContext(AppContext);
  const post = props.post;
  const { username, postid } = useParams();
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 600;

  const handleClickPostItem = () => {
    context.setIsFirstLoad(true);
    context.setMessages([]);
    context.setIsLoadingMessages(true);
    navigate(`/${context.loggedUser}/${post.pid}`);
  };
  const handleClickPostItemMore = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const handleDeletePost = async () => {
    handleCloseMenu();
    const result = await deletePostByUsernameAndPid(context.loggedUser, post.pid, context.auth.token);
    if (result.message === "SUCCESS") {
      props.removePost(post);
      if (context.curPost && context.curPost.authoremail === context.auth.loggedEmail && context.curPost.pid === post.pid) {
        context.setDoesPostExist(false);
        navigate("/");
        document.title = "AIChatHub";
      }
    }
    context.showSnack("DELETE POST: " + result.message);
  };
  const handleCloseEditPostDialog = () => {
    setShowEditPostDialog(false);
  }
  const handleEditTitle = () => {
    setShowEditPostDialog(true);
    handleCloseMenu();
  }
  let style = {};
  if (context.curPost && context.curPost.authoremail === context.auth.loggedEmail && context.curPost.pid === post.pid) {
    style = {
      backgroundColor: context.darkMode ? "rgba(39,30,20,0.7)" : "rgba(254,251,195,0.7)",
      borderLeft: isMobile ? "2px solid #d30" : "4px solid red"
    }
  }
  return (
    <>
      {showEditPostDialog && <EditPostDialog handleClose={handleCloseEditPostDialog} post={post} />}
      <ListItem key={post.pid} disablePadding style={style}>
        <ListItemButton onClick={handleClickPostItem}>
          {post.isprivate ? <LockIcon /> : <ChatBubbleOutlineIcon />}
          <Tooltip title={`${post.username}/${post.pid}`} placement="right">
            <ListItemText primary={post.title} style={{ marginLeft: "10px" }} />
          </Tooltip>
        </ListItemButton>
        <Grid>
          <ListItemButton onClick={handleClickPostItemMore}>
            <MoreHorizIcon />
          </ListItemButton>
        </Grid>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem
            onClick={handleEditTitle}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={handleDeletePost}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </ListItem>
    </>
  );
};
export default LeftBarPostItem;
