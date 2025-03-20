"use client";

import { BaseModal } from "./BaseModal";
import { UserForm } from "./UserForm";
import { User } from "@prisma/client";

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  initials?: string;
}

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
}

export function UserModal({ open, onClose, user, onSubmit }: UserModalProps) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={user ? "Edit User" : "Create User"}
    >
      <UserForm user={user} onSubmit={onSubmit} onCancel={onClose} />
    </BaseModal>
  );
}
