import React, { useContext } from "react";
import Collapsible from "react-collapsible";
import ReactMarkdown from "react-markdown";
import MathJax from "react-mathjax";
import remarkGfm from "remark-gfm";
import { MessageModel } from "../models/MessageModel";
import { AppContext } from "../store/AppContext";
import CodeBlock from "./CodeBlock";
import classes from "./Message.module.css";
import VisibilityIconToggleButton from "./VisibilityIconToggleButton";
import markDownClasses from "./MarkdownComponent.module.css";

const MarkdownComponent: React.FC<{
  content: string;
  message?: MessageModel;
}> = (props) => {
  const context = useContext(AppContext);
  const hashCode = (s: string) => {
    var hash = 0,
      i, chr;
    if (s.length === 0) return hash;
    for (i = 0; i < s.length; i++) {
      chr = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
  // Replace empty lines with empty lines with an empty space, except for code block
  const content = props.content.replace(/\n\n/gi, "&nbsp;\n\n").replace(/```(.*)&nbsp;/gi, "```$1");
  return <MathJax.Provider>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      children={content + ((props.message && props.content.length < props.message.content.length && context.isTypingMessage) ? "▌" : "")}
      linkTarget="_blank"
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(.+)/.exec(className || "");
          const isSecret = match !== null && match[0].startsWith("language-secret");
          const isCollapse = match !== null && match[0] === "language-collapse";
          const language = isSecret ? match[0].replace(/language-secret-?/, "") : (match === null ? "" : match[0].replace("language-", ""));
          if (isCollapse) {
            return <div className={markDownClasses.mycollapse}>
              <Collapsible trigger={<VisibilityIconToggleButton />}>
                <MarkdownComponent content={String(children).replace(/\n\n/g, "\n")} />
              </Collapsible>
            </div>;
          }
          let content = <></>;
          if (inline) {
            content = <code className={className + ` ${classes["inline-code"]}`} {...props} >
              `{children}`
            </code>;
          } else if (language === "latex") {
            // Replace empty lines with empty lines with a space
            const formula = String(children).replaceAll("&nbsp;\n\n", "\n\n").replaceAll("\\\\ \\\\", "\\\\ \\ \\\\");
            content = <MathJax.Node inline formula={formula} />
          } else {
            content = <CodeBlock content={String(children).replaceAll("&nbsp;\n", "\n").replace(/\n\n/g, "\n").replace(/\n$/, '')} language={language === "" ? undefined : language} />
          }
          if (isSecret) {
            content = <Collapsible trigger={<VisibilityIconToggleButton />}>
              {content}
            </Collapsible>;
          }
          return <React.Fragment key={hashCode(content.toString())}>{content}</React.Fragment>;
        },
        a({ node, className, children, ...props }) {
          const youtubeIdRetriever = (url: string) => {
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(live\/)|(watch\?))\??v?=?([^#&?]*).*/;
            var match = url.match(regExp);
            return (match && match[8] && match[8].length === 11) ? match[8] : "";
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
                <p>
                  <iframe title={"youtube-" + youtubeId} width="560" height="315" style={{ maxWidth: "calc(100% - 12px)" }} src={"https://www.youtube.com/embed/" + youtubeId} />
                </p>
              </>
            }
            const spotifyIdRetriever = (url: string) => {
              const regExp = /^.*((open.spotify.com\/))([^#&?]*).*/;
              const match = url.match(regExp);
              return (match && match[3] && match[3].length > 0) ? match[3] : "";
            }
            const spotifyId = spotifyIdRetriever(props.href);
            if (spotifyId.length > 0) {
              res = <>
                {res}
                <>
                  <iframe title={"spotifiy-" + spotifyId} style={{ borderRadius: "12px" }} src={`https://open.spotify.com/embed/${spotifyId}?utm_source=generator${context.darkMode ? "&theme=0" : ""}`} width="85%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                </>
              </>
            }
            const isIFrame = children && children.length && children[0] === "!iframe";
            if (isIFrame) {
              res = <>
                <iframe title={"iframe"} width="560" height="315" style={{ maxWidth: "calc(100% - 12px)" }} src={props.href} />
              </>
            }
          }
          return <React.Fragment key={hashCode(res.toString())}>{res}</React.Fragment>;
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
        },
        p({ node, className, children, ...props }) {
          return (
            <p className={className} style={{ margin: "3.5px", overflowWrap: "break-word" }} {...props}>
              {children}
            </p>
          )
        }
      }}
    />
  </MathJax.Provider>
};
export default MarkdownComponent;