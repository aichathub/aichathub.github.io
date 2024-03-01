import { Grid } from "@mui/material";
import { MessageModel } from "../models/MessageModel";
import MessageMoreButton from "./MessageMoreButton";

const MessageWrapper: React.FC<{
  children: JSX.Element;
  message: MessageModel;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  setShouldUseMonaco: (shouldUseMonaco: boolean) => void;
  isLoading?: boolean;
  isPythonRuntime?: boolean;
  setIsHiddenFromAI: (isHiddenFromAI: boolean) => void;
}> = (props) => {
  return (
    <>
      <Grid style={{ position: "relative", opacity: props.message.ishiddenfromai ? .7 : 1 }}>
        {!props.isLoading && <MessageMoreButton
          message={props.message}
          isEditing={props.isEditing}
          setIsEditing={props.setIsEditing}
          setShouldUseMonaco={props.setShouldUseMonaco}
          isPythonRuntime={props.isPythonRuntime}
          setIsHiddenFromAI={props.setIsHiddenFromAI} />}
        {props.children}
      </Grid>
    </>
  );
};

export default MessageWrapper;
