import Grid from "@material-ui/core/Grid";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Timeago from "react-timeago";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Chip, Tooltip } from "@material-ui/core";
import { PostModel } from "../models/PostModel";
import { useEffect, useState, useContext } from "react";
import { getUsernameByEmail, starPost, unstarPost } from "../util/db";
import Link from '@mui/material/Link';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate } from "react-router-dom";
import { AppContext } from "../store/AppContext";
import { TagModel } from "../models/TagModel";
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
  const [author, setAuthor] = useState("");
  useEffect(() => {
    getUsernameByEmail(props.post.authoremail).then((res) => {
      if (res.message === "SUCCESS") {
        setAuthor(res.result);
      }
    });
  }, []);
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
              <Grid>
                <ChatBubbleOutlineIcon fontSize="small" sx={{ marginRight: "10px" }} />
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    navigate(`/${author}/${props.post.pid}`);
                  }}
                  sx={{ marginBottom: "12px" }}
                >
                  {author}/{props.post.pid}
                </Link>
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
