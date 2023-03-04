import Highlight from "react-highlight";
import CopyWrapper from "./CopyWrapper";

const CodeBlock: React.FC<{
  content: string;
}> = (props) => {
  return (
    <CopyWrapper content={props.content}>
      <Highlight>{props.content.trim()}</Highlight>
    </CopyWrapper>
  );
};

export default CodeBlock;