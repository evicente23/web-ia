import React, { useState } from "react";
import avatar from "./6596121.png";
import { Avatar, Box, Chip, Typography } from "@mui/material";

export default function Message(props) {
  const { choices } = props;
  const [inf, setInf] = useState(choices);

  React.useEffect(() => {
    console.error("choices", choices)
    setInf(choices)
  }, [choices]);
  return (
    <div>
      <Box
        sx={{
          my: 2,
          display: "flex",
          flexFlow: "row",
          justifyContent: props.isCustomer ? "right" : "left",
        }}
      >
        {!props.isCustomer && (
          <Avatar sx={{ mr: 1, bgcolor: "primary.main" }}>
            <img src={avatar} alt="Chatbot avatar" width={32} />
          </Avatar>
        )}
        <Box>
          <Typography gutterBottom variant="body2" component="div" sx={{ mt: 1.5 }}>
            {props.content}
          </Typography>
          {props.image && (
            <img src={props.image} alt="Bot response" style={{ width: "10%", float: "right" }} />
          )}
          {!props.isCustomer && inf && (
            <Box sx={{ mt: 1 }}>
              <Chip
                label={choices}
                sx={{
                  mr: 0.5, mb: 0.5, padding: 1, height: 'auto',
                  '& .MuiChip-label': {
                    display: 'block',
                    whiteSpace: 'normal',
                  }
                }}

              />
            </Box>
          )}
        </Box>
      </Box>
    </div>
  );
}