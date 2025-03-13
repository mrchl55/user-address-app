"use client";

import { Paper, Typography } from "@mui/material";

interface AddressPreviewProps {
  street: string;
  buildingNumber: string;
  postCode: string;
  city: string;
  countryCode: string;
}

export function AddressPreview({
  street,
  buildingNumber,
  postCode,
  city,
  countryCode,
}: AddressPreviewProps) {
  return (
    <Paper className="p-4 bg-gray-50">
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Address Preview
      </Typography>
      <Typography>
        {street} {buildingNumber}
      </Typography>
      <Typography>
        {postCode} {city}
      </Typography>
      <Typography>{countryCode}</Typography>
    </Paper>
  );
}
