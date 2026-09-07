"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers"; // <-- Import Cookies Next.js

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

// ==========================================
// FUNGSI SISTEM LOGIN & ROLE AKSES
// ==========================================
export async function loginUser(username: string, password: string) {
  try {
    // 1. Cari User di Database
    const user = await prisma.user.findUnique({ where: { username } });
    
    // 2. Validasi Password (Sederhana untuk RP)
    if (!user || user.password !== password) {
      return { success: false, message: 'ID Petugas atau Kata Sandi salah!' };
    }

    // 3. Simpan Sesi di Cookies (Masa aktif 1 Hari / 86400 detik)
    const cookieStore = await cookies();
    
    cookieStore.set({
      name: 'userRole',
      value: user.role,
      maxAge: 86400,
      path: '/'
    });

    cookieStore.set({
      name: 'userName',
      value: user.name || 'Pegawai',
      maxAge: 86400,
      path: '/'
    });

    return { success: true, user: { name: user.name, role: user.role } };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: 'Terjadi kesalahan sistem server.' };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies(); // <-- Tambahkan await di sini juga
  
  cookieStore.set('userRole', '', { maxAge: 0, path: '/' });
  cookieStore.set('userName', '', { maxAge: 0, path: '/' });
  
  return { success: true };
}

// Fungsi untuk membaca identitas pegawai yang sedang aktif (dari Cookies)
export async function getActiveUser() {
  const cookieStore = await cookies();
  const role = cookieStore.get('userRole')?.value;
  const name = cookieStore.get('userName')?.value;
  
  if (!role || !name) return null; // Belum login
  
  return { role, name };
}

// ==========================================
// FUNGSI MANAJEMEN PEGAWAI (KHUSUS PETINGGI)
// ==========================================

// Mengambil semua daftar pegawai
export async function getAllUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { role: 'asc' } // Urutkan berdasarkan jabatan
    });
  } catch (error) {
    return [];
  }
}

// Menambah pegawai baru
export async function createUser(data: { username: string, name: string, role: string, password: string }) {
  try {
    await prisma.user.create({ data });
    revalidatePath("/dashboard/pegawai");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Gagal! ID Petugas mungkin sudah dipakai.' };
  }
}

// Mereset password pegawai
export async function resetUserPassword(id: string, newPassword: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { password: newPassword }
    });
    revalidatePath("/dashboard/pegawai");
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Gagal mereset kata sandi.' };
  }
}

// Menghapus pegawai (Cabut Akses)
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/dashboard/pegawai");
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus pegawai.' };
  }
}