"use client";

import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import { Button, Alert, Typography } from "@mui/material";
import { getUserAddresses } from "../actions/addresses";
import { ContextMenu } from "./ContextMenu";
import { User, UserAddress } from "@prisma/client";
import { format } from "date-fns";
import { AddressModal } from "./AddressModal";
import {
  createAddress,
  deleteAddress,
  updateAddress,
} from "../actions/addresses";

interface AddressListProps {
  user: User | null;
}

const columns: GridColDef[] = [
  {
    field: "addressType",
    headerName: "Type",
    width: 100,
    valueGetter: (params) => params.row.addressType,
  },
  {
    field: "fullAddress",
    headerName: "Address",
    width: 300,
    valueGetter: (params) =>
      `${params.row.street} ${params.row.buildingNumber}\n${params.row.postCode} ${params.row.city}\n${params.row.countryCode}`,
  },
  {
    field: "validFrom",
    headerName: "Valid From",
    width: 150,
    valueGetter: (params) =>
      format(new Date(params.row.validFrom), "dd/MM/yyyy"),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 100,
    renderCell: (params: GridRenderCellParams<UserAddress>) => (
      <ContextMenu
        onEdit={() => {
          setEditingAddress(params.row);
          setModalOpen(true);
        }}
        onDelete={() => handleDeleteAddress(params.row)}
      />
    ),
  },
];

export function AddressList({ user }: AddressListProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null
  );

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  async function loadAddresses() {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getUserAddresses(user.id);
      setAddresses(data.addresses);
    } catch (error) {
      console.error("Failed to load addresses:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load addresses"
      );
    } finally {
      setLoading(false);
    }
  }

  const handleCreateAddress = async (data: any) => {
    if (!user) return;
    try {
      await createAddress({ ...data, userId: user.id });
      loadAddresses();
      setModalOpen(false);
    } catch (error) {
      setError("Failed to create address");
    }
  };

  const handleDeleteAddress = async (address: UserAddress) => {
    try {
      await deleteAddress(
        address.userId,
        address.addressType,
        address.validFrom
      );
      loadAddresses();
    } catch (error) {
      setError("Failed to delete address");
    }
  };

  const handleEditAddress = async (data: any) => {
    if (!user || !editingAddress) return;
    try {
      await updateAddress(
        editingAddress.userId,
        editingAddress.addressType,
        editingAddress.validFrom,
        data
      );
      loadAddresses();
      setModalOpen(false);
      setEditingAddress(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update address"
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6">
          Addresses for {user.firstName} {user.lastName}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setEditingAddress(null);
            setModalOpen(true);
          }}
        >
          Add New Address
        </Button>
      </div>
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <div style={{ height: 400 }}>
        <DataGrid
          rows={addresses}
          columns={columns}
          loading={loading}
          getRowId={(row) =>
            `${row.userId}-${row.addressType}-${row.validFrom}`
          }
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { pagerSize: 5 },
          }}
        />
      </div>
      <AddressModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        address={editingAddress}
        onSubmit={editingAddress ? handleEditAddress : handleCreateAddress}
      />
    </div>
  );
}
