import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SearchIcon from '@mui/icons-material/Search';
import TerminalIcon from '@mui/icons-material/Terminal';
import { Box } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext, AutocompleteItem } from "../store/AppContext";
import { runPythonLocal } from '../util/python';
import { Tooltip } from "@mui/material";

const AutocompleteComponent: React.FC<{
  item: AutocompleteItem;
  setSearchBoxText: (text: string) => void;
  setIsSearchAutocompleteOpen: (isOpen: boolean) => void;
  redirectSearch: (keyword: string) => void;
  renderProps: React.HTMLAttributes<HTMLLIElement>;
}> = (props) => {
  const { item, setSearchBoxText, setIsSearchAutocompleteOpen, redirectSearch, renderProps } = props;
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [executionResult, setExecutionResult] = useState("");
  useEffect(() => {
    if (item.type === "python") {
      runPythonLocal(item.keyword).then((result) => {
        localStorage.setItem("lastExecutionResult", result);
        setExecutionResult(result);
      });
    }
  }, []);
  const shouldHide = item.type === "python" && (!executionResult || executionResult.startsWith("[ERROR]"));
  let result = <Box style={{ display: shouldHide ? "none" : "flex" }}
    id={`${item.username}/${item.pid}/${new Date()}`}
    component="li" {...renderProps}
    onClick={(e) => {
      e.preventDefault();
      if (item.type === "python") {
        navigator.clipboard.writeText(executionResult);
        context.showSnack("Copied result to clipboard");
      } else if (item.type === "post" || item.type === "post-private") {
        context.setIsFirstLoad(true);
        context.setMessages([]);
        context.setIsLoadingMessages(true);
        navigate(`/${item.username}/${item.pid}`);
      } else {
        setSearchBoxText(item.keyword);
        redirectSearch(item.keyword);
      }
      setIsSearchAutocompleteOpen(false);
    }}>
    {
      item.type === "post" ? <ChatBubbleOutlineIcon sx={{ marginRight: "5px" }} /> :
        item.type === "post-private" ? <LockIcon sx={{ marginRight: "5px" }} /> :
          item.type === "python" ? <TerminalIcon sx={{ marginRight: "5px" }} /> :
            item.keyword.startsWith("@") ? <PersonIcon sx={{ marginRight: "5px" }} /> :
              item.keyword.startsWith("!Ask") ? <QuestionAnswerIcon sx={{ marginRight: "5px" }} /> :
                <SearchIcon sx={{ marginRight: "5px" }} />
    }
    {item.type === "python" ? executionResult :
      item.keyword.startsWith("!") ? item.keyword.slice(1) : item.keyword}
  </Box>;

  if (item.type === "python") {
    result = <Tooltip title="Copy" arrow>{result}</Tooltip>
  }

  return result;
}
export default AutocompleteComponent;