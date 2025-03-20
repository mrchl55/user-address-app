"use client";

import { BaseModal } from "./BaseModal";
import { AddressForm } from "./AddressForm";
import { UserAddress } from "@prisma/client";
import { AddressFormData } from "../actions/addresses";

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  address?: UserAddress;
  onSubmit: (data: AddressFormData) => Promise<void>;
}

export function AddressModal({
  open,
  onClose,
  address,
  onSubmit,
}: AddressModalProps) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={address ? "Edit Address" : "Create Address"}
    >
      <AddressForm address={address} onSubmit={onSubmit} onCancel={onClose} />
    </BaseModal>
  );
}
