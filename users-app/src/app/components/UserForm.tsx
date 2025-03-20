"use client";

import { useForm } from "react-hook-form";
import { TextField, Button, Stack } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "@prisma/client";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(60),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email").max(100),
  initials: z.string().max(30).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          firstName: user.firstName || "",
          lastName: user.lastName,
          email: user.email,
          initials: user.initials || "",
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          initials: "",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <TextField
          {...register("firstName")}
          label="First Name"
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
          fullWidth
        />
        <TextField
          {...register("lastName")}
          label="Last Name"
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
          fullWidth
        />
        <TextField
          {...register("email")}
          label="Email"
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
        />
        <TextField
          {...register("initials")}
          label="Initials"
          error={!!errors.initials}
          helperText={errors.initials?.message}
          fullWidth
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {user ? "Update" : "Create"}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
