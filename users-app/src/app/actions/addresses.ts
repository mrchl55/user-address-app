"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addressSchema = z.object({
  userId: z.number(),
  addressType: z.enum(["HOME", "WORK"]),
  validFrom: z.date(),
  postCode: z.string().regex(/^\d{2}-\d{3}$/, "Invalid post code format"),
  city: z.string().min(1).max(60),
  countryCode: z.string().length(3),
  street: z.string().min(1).max(100),
  buildingNumber: z.string().min(1).max(60),
});

export type AddressFormData = Omit<
  z.infer<typeof addressSchema>,
  "validFrom"
> & {
  validFrom: Date | string;
};

export async function getUserAddresses(userId: number) {
  try {
    const addresses = await prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ addressType: "asc" }, { validFrom: "desc" }],
    });

    return { addresses };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw new Error("Failed to fetch addresses");
  }
}

export async function createAddress(data: AddressFormData) {
  try {
    // Ensure validFrom is a Date object
    const formattedData = {
      ...data,
      validFrom:
        data.validFrom instanceof Date
          ? data.validFrom
          : new Date(data.validFrom),
    };

    // Validate input
    addressSchema.parse(formattedData);

    // Check for existing address of same type
    const existingAddress = await prisma.userAddress.findFirst({
      where: {
        userId: formattedData.userId,
        addressType: formattedData.addressType,
        validFrom: {
          lte: formattedData.validFrom,
        },
      },
      orderBy: {
        validFrom: "desc",
      },
    });

    if (existingAddress) {
      throw new Error("An address of this type already exists for this date");
    }

    const address = await prisma.userAddress.create({
      data: formattedData,
    });
    revalidatePath("/");
    return address;
  } catch (error) {
    console.error("Error creating address:", error);
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to create address"
    );
  }
}

export async function updateAddress(
  userId: number,
  addressType: string,
  validFrom: Date,
  data: Partial<AddressFormData>
) {
  try {
    // Ensure validFrom is a Date object if it exists in the data
    const formattedData = {
      ...data,
      validFrom:
        data.validFrom instanceof Date
          ? data.validFrom
          : data.validFrom
          ? new Date(data.validFrom)
          : undefined,
    };

    const address = await prisma.userAddress.update({
      where: {
        userId_addressType_validFrom: {
          userId,
          addressType,
          validFrom:
            validFrom instanceof Date ? validFrom : new Date(validFrom),
        },
      },
      data: formattedData,
    });
    revalidatePath("/");
    return address;
  } catch (error) {
    console.error("Error updating address:", error);
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }
    throw new Error("Failed to update address");
  }
}

export async function deleteAddress(
  userId: number,
  addressType: string,
  validFrom: Date
) {
  try {
    await prisma.userAddress.delete({
      where: {
        userId_addressType_validFrom: {
          userId,
          addressType,
          validFrom:
            validFrom instanceof Date ? validFrom : new Date(validFrom),
        },
      },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting address:", error);
    throw new Error("Failed to delete address");
  }
}
