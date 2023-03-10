import { Grid } from "@mui/material";
import CopyButton from "./CopyButton";
import EditButton from "./EditButton";
const CopyWrapper: React.FC<{
  content: string;
  children: JSX.Element;
  isEditing?: boolean;
  setIsEditing?: (isEditing: boolean) => void;
  hasRightToEdit?: boolean;
}> = (props) => {
  return (
    <>
      <Grid style={{ position: "relative" }}>
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
