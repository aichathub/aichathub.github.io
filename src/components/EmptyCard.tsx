import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

const EmptyCard: React.FC<{ title: string }> = (props) => {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          <MailOutlineIcon />
        </Typography>
        <Typography variant="h5" component="div">
          Empty
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          There are no messages in this conversation yet
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EmptyCard;
