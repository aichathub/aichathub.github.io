import Highlight from "react-highlight";
import CopyWrapper from "./CopyWrapper";

const CodeBlock: React.FC<{
  content: string;
  language?: string;
}> = (props) => {
  return (
    <CopyWrapper content={props.content}>
      <Highlight className={props.language}>{props.content.trim()}</Highlight>
    </CopyWrapper>
  );
};

export default CodeBlock;