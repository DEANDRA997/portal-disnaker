"use server";

import { prisma } from "./lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation"; 

async function requireAuth(allowedRoles?: string[]) {
  const user = await getActiveUser();
  if (!user) {
    throw new Error("Akses Ditolak: Anda belum login.");
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role.toUpperCase().trim();
    const isAllowed = allowedRoles.some(r => r.toUpperCase() === userRole);
    if (!isAllowed) {
      throw new Error(`Akses Ditolak: Jabatan ${userRole} tidak memiliki izin otoritas ini.`);
    }
  }

  return user; 
}

export async function getTransactions(limit = 20, skip = 0) {
  try {
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count()
    ]);

    return { transactions, total, hasMore: skip + transactions.length < total };
  } catch (error) {
    console.error("Gagal mengambil data transaksi:", error);
    return { transactions: [], total: 0, hasMore: false };
  }
}

export async function getWarehouseStock() {
  try {
    const stocks = await prisma.warehouseStock.findMany();
    if (stocks.length === 0) return null;
    
    const stockMap: Record<string, number> = {};
    stocks.forEach(s => { stockMap[s.itemName] = s.quantity; });
    return stockMap;
  } catch (error) {
    return null;
  }
}

export async function initializeDefaultStock(defaultStock: Record<string, number>) {
  try {
    const promises = Object.entries(defaultStock).map(([itemName, quantity]) => {
      return prisma.warehouseStock.upsert({
        where: { itemName }, update: {}, create: { itemName, quantity }
      });
    });
    await prisma.$transaction(promises);
    return true;
  } catch (error) {
    return false;
  }
}

export async function saveTransaction(data: any, cartItems: Array<{item: string, qty: number, price?: number}>) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          date: data.date, time: data.time, type: data.type, item: data.item, 
          actor: data.actor, qty: data.qty, price: data.price, total: data.total, 
          gov: data.gov, officerCut: data.officerCut, petugas: data.petugas
        }
      });
      
      for (const cart of cartItems) {
        const baseName = cart.item.replace('[PROMO] ', '').trim();
        const qtyChange = data.type === 'IN' ? cart.qty : -cart.qty;
        
        await tx.warehouseStock.upsert({
          where: { itemName: baseName },
          update: { quantity: { increment: qtyChange } },
          create: { itemName: baseName, quantity: qtyChange > 0 ? qtyChange : 0 }
        });
      }
    });
    
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
    
    cookieStore.set({ name: 'userRole', value: user.role, maxAge: 86400, path: '/', secure: isProduction, sameSite: 'lax', httpOnly: true });
    cookieStore.set({ name: 'userName', value: user.name || 'Pegawai', maxAge: 86400, path: '/', secure: isProduction, sameSite: 'lax', httpOnly: true });

    isSuccess = true;
  } catch (error) {
    return { success: false, message: 'Terjadi kesalahan sistem server.' };
  }

  if (isSuccess) redirect('/dashboard');
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
    await requireAuth(['ADMIN']);
    return await prisma.user.findMany({ orderBy: { role: 'asc' } });
  } catch (error) {
    return [];
  }
}

export async function createUser(data: { username: string, name: string, role: string, password: string }) {
  try {
    await requireAuth(['ADMIN']);
    await prisma.user.create({ data });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal! ID Petugas mungkin sudah dipakai.' };
  }
}

export async function resetUserPassword(id: string, newPassword: string) {
  try {
    await requireAuth(['ADMIN']);
    await prisma.user.update({ where: { id }, data: { password: newPassword } });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal mereset kata sandi.' };
  }
}

export async function deleteUser(id: string) {
  try {
    await requireAuth(['ADMIN']);
    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal menghapus pegawai.' };
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
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Gagal mencatat Kas Presiden.' };
  }
}

export async function updateTransaction(id: string, updatedData: { date: string; time: string; actor: string }) {
  try {
    const user = await getActiveUser();
    const oldTrx = await prisma.transaction.findUnique({ where: { id } });
    if (!oldTrx) return { success: false, message: "Transaksi tidak ditemukan." };

    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: id },
        data: { date: updatedData.date, time: updatedData.time, actor: updatedData.actor }
      });

      await tx.auditLog.create({
        data: {
          action: "EDIT_TRANSAKSI",
          details: `Mengedit transaksi ID ${id} (${oldTrx.item}). Pihak: ${oldTrx.actor} -> ${updatedData.actor}. Tanggal: ${oldTrx.date} -> ${updatedData.date}.`,
          executor: user?.name || "Tidak Diketahui",
          role: user?.role || "UNKNOWN"
        }
      });
    });

    return { success: true, message: "Transaksi berhasil diperbarui" };
  } catch (error) {
    return { success: false, message: "Gagal memperbarui transaksi di database." };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const user = await getActiveUser();
    const trx = await prisma.transaction.findUnique({ where: { id } });
    if (!trx) return { success: false, message: "Transaksi tidak ditemukan" };
    
    await prisma.$transaction(async (tx) => {
      const items = trx.item.split(', ');

      for (const itemStr of items) {
        const firstXIndex = itemStr.indexOf('x ');
        if (firstXIndex === -1) continue;

        const qty = parseInt(itemStr.substring(0, firstXIndex));
        const rawItemName = itemStr.substring(firstXIndex + 2); 
        const cleanItemName = rawItemName.replace('[PROMO] ', '').trim();
        const isOut = trx.type === 'OUT';

        await tx.warehouseStock.upsert({
          where: { itemName: cleanItemName },
          update: { quantity: isOut ? { increment: qty } : { decrement: qty } },
          create: { itemName: cleanItemName, quantity: isOut ? qty : -qty }
        });
      }

      await tx.transaction.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          action: "HAPUS_TRANSAKSI",
          details: `Menghapus transaksi senilai $${trx.total}. Barang: ${trx.item}. Pihak Terkait: ${trx.actor}. Diinput awal oleh: ${trx.petugas}`,
          executor: user?.name || "Tidak Diketahui",
          role: user?.role || "UNKNOWN"
        }
      });
    });

    return { success: true, message: "Transaksi dihapus." };
  } catch (error) {
    return { success: false, message: "Gagal menghapus dan memulihkan stok di database." };
  }
}

export async function getAuditLogs() {
  try {
    const user = await getActiveUser();
    if (user?.role.toUpperCase() !== 'ADMIN') return [];
    return await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  } catch (error) {
    return [];
  }
}