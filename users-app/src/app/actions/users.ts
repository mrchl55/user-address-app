"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUsers(page: number = 1, pageSize: number = 10) {
  try {
    const users = await prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        id: "asc",
      },
    });

    const total = await prisma.user.count();

    return {
      users,
      total,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  initials?: string;
}) {
  try {
    const user = await prisma.user.create({
      data: {
        ...data,
        status: "ACTIVE",
      },
    });
    revalidatePath("/");
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

export async function updateUser(
  id: number,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    initials?: string;
  }
) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

export async function deleteUser(id: number) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}
