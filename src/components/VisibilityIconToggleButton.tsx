import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";

const VisibilityIconToggleButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return <Tooltip title={isOpen ? "Hide" : "Read More"}>
    <IconButton aria-label="view more" onClick={() => { setIsOpen(prev => !prev) }}>
      {isOpen ? <VisibilityOffIcon /> : <VisibilityIcon />}
    </IconButton>
  </Tooltip>;
}
export default VisibilityIconToggleButton;