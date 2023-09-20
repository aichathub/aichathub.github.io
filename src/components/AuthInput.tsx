import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import React, { useRef, useState } from "react";
const AuthInput: React.FC<{
  callback: (sessionid: string) => void;
  style?: React.CSSProperties;
  initialCode?: string;
}> = (props) => {
  const [code, setCode] = useState<string[]>(props.initialCode ? props.initialCode.split("") : ["", "", "", ""]);
  const refs = useRef<HTMLInputElement[]>([]);
  const codeLength = 4;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { value } = e.target;
    setCode((prevCode) => {
      const newCode = [...prevCode];
      newCode[index] = value.slice(0, 1);
      return newCode;
    });
    if (value !== "" && index + 1 < codeLength) {
      refs.current[index + 1].focus();
      refs.current[index + 1].select();
    } else if (value !== "" && index === codeLength - 1) {
      props.callback(code.join("") + value.slice(0, 1));
    }
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedText: string = e.clipboardData.getData("text/plain");
    const formattedText = pastedText.slice(0, codeLength).split("");
    setCode((prevCode) => {
      const newCode = [...prevCode];
      formattedText.forEach((char, index) => {
        if (newCode[index] !== undefined) {
          newCode[index] = char;
        }
      });
      return newCode;
    });
    if (formattedText.length === codeLength) {
      props.callback(formattedText.join(""));
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === 'Backspace' && code[index].length === 0) {
      e.preventDefault();
      refs.current[index - 1].focus();
      refs.current[index - 1].select();
    }
  };
  return (
    <Box style={props.style} onClick={e => e.stopPropagation()}>
      {code.map((value, index) => (
        <TextField
          key={index}
          value={value}
          onChange={(e) => handleInputChange(e, index)}
          onPaste={handlePaste}
          style={{ width: "3rem", margin: "5px" }}
          variant="outlined" // Use "filled" or "standard" based on your preference
          inputRef={(el) => (refs.current[index] = el)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          inputProps={{
            maxLength: 1,
            style: { textAlign: "center" }
          }}
        />
      ))}
    </Box>
  );
}
export default AuthInput;