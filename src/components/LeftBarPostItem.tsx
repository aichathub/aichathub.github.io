import { Grid, ListItemText } from "@material-ui/core";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ForkLeftIcon from '@mui/icons-material/ForkLeft';
import LockIcon from '@mui/icons-material/Lock';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { ListItemButton, ListItemIcon, Skeleton } from "@mui/material";
import ListItem from "@mui/material/ListItem";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PostModel } from "../models/PostModel";
import { AppContext } from "../store/AppContext";
import { deletePostByUsernameAndPid } from "../util/db";
import EditPostDialog from "./EditPostDialog";

const LeftBarPostItem: React.FC<{ post: PostModel; removePost: (post: PostModel) => void; isLoading?: boolean }> = (props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showEditPostDialog, setShowEditPostDialog] = useState(false);
  const open = Boolean(anchorEl);
  const context = useContext(AppContext);
  const post = props.post;
  const { username, postid } = useParams();
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 600;
  const isLoading = props.isLoading;

  const handleClickPostItem = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    if (e.button === 1 || e.ctrlKey || e.metaKey) {
      window.open(e.currentTarget.href, "_blank");
      return;
    }
    if (isLoading) return;
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
      if (context.curPost && context.curPost.username === context.loggedUser && context.curPost.pid === post.pid) {
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
  const isCurPost = context.curPost && context.curPost.username === context.loggedUser && context.curPost.pid === post.pid;
  if (isCurPost) {
    style = {
      backgroundColor: context.darkMode ? "rgba(39,30,20,0.7)" : "rgba(254,251,195,0.7)",
      borderLeft: isMobile ? "2px solid #d30" : "4px solid red"
    }
  }
  const myRef = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    const isCurPost = context.curPost && context.curPost.username === context.loggedUser && context.curPost.pid === post.pid;
    if (isCurPost && myRef.current) {
      myRef.current.scrollIntoView({ block: "center" });
    }
  }, [context.curPost]);
  return (
    <>
      {showEditPostDialog && <EditPostDialog handleClose={handleCloseEditPostDialog} post={post} />}
      <ListItem key={post.pid} disablePadding style={style} ref={myRef}>
        <ListItemButton>
          {
            isLoading ? <Skeleton variant="circular" width={"30px"} height={"30px"} /> :
              post.forkedfrompid ? <ForkLeftIcon /> :
                post.isprivate ? <LockIcon /> : <ChatBubbleOutlineIcon />
          }
          {isLoading ? <Skeleton variant="rounded" height={"30px"} width={"80%"} sx={{ marginLeft: "5px" }} /> :
            <a href={`/${post.username}/${post.pid}`} style={{ width: "100%", textDecoration: "none", color: "inherit" }} onClick={handleClickPostItem}>
              <ListItemText primary={post.title} style={{ marginLeft: "10px", overflowWrap: "break-word" }} />
            </a>
          }
        </ListItemButton>
        <Grid>
          {!isLoading &&
            <ListItemButton onClick={handleClickPostItemMore}>
              <MoreHorizIcon />
            </ListItemButton>
          }
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
