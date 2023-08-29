import { useContext } from "react";
import Collapsible from "react-collapsible";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import CodeBlock from "./CodeBlock";
import classes from "./Message.module.css";
import VisibilityIconToggleButton from "./VisibilityIconToggleButton";

const MarkdownComponent: React.FC<{
  content: string;
  message?: MessageModel;
}> = (props) => {
  const context = useContext(AppContext);
  return <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    children={props.content + ((props.message && props.content.length < props.message.content.length && context.isTypingMessage) ? "▌" : "")}
    linkTarget="_blank"
    components={{
      code({ node, inline, className, children, ...props }) {
        const match = /language-(.+)/.exec(className || "");
        const isSecret = match !== null && match[0].startsWith("language-secret");
        const isCollapse = match !== null && match[0] === "language-collapse";
        const language = isSecret ? match[0].replace(/language-secret-?/, "") : (match === null ? "" : match[0].replace("language-", ""));
        if (isCollapse) {
          return <Collapsible trigger={<VisibilityIconToggleButton />}>
            <MarkdownComponent content={children.toString()} />
          </Collapsible>;
        }
        let content = !inline ? (
          <CodeBlock content={String(children).replace(/\n\n/g, "\n").replace(/\n$/, '')} language={language === "" ? undefined : language} />
        ) : (
          <code className={className + ` ${classes["inline-code"]}`} {...props} >
            `{children}`
          </code>
        );
        if (isSecret) {
          content = <Collapsible trigger={<VisibilityIconToggleButton />}>
            {content}
          </Collapsible>;
        }
        return content;
      },
      a({ node, className, children, ...props }) {
        const youtubeIdRetriever = (url: string) => {
          var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
          var match = url.match(regExp);
          return (match && match[7].length == 11) ? match[7] : "";
        }
        let res = <span className={classes.mdlink}>
          <a className={className} {...props}>
            {children}
          </a>
        </span>;
        if (props.href) {
          const youtubeId = youtubeIdRetriever(props.href);
          if (youtubeId.length > 0) {
            res = <>
              {res}
              <div>
                <iframe width="560" height="315" style={{ maxWidth: "85%", marginTop: "12px" }} src={"https://www.youtube.com/embed/" + youtubeId} />
              </div>
            </>
          }
        }
        return res;
      },
      blockquote({ node, className, children, ...props }) {
        return (
          <blockquote className={classes.blockquote}>
            {children}
          </blockquote>
        )
      },
      img({ node, className, children, ...props }) {
        return (
          <img className={className} style={{ maxWidth: "100%" }} {...props}>
            {children}
          </img>
        )
      }
    }}
  />
};
export default MarkdownComponent;