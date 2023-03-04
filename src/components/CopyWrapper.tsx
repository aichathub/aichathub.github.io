import { Grid } from "@mui/material";
import CopyButton from "./CopyButton";
const CopyWrapper: React.FC<{
  content: string;
  children: JSX.Element;
}> = (props) => {
  return (
    <>
      <Grid style={{ position: "relative" }}>
        <CopyButton content={props.content} />
        {props.children}
      </Grid>
    </>
  );
};

export default CopyWrapper;
