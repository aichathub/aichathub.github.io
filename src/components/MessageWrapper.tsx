import { Grid } from "@mui/material";
import { MessageModel } from "../models/MessageModel";
import MessageMoreButton from "./MessageMoreButton";

const MessageWrapper: React.FC<{
  children: JSX.Element;
  message: MessageModel;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isLoading?: boolean;
}> = (props) => {
  return (
    <>
      <Grid style={{ position: "relative" }}>
        {!props.isLoading && <MessageMoreButton message={props.message} isEditing={props.isEditing} setIsEditing={props.setIsEditing} />}
        {props.children}
      </Grid>
    </>
  );
};

export default MessageWrapper;
