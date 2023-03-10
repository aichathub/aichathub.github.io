import { useState } from "react";
import EditIcon from '@mui/icons-material/Edit';
import { Tooltip } from "@mui/material";
import { Button } from "@material-ui/core";

const EditButton: React.FC<{
  setIsEditing: (isEditing: boolean) => void;
}> = (props) => {
  const handleClick = () => {
    props.setIsEditing(true);
  };
  return (
    <Tooltip title="Edit" arrow>
      <div
        style={{
          padding: ".1rem",
          margin: ".0rem 0",
          border: "none",
          borderRadius: "0px",
          cursor: "pointer",
          position: "absolute",
          right: "80px",
          background: "white",
        }}
      >
        <Button
          variant="contained"
          size="small"
          style={{
            background: "white",
            color: "black",
            borderRadius: "0px"
          }}
          onClick={() => {
            handleClick();
          }}
        >
          <EditIcon fontSize="small" />
        </Button>
      </div>
    </Tooltip>
  );
};

export default EditButton;
