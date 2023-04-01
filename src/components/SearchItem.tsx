import { Box, Chip, Tooltip } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LockIcon from '@mui/icons-material/Lock';
import Paper from "@mui/material/Paper";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Timeago from "react-timeago";
import { PostModel } from "../models/PostModel";
import { TagModel } from "../models/TagModel";
import { AppContext } from "../store/AppContext";
import classes from "./SearchItem.module.css";
import StarButton from "./StarButton";

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  maxWidth: 400,
  color: theme.palette.text.primary,
}));

const theme = createTheme({
  typography: {
    fontSize: 12,
  },
});

const SearchItem: React.FC<{
  post: PostModel;
  typeEffect?: boolean;
}> = (props) => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  return (
    <StyledPaper
      sx={{
        my: 1,
        mx: "0%",
        p: 2,
        minWidth: "100%",
        paddingLeft: 5,
      }}
    >
      <Grid container wrap="nowrap" spacing={2}>
        <Grid item xs={10}>
          <Grid container spacing={2}>
            <Grid
              item
              style={{
                position: "relative",
              }}
            >
              <Grid className={classes.searchItem}>
                {props.post.isprivate ?
                  <LockIcon fontSize="small" sx={{ marginRight: "10px", transform: "translateY(5px)" }} /> :
                  <ChatBubbleOutlineIcon fontSize="small" sx={{ marginRight: "10px", transform: "translateY(5px)" }} />
                }
                <a
                  onClick={(e) => {
                    const isMiddleMouseClick = e.button === 1;
                    if (isMiddleMouseClick) return;
                    e.preventDefault();
                    context.setIsLoadingMessages(true);
                    context.setIsFirstLoad(true);
                    context.setMessages([]);
                    navigate(`/${props.post.username}/${props.post.pid}`);
                  }}
                  href={`/${props.post.username}/${props.post.pid}`}
                >
                  {props.post.username}/{props.post.pid}
                </a>
                {/* <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    context.setIsLoadingMessages(true);
                    context.setIsFirstLoad(true);
                    context.setMessages([]);
                    navigate(`/${props.post.username}/${props.post.pid}`);
                  }}
                  sx={{ marginBottom: "12px" }}
                >
                  {props.post.username}/{props.post.pid}
                </Link> */}
              </Grid>
              <Grid>
                <Typography variant="h6" style={{ fontWeight: "bold" }}>
                  {props.post.title}
                </Typography>
              </Grid>
              <Box
                style={{
                  position: "relative",
                }}
              >
                <ThemeProvider theme={theme}>
                  {
                    props.post.tags?.map((tag: TagModel, index) => {
                      return (
                        <Chip
                          key={index}
                          label={tag.tag}
                          variant="outlined"
                          onClick={() => { navigate(`/tag?q=${tag.tag}`) }}
                          style={{
                            marginRight: "5px",
                            color: context.darkMode ? "white" : "black",
                          }}
                        />
                      )
                    })
                  }
                  <Box style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <StarButton post={props.post} />
                    <Tooltip
                      title={
                        new Date(props.post.createdate).toLocaleDateString() +
                        " " +
                        new Date(props.post.createdate)
                          .toLocaleTimeString()
                          .slice(0, -3) // Don't show seconds
                      }
                      placement="bottom"
                    >
                      <span style={{ color: '#777' }}>
                        Created <Timeago date={props.post.createdate} title="" />
                      </span>
                    </Tooltip>
                  </Box>
                </ThemeProvider>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};
export default SearchItem;
