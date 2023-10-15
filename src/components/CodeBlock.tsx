import { useContext } from "react";
import Highlight from "react-highlight";
import { AppContext } from "../store/AppContext";
import "./AtomOneDark.css";
import "./AtomOneLight.css";
import CopyWrapper from "./CopyWrapper";


const CodeBlock: React.FC<{
  content: string;
  language?: string;
}> = (props) => {
  const context = useContext(AppContext);
  return (
    <CopyWrapper content={props.content}>
      <Highlight className={`${props.language} ${context.darkMode ? "onedark" : "onelight"}`}>{props.content.trim()}</Highlight>
    </CopyWrapper>
  );
};

export default CodeBlock;