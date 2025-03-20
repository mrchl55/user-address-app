"use client";

import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import { Button, Alert, Typography, CircularProgress } from "@mui/material";
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
import { ConfirmDialog } from "./ConfirmDialog";

interface AddressListProps {
  user: User | null;
}

export function AddressList({ user }: AddressListProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<UserAddress | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

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
      setActionLoading(true);
      setError(null);
      await createAddress({ ...data, userId: user.id });
      await loadAddresses();
      setModalOpen(false);
    } catch (error) {
      setError("Failed to create address");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (address: UserAddress) => {
    setAddressToDelete(address);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;
    try {
      setActionLoading(true);
      setError(null);
      await deleteAddress(
        addressToDelete.userId,
        addressToDelete.addressType,
        addressToDelete.validFrom
      );
      await loadAddresses();
    } catch (error) {
      setError("Failed to delete address");
    } finally {
      setActionLoading(false);
      setDeleteConfirmOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleEditAddress = async (data: any) => {
    if (!user || !editingAddress) return;
    try {
      setActionLoading(true);
      setError(null);
      await updateAddress(
        editingAddress.userId,
        editingAddress.addressType,
        editingAddress.validFrom,
        data
      );
      await loadAddresses();
      setModalOpen(false);
      setEditingAddress(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update address"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Define columns inside the component to have access to the handler functions
  const columns: GridColDef[] = [
    {
      field: "addressType",
      headerName: "Type",
      width: 100,
    },
    {
      field: "street",
      headerName: "Street",
      width: 150,
    },
    {
      field: "buildingNumber",
      headerName: "Building",
      width: 100,
    },
    {
      field: "city",
      headerName: "City",
      width: 150,
    },
    {
      field: "postCode",
      headerName: "Post Code",
      width: 120,
    },
    {
      field: "countryCode",
      headerName: "Country",
      width: 100,
    },
    {
      field: "validFrom",
      headerName: "Valid From",
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return "";
        return format(new Date(params.value as string), "dd/MM/yyyy");
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params: GridRenderCellParams<UserAddress>) => {
        return (
          <ContextMenu
            onEdit={() => {
              setEditingAddress(params.row);
              setModalOpen(true);
            }}
            onDelete={() => handleDeleteClick(params.row)}
          />
        );
      },
    },
  ];

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
          disabled={actionLoading}
        >
          {actionLoading ? <CircularProgress size={24} /> : "Add New Address"}
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
            `${row.userId}-${row.addressType}-${new Date(
              row.validFrom
            ).getTime()}`
          }
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
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
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setAddressToDelete(null);
        }}
      />
    </div>
  );
}
