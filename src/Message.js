import React, { useState } from "react";
import { Chip, Box, Avatar, Typography, TextField } from '@mui/material';
import avatar from "./6596121.png";

function renderWithLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) =>
    urlRegex.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#007BFF", textDecoration: "none" }}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

export default function Message(props) {
  const { choices } = props;
  const [inf, setInf] = React.useState(choices);

  React.useEffect(() => {
    setInf(choices);
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
              {/* Aquí usamos renderWithLinks para procesar el texto dentro del Chip */}
              <Chip
                label={<span>{renderWithLinks(choices)}</span>}
                sx={{
                  mr: 0.5,
                  mb: 0.5,
                  padding: 1,
                  height: "auto",
                  "& .MuiChip-label": {
                    display: "block",
                    whiteSpace: "normal",
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </div>
  );
}