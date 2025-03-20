"use client";

import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import { useState, useEffect, useCallback } from "react";
import { Button, Alert } from "@mui/material";
import { getUsers, createUser, updateUser, deleteUser } from "../actions/users";
import { ContextMenu } from "./ContextMenu";
import { UserModal } from "./UserModal";
import { User } from "@prisma/client";
import { AddressList } from "./AddressList";

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  initials?: string;
}

export function UsersList() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setError(null);
      const data = await getUsers();
      setRows(data.users);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRowClick = (params: GridRowParams<User>) => {
    setSelectedUser(params.row);
  };

  const handleCreateUser = async (data: UserFormData) => {
    try {
      await createUser(data);
      await loadUsers();
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to create user:", err);
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, data);
      await loadUsers();
      setModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const handleDeleteClick = (id: number) => {
    console.log("Delete user:", id);
    // Implement delete confirmation dialog here
    handleDeleteUser(id).catch((err) => {
      console.error("Error deleting user:", err);
    });
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError(err instanceof Error ? err.message : "Failed to delete user");
      throw err;
    }
  };

  // Define columns inside the component to have access to the handler functions
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "firstName", headerName: "First Name", width: 130 },
    { field: "lastName", headerName: "Last Name", width: 130 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params: GridRenderCellParams<User>) => (
        <ContextMenu
          onEdit={() => {
            setEditingUser(params.row);
            setModalOpen(true);
          }}
          onDelete={() => handleDeleteClick(params.row.id)}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="h-[400px] w-full">
        <div className="mb-4">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditingUser(null);
              setModalOpen(true);
            }}
          >
            Add New User
          </Button>
        </div>
        {error && (
          <Alert
            severity="error"
            className="mb-4"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          onRowClick={handleRowClick}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
        <UserModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingUser(null);
          }}
          user={editingUser}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        />
      </div>

      <AddressList user={selectedUser} />
    </div>
  );
}
