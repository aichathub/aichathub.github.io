import { useContext, useState } from "react";
import Highlight from "react-highlight";
import { AppContext } from "../store/AppContext";
import "./AtomOneDark.css";
import "./AtomOneLight.css";
import CopyWrapper from "./CopyWrapper";


const CodeBlock: React.FC<{
  content: string;
  language?: string;
  isMasked?: boolean;
}> = (props) => {
  const context = useContext(AppContext);
  const maskedContent = props.content.trim().replace(/./g, "●");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <CopyWrapper content={props.content}>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Highlight
          className={`${props.language} ${context.darkMode ? "onedark" : "onelight"}`}
        >
          {(!props.isMasked || isHovered) ? props.content.trim() : maskedContent}
        </Highlight>
      </div>
    </CopyWrapper>
  );
};

export default CodeBlock;