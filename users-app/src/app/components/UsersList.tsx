"use client";

import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import { Button, Alert } from "@mui/material";
import { getUsers, createUser, updateUser, deleteUser } from "../actions/users";
import { ContextMenu } from "./ContextMenu";
import { UserModal } from "./UserModal";
import { User } from "@prisma/client";
import { AddressList } from "./AddressList";

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
        onEdit={() => console.log("Edit user:", params.row.id)}
        onDelete={() => console.log("Delete user:", params.row.id)}
      />
    ),
  },
];

export function UsersList() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setError(null);
      const data = await getUsers();
      setRows(data.users);
    } catch (error) {
      console.error("Failed to load users:", error);
      setError(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  const handleRowClick = (params: any) => {
    setSelectedUser(params.row);
    // We'll implement address list display later
  };

  const handleCreateUser = async (data: any) => {
    try {
      await createUser(data);
      loadUsers();
      setModalOpen(false);
    } catch (error) {
      setError("Failed to create user");
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, data);
      loadUsers();
      setModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      setError("Failed to update user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
      loadUsers();
    } catch (error) {
      setError("Failed to delete user");
    }
  };

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
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          onRowClick={(params) => setSelectedUser(params.row)}
          initialState={{
            pagination: { pagerSize: 10 },
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
