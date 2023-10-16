import { Grid } from "@mui/material";
import CopyButton from "./CopyButton";
import classes from "./CopyWrapper.module.css";
import EditButton from "./EditButton";
import { AppContext } from "../store/AppContext";
import { useContext } from "react";

const CopyWrapper: React.FC<{
  content: string;
  children: JSX.Element;
  isEditing?: boolean;
  setIsEditing?: (isEditing: boolean) => void;
  hasRightToEdit?: boolean;
}> = (props) => {
  const context = useContext(AppContext);
  return (
    <>
      <Grid style={{ position: "relative" }} className={`${classes['horizontal-scroll']} ${context.darkMode ? classes['dark'] : classes['light']}`}>
        <CopyButton content={props.content} />
        {
          props.hasRightToEdit && !props.isEditing && props.setIsEditing && <EditButton setIsEditing={props.setIsEditing} />
        }
        {props.children}
      </Grid>
    </>
  );
};

export default CopyWrapper;
