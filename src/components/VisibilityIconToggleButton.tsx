import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton } from "@mui/material";
import { useState } from "react";

const VisibilityIconToggleButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return <IconButton aria-label="view more" onClick={() => { setIsOpen(prev => !prev) }}>
    {isOpen ? <VisibilityOffIcon /> : <VisibilityIcon />}
  </IconButton>;
}
export default VisibilityIconToggleButton;