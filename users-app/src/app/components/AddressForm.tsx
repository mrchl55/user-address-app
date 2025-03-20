"use client";

import { useForm } from "react-hook-form";
import { TextField, Button, Stack, MenuItem } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserAddress } from "@prisma/client";
import { AddressPreview } from "./AddressPreview";

const addressSchema = z.object({
  addressType: z.enum(["HOME", "WORK"]),
  street: z.string().min(1, "Street is required").max(100),
  buildingNumber: z.string().min(1, "Building number is required").max(60),
  postCode: z
    .string()
    .regex(/^\d{2}-\d{3}$/, "Invalid post code format (XX-XXX)"),
  city: z.string().min(1, "City is required").max(60),
  countryCode: z.string().length(3, "Country code must be 3 characters"),
  validFrom: z.string().min(1, "Valid from date is required"),
});

type FormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  address?: UserAddress;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          ...address,
          validFrom: new Date(address.validFrom).toISOString().split("T")[0],
        }
      : {
          addressType: "HOME",
          street: "",
          buildingNumber: "",
          postCode: "",
          city: "",
          countryCode: "",
          validFrom: new Date().toISOString().split("T")[0],
        },
  });

  const handleFormSubmit = async (data: FormData) => {
    // Convert the date string to a Date object
    const formattedData = {
      ...data,
      validFrom: new Date(data.validFrom),
    };
    await onSubmit(formattedData);
  };

  // Watch form fields for preview
  const street = watch("street");
  const buildingNumber = watch("buildingNumber");
  const postCode = watch("postCode");
  const city = watch("city");
  const countryCode = watch("countryCode");

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack spacing={3}>
        <TextField
          select
          {...register("addressType")}
          label="Address Type"
          error={!!errors.addressType}
          helperText={errors.addressType?.message}
          fullWidth
        >
          <MenuItem value="HOME">Home</MenuItem>
          <MenuItem value="WORK">Work</MenuItem>
        </TextField>

        <TextField
          {...register("street")}
          label="Street"
          error={!!errors.street}
          helperText={errors.street?.message}
          fullWidth
        />

        <TextField
          {...register("buildingNumber")}
          label="Building Number"
          error={!!errors.buildingNumber}
          helperText={errors.buildingNumber?.message}
          fullWidth
        />

        <TextField
          {...register("postCode")}
          label="Post Code"
          placeholder="XX-XXX"
          error={!!errors.postCode}
          helperText={errors.postCode?.message}
          fullWidth
        />

        <TextField
          {...register("city")}
          label="City"
          error={!!errors.city}
          helperText={errors.city?.message}
          fullWidth
        />

        <TextField
          {...register("countryCode")}
          label="Country Code"
          placeholder="POL"
          error={!!errors.countryCode}
          helperText={errors.countryCode?.message}
          fullWidth
        />

        <TextField
          {...register("validFrom")}
          type="date"
          label="Valid From"
          error={!!errors.validFrom}
          helperText={errors.validFrom?.message}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <AddressPreview
          street={street || ""}
          buildingNumber={buildingNumber || ""}
          postCode={postCode || ""}
          city={city || ""}
          countryCode={countryCode || ""}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {address ? "Update" : "Create"}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
