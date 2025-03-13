"use client";

import { Modal, Box, Typography } from "@mui/material";

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BaseModal({ open, onClose, title, children }: BaseModalProps) {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2" mb={2}>
          {title}
        </Typography>
        {children}
      </Box>
    </Modal>
  );
}
