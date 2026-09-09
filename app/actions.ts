"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation"; 

export async function getTransactions() {
  try {
    return await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (error) {
    return [];
  }
}

export async function getWarehouseStock() {
  try {
    const stocks = await prisma.warehouseStock.findMany();
    if (stocks.length === 0) return null;
    
    const stockMap: Record<string, number> = {};
    stocks.forEach(s => {
      stockMap[s.itemName] = s.quantity;
    });
    return stockMap;
  } catch (error) {
    return null;
  }
}

export async function initializeDefaultStock(defaultStock: Record<string, number>) {
  try {
    const promises = Object.entries(defaultStock).map(([itemName, quantity]) => {
      return prisma.warehouseStock.upsert({
        where: { itemName },
        update: {},
        create: { itemName, quantity }
      });
    });
    await prisma.$transaction(promises);
    return true;
  } catch (error) {
    return false;
  }
}

export async function saveTransaction(data: any, cartItems: Array<{item: string, qty: number}>) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          date: data.date, time: data.time, type: data.type, item: data.item, actor: data.actor,
          qty: data.qty, price: data.price, total: data.total, gov: data.gov, officerCut: data.officerCut,
          petugas: data.petugas // <--- Menyimpan nama petugas ke database
        }
      });
      
      for (const cart of cartItems) {
        const baseName = cart.item.replace('[PROMO] ', '');
        if (!cart.item.includes('PROMO')) {
          const qtyChange = data.type === 'IN' ? cart.qty : -cart.qty;
          await tx.warehouseStock.upsert({
            where: { itemName: baseName },
            update: { quantity: { increment: qtyChange } },
            create: { itemName: baseName, quantity: qtyChange > 0 ? qtyChange : 0 }
          });
        }
      }
    });
    
    revalidatePath("/dashboard"); 
    return { success: true };
  } catch (error) {
    console.error("Gagal menyimpan transaksi & stok:", error);
    return { success: false };
  }
}

export async function loginUser(username: string, password: string) {
  let isSuccess = false;
  
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== password) {
      return { success: false, message: 'ID Petugas atau Kata Sandi salah!' };
    }
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    
    cookieStore.set({
      name: 'userRole',
      value: user.role,
      maxAge: 86400,
      path: '/',
      secure: isProduction,
      sameSite: 'lax'
    });

    cookieStore.set({
      name: 'userName',
      value: user.name || 'Pegawai',
      maxAge: 86400,
      path: '/',
      secure: isProduction,
      sameSite: 'lax'
    });

    isSuccess = true;
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: 'Terjadi kesalahan sistem server.' };
  }

  if (isSuccess) {
    redirect('/dashboard');
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  
  cookieStore.set('userRole', '', { maxAge: 0, path: '/' });
  cookieStore.set('userName', '', { maxAge: 0, path: '/' });
  
  return { success: true };
}

export async function getActiveUser() {
  const cookieStore = await cookies();
  const role = cookieStore.get('userRole')?.value;
  const name = cookieStore.get('userName')?.value;
  
  if (!role || !name) return null; 
  
  return { role, name };
}

export async function getAllUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { role: 'asc' } 
    });
  } catch (error) {
    return [];
  }
}

export async function createUser(data: { username: string, name: string, role: string, password: string }) {
  try {
    await prisma.user.create({ data });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Gagal! ID Petugas mungkin sudah dipakai.' };
  }
}

export async function resetUserPassword(id: string, newPassword: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { password: newPassword }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Gagal mereset kata sandi.' };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus pegawai.' };
  }
}

export async function getKasNegara() {
  try {
    return await prisma.kasNegara.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (error) {
    return [];
  }
}

export async function addKasNegara(data: { tanggal: string; jumlah: number; keterangan: string; penerima: string }) {
  try {
    await prisma.kasNegara.create({ data });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Gagal mencatat Kas Presiden.' };
  }
}