import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import List from "@mui/material/List";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Tooltip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppContext } from "../store/AppContext";
import { useContext, useRef, useState } from "react";
import { insertPostByUsernameAndTitle } from "../util/db";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import TagsInput from "./TagsInput";
import { TagModel } from "../models/TagModel";
import LockIcon from '@mui/icons-material/Lock';

const useStyles = makeStyles((theme) => ({
  textField: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(5),
    marginRight: theme.spacing(1),
    width: 400,
  },
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const NewPostDialog: React.FC<{
  handleClose: () => void;
}> = (props) => {
  const [open, setOpen] = useState(true);

  const [isprivate, setIsprivate] = useState(false);

  const context = useContext(AppContext);

  const titleRef = useRef<HTMLInputElement>(null);

  const classes = useStyles();

  const navigate = useNavigate();

  const [selectedTags, setSelectedTags] = useState<TagModel[]>([]);

  const handleClose = () => {
    props.handleClose();
    setOpen(false);
  };

  const handleSave = async () => {
    handleClose();
    const response = await insertPostByUsernameAndTitle(
      context.loggedUser,
      titleRef.current?.value!,
      context.auth.token,
      selectedTags,
      isprivate
    );
    if (response.message === "SUCCESS") {
      context.setLastPostsRefresh(new Date());
      navigate(`/${context.loggedUser}/${response.result.pid}`);
    }
    context.showSnack("ADD POST: " + response.message);
  };

  return (
    <div>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative", bgcolor: "white", color: "black" }}>
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
              Add Post
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
            className={classes.textField}
            helperText="Enter your title"
            inputRef={titleRef}
            autoFocus
          />
        </List>
        <TagsInput value={selectedTags} setValue={setSelectedTags} />
        <Tooltip title="After checking your post cannot be searched or viewed except yourself.">
          <FormGroup className={classes.textField}>
            <FormControlLabel
              control={
                <Checkbox
                  value={isprivate}
                  onChange={(event, checked) => {
                    setIsprivate(checked);
                  }}
                />
              }
              label={
                <>
                  <label style={{verticalAlign: "text-bottom"}}>Is Private</label>
                  <LockIcon fontSize="small" style={{marginLeft: "5px", marginTop: "2px"}}/>
                </>
              }
            />
          </FormGroup>
        </Tooltip>
      </Dialog>
    </div>
  );
};
export default NewPostDialog;
