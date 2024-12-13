import { Checkbox, Tooltip } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import { FormControlLabel, FormGroup, TextField } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { TransitionProps } from '@mui/material/transitions';
import * as React from 'react';
import { useContext, useRef, useState } from 'react';
import { PostModel } from '../models/PostModel';
import { TagModel } from '../models/TagModel';
import { AppContext } from '../store/AppContext';
import { updatePost } from '../util/db';
import TagsInput from './TagsInput';

const useStyles = makeStyles(theme => ({
  textField: {
    width: 400,
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(5),
  }
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditPostDialog: React.FC<{
  handleClose: () => void;
  post: PostModel;
}> = (props) => {
  const [open, setOpen] = React.useState(true);

  const context = useContext(AppContext);

  const titleRef = useRef<HTMLInputElement>(null);

  const [selectedTags, setSelectedTags] = useState<TagModel[]>(props.post.tags);

  const [selectedUsernames, setSelectedUsernames] = useState<TagModel[]>(props.post.usernames);

  const [isprivate, setIsprivate] = useState<boolean>(props.post.isprivate ? props.post.isprivate! : false);

  const classes = useStyles();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    props.handleClose();
    setOpen(false);
  };

  const handleHardRefresh = async () => {
    // await removePostsFromCache(context.auth.loggedEmail);
    context.setLastPostsRefresh(new Date());
  }

  const handleSave = async () => {
    handleClose();
    const result = await updatePost({ ...props.post, title: titleRef.current?.value!, tags: selectedTags, isprivate: isprivate, usernames: selectedUsernames }, context.auth.token);
    context.showSnack("Post Edited: " + result.message);
    if (result.message === "SUCCESS") {
      handleHardRefresh();
    }
  };

  const isForkedPost = props.post.forkedfromauthorusername !== undefined && props.post.forkedfromauthorusername !== null && props.post.forkedfromauthorusername.length > 0;

  return (
    <div>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative', bgcolor: "white", color: "black" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Edit Post
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSave}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <List>
          <TextField
            label="Title"
            name="title"
            defaultValue={props.post.title}
            style={{ marginLeft: "40px", marginTop: "5px", width: "400px" }}
            helperText="Enter your title"
            inputRef={titleRef}
            autoFocus
          />
        </List>
        <TagsInput value={selectedTags} setValue={setSelectedTags} helperText="Enter your tags" options={context.tags} />
        <TagsInput value={selectedUsernames} setValue={setSelectedUsernames} helperText="Shared Users" options={context.usernames} />
        <Tooltip title={isForkedPost ? "Forked post must be private at the moment" : "After checking your post cannot be searched or viewed except yourself."}>
          <FormGroup className={classes.textField}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={(isForkedPost ? true : isprivate)}
                  disabled={isForkedPost}
                  onChange={(event, checked) => {
                    setIsprivate(checked);
                  }}
                />
              }
              label={
                <>
                  <label style={{ verticalAlign: "text-bottom" }}>Is Private</label>
                  <LockIcon fontSize="small" style={{ marginLeft: "5px", marginTop: "2px" }} />
                </>
              }
            />
          </FormGroup>
        </Tooltip>
      </Dialog>
    </div>
  );
}
export default EditPostDialog;