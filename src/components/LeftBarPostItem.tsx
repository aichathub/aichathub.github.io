import { Grid, ListItemIcon, ListItemText } from "@material-ui/core";
import ListItem from "@mui/material/ListItem";
import { ListItemButton } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { AppContext } from "../store/AppContext";
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditPostDialog from "./EditPostDialog";
import { PostModel } from "../models/PostModel";
import { deletePostByUsernameAndPid } from "../util/db";
import LockIcon from '@mui/icons-material/Lock';

const LeftBarPostItem: React.FC<{ post: PostModel }> = (props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showEditPostDialog, setShowEditPostDialog] = useState(false);
  const open = Boolean(anchorEl);
  const context = useContext(AppContext);
  const post = props.post;
  const { username, postid } = useParams();
  const navigate = useNavigate();

  const handleClickPostItem = () => {
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
      context.setLastPostsRefresh(new Date());
      if (username === context.loggedUser && postid === post.pid) {
        context.setDoesPostExist(false);
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
  return (
    <>
      {showEditPostDialog && <EditPostDialog handleClose={handleCloseEditPostDialog} post={post} />}
      <ListItem key={post.pid} disablePadding>
        <ListItemButton onClick={handleClickPostItem}>
          <ListItemIcon>
            {post.isprivate ? <LockIcon /> : <ChatBubbleOutlineIcon />}
          </ListItemIcon>
          <ListItemText primary={post.title} />
        </ListItemButton>
        <Grid xs={3}>
          <ListItemButton onClick={handleClickPostItemMore}>
            <ListItemIcon >
              <MoreHorizIcon />
            </ListItemIcon>
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
          <MenuItem onClick={handleDeletePost}>Delete</MenuItem>
          <MenuItem onClick={handleEditTitle}>Edit</MenuItem>
        </Menu>
      </ListItem>
    </>
  );
};
export default LeftBarPostItem;
