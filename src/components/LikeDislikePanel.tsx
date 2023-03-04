/*
  const context = useContext(AppContext);
  const isLogged = context.loggedUser && context.loggedUser.length > 0;
  const [dislikeCount, setDislikeCount] = useState(-1);

  useEffect(() => {
    getDislikeCount(props.message.mid).then((response) => {
      setDislikeCount(+response.result);
    });
    isDisliked(props.message.mid, context.auth.loggedEmail, context.auth.token).then((response) => {
      setDisliked(response.result);
    });
  }, []);

  const handleLikeClick = async () => {
    if (!isLogged) return;
    if (disliked) {
      undislikeMessage(props.message.mid, context.auth.loggedEmail, context.auth.token);
      setDisliked(false);
      setDislikeCount(prevState => +prevState - 1);
    } else {
      dislikeMessage(props.message.mid, context.auth.loggedEmail, context.auth.token);
      setDisliked(true);
      setDislikeCount(prevState => +prevState + 1);
    }
  };


    const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(-1);

  useEffect(() => {
    getLikeCount(props.message.mid).then((response) => {
      console.log("response", response);
      setLikeCount(+response.result);
    });
    isLiked(props.message.mid, context.auth.loggedEmail, context.auth.token).then((response) => {
      setLiked(response.result);
    });
  }, []);

  const handleLikeClick = async () => {
    if (!isLogged) return;
    if (liked) {
      unlikeMessage(props.message.mid, context.auth.loggedEmail, context.auth.token);
      setLiked(false);
      setLikeCount(prevState => +prevState - 1);
    } else {
      likeMessage(props.message.mid, context.auth.loggedEmail, context.auth.token);
      setLiked(true);
      setLikeCount(prevState => +prevState + 1);
    }
  };
*/

import { Grid } from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import { getLikeCount, isLiked, getDislikeCount, isDisliked, unlikeMessage, likeMessage, dislikeMessage, undislikeMessage } from "../util/db";
import DislikeButton from "./DislikeButton";
import LikeButton from "./LikeButton";

const LikeDislikePanel: React.FC<{
  message: MessageModel;
}> = (props) => {
  const context = useContext(AppContext);
  const isLogged = context.auth.loggedEmail && context.auth.loggedEmail.length > 0;
  const [disliked, setDisliked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(-1);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(-1);
  useEffect(() => {
    getLikeCount(props.message.mid).then((response) => {
      setLikeCount(+response.result);
    });
    isLiked(props.message.mid, context.auth.loggedEmail, context.auth.token).then((response) => {
      setLiked(response.result);
    });
    getDislikeCount(props.message.mid).then((response) => {
      setDislikeCount(+response.result);
    });
    isDisliked(props.message.mid, context.auth.loggedEmail, context.auth.token).then((response) => {
      setDisliked(response.result);
    });
  }, []);
  const handleLikeBtnClick = () => {
    if (!isLogged) return;
    if (liked) {
      unlikeMessage(props.message.mid, context.auth.loggedEmail, context.auth.token);
      setLiked(false);
      setLikeCount(prevState => +prevState - 1);
    } else {
      likeMessage(props.message.mid, context.auth.loggedEmail, context.auth.token);
      setLiked(true);
      if (disliked) {
        setDisliked(false);
        setDislikeCount(prevState => +prevState - 1);
      }
      setLikeCount(prevState => +prevState + 1);
    }
  };
  const handleDislikeBtnClick = () => {
    if (!isLogged) return;
    if (disliked) {
      undislikeMessage(props.message.mid, context.auth.loggedEmail, context.auth.token);
      setDisliked(false);
      setDislikeCount(prevState => +prevState - 1);
    } else {
      dislikeMessage(props.message.mid, context.auth.loggedEmail, context.auth.token);
      setDisliked(true);
      if (liked) {
        setLiked(false);
        setLikeCount(prevState => +prevState - 1);
      }
      setDislikeCount(prevState => +prevState + 1);
    }
  };
  return <Grid container spacing={1}>
    <Grid item>
      <LikeButton liked={liked} likeCount={likeCount} handleLikeBtnClick={handleLikeBtnClick} />
    </Grid>
    <Grid item>
      <DislikeButton disliked={disliked} dislikeCount={dislikeCount} handleDislikeBtnClick={handleDislikeBtnClick} />
    </Grid>
  </Grid>
}
export default LikeDislikePanel;