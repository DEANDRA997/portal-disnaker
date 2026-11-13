"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine,
  Banknote, Boxes, CalendarDays, CheckCircle2, ChevronDown, Clock3, Download,
  Edit3, FileText, Filter, KeyRound, LayoutDashboard, LoaderCircle, LogOut,
  Menu, Moon, Package, Plus, Search, ShieldAlert, ShieldCheck, Sun, Trash2, TrendingUp,
  UserPlus, Wallet, Warehouse, X, XCircle, MessageCircle, ExternalLink,
} from "lucide-react";
import {
  getTransactions, saveTransaction, getWarehouseStock, getActiveUser, logoutUser,
  getAllUsers, createUser, resetUserPassword, deleteUser, getKasNegara,
  addKasNegara, updateTransaction, deleteTransaction, getAuditLogs,
} from "../actions";

type RoleUser = { name: string; role: string };
type CartItem = { item: string; qty: number; price: number };
type SummaryTab = "HARI_INI" | "BULAN_INI" | "CUSTOM";

const masterKomoditas: Record<string, {
  buyPrice: number; sellInstansi: number; sellWarga: number;
  maxTerima: number; maxJual: number; stokMax: number; minHijau: number;
}> = {
  "Batu Bersih": { buyPrice: 900, sellInstansi: 1000, sellWarga: 1100, maxTerima: 99999, maxJual: 99999, stokMax: 50000, minHijau: 5000 },
  "Recycle Package": { buyPrice: 900, sellInstansi: 1000, sellWarga: 1100, maxTerima: 99999, maxJual: 99999, stokMax: 50000, minHijau: 5000 },
  Baju: { buyPrice: 900, sellInstansi: 1100, sellWarga: 1200, maxTerima: 99999, maxJual: 99999, stokMax: 15000, minHijau: 3000 },
  Kulit: { buyPrice: 800, sellInstansi: 1100, sellWarga: 1200, maxTerima: 99999, maxJual: 99999, stokMax: 5000, minHijau: 3000 },
  Tembaga: { buyPrice: 7500, sellInstansi: 7850, sellWarga: 8000, maxTerima: 99999, maxJual: 99999, stokMax: 10000, minHijau: 500 },
  Anggur: { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  Strawberry: { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  "Strawberry (NEW!!)": { buyPrice: 500, sellInstansi: 600, sellWarga: 700, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  Bawang: { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  "Bawang (NEW!!)": { buyPrice: 850, sellInstansi: 950, sellWarga: 1050, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  Susu: { buyPrice: 700, sellInstansi: 800, sellWarga: 900, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  Cabai: { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  "Papan Kayu": { buyPrice: 700, sellInstansi: 800, sellWarga: 900, maxTerima: 99999, maxJual: 99999, stokMax: 15000, minHijau: 3000 },
  "Drum Oil": { buyPrice: 700, sellInstansi: 800, sellWarga: 900, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  Beras: { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  Wortel: { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  Tomat: { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  Jagung: { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  Jeruk: { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  "Package Ayam": { buyPrice: 1000, sellInstansi: 1100, sellWarga: 1200, maxTerima: 99999, maxJual: 99999, stokMax: 10000, minHijau: 1000 },
};

const allActors = [
  "Warga (General)", "Nusantara Resto", "Kungkungkhap Resto", "969 Resto",
  "Tekno garage", "969 garage", "stunberg garage", "max garage", "kungkung garage",
  "maison rainheart", "kedai YGM", "YGM Center", "sumber rezeki", "Up & Atom",
];

const formatDisplayName = (text: string) => {
  if (!text) return text;
  return text
    .split("Bawang (NEW!!)").join("__BWG_NEW__")
    .split("Strawberry (NEW!!)").join("__STR_NEW__")
    .split("Bawang").join("Bawang (Old)")
    .split("Strawberry").join("Strawberry (Old)")
    .split("__BWG_NEW__").join("Bawang")
    .split("__STR_NEW__").join("Strawberry");
};

const money = (value: number) => `$${Number(value || 0).toLocaleString("en-US")}`;
const number = (value: number) => Number(value || 0).toLocaleString("id-ID");

const panelClass = "rounded-2xl border border-emerald-900/10 bg-white shadow-[0_14px_40px_rgba(4,35,31,.06)] dark:border-emerald-300/10 dark:bg-[#0b2623]/90 dark:shadow-[0_18px_55px_rgba(0,0,0,.22)]";
const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-emerald-100/10 dark:bg-[#061d1b] dark:text-emerald-50 dark:placeholder:text-emerald-100/30 dark:focus:border-emerald-400";

const DISCORD_SUPPORT_URL = "https://discord.com/users/882646127541903361"; // Buka profil administrator; pengguna memilih Message untuk memulai DM.

export default function DashboardPage() {
  const router = useRouter();
  const todayStr = new Date().toLocaleDateString("en-CA");

  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [activeUser, setActiveUser] = useState<RoleUser | null>(null);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [warehouseStock, setWarehouseStock] = useState<Record<string, number>>({});
  const [usersList, setUsersList] = useState<any[]>([]);
  const [kasPresidenList, setKasPresidenList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const [summaryTab, setSummaryTab] = useState<SummaryTab>("HARI_INI");
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTrx, setEditingTrx] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [inputDate, setInputDate] = useState(todayStr);
  const [trxType, setTrxType] = useState<"OUT" | "IN">("OUT");
  const [itemName, setItemName] = useState("Anggur");
  const [actorName, setActorName] = useState("Warga (General)");
  const [quantity, setQuantity] = useState<number | "">("");
  const [pricePerUnit, setPricePerUnit] = useState<number | "">(1000);
  const [isPromo, setIsPromo] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("STAFF");
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [inputKasDate, setInputKasDate] = useState(todayStr);
  const [nominalPresiden, setNominalPresiden] = useState<number | "">("");
  const [ketPresiden, setKetPresiden] = useState("");
  const [isSavingKas, setIsSavingKas] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);

    let cancelled = false;
    async function loadInitialData() {
      try {
        const user = await getActiveUser();
        if (!user?.role || !user?.name) {
          router.replace("/login");
          return;
        }
        if (cancelled) return;
        setActiveUser(user);

        const [trxResult, stockResult, kasResult] = await Promise.all([
          getTransactions(20, 0), getWarehouseStock(), getKasNegara(),
        ]);
        if (cancelled) return;
        setTransactions(trxResult.transactions || []);
        setHasMore(Boolean(trxResult.hasMore));
        setWarehouseStock(stockResult || {});
        setKasPresidenList(kasResult || []);

        if (user.role.toUpperCase().trim() === "ADMIN") {
          const [users, logs] = await Promise.all([getAllUsers(), getAuditLogs()]);
          if (cancelled) return;
          setUsersList(users || []);
          setAuditLogs(logs || []);
        }
      } catch (error) {
        console.error("Gagal memuat dashboard:", error);
        if (!cancelled) setNotice({ type: "error", text: "Sebagian data dashboard gagal dimuat. Coba segarkan halaman." });
      } finally {
        if (!cancelled) {
          setIsMounted(true);
        }
      }
    }

    loadInitialData();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    if (isPromo) return;
    const regulation = masterKomoditas[itemName];
    if (!regulation) return;
    if (trxType === "IN") setPricePerUnit(regulation.buyPrice);
    else setPricePerUnit(actorName === "Warga (General)" ? regulation.sellWarga : regulation.sellInstansi);
  }, [itemName, trxType, actorName, isPromo]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const safeRole = activeUser?.role?.toUpperCase().trim() || "";
  const isAdmin = safeRole === "ADMIN";
  const isPetinggi = ["MENTERI", "WAMEN", "WAKIL MENTERI", "WAKIL", "ADMIN"].includes(safeRole);
  const isMenteriOrAdmin = safeRole === "MENTERI" || isAdmin;

  const currentMonthStr = todayStr.substring(0, 7);
  const filteredTransactions = useMemo(() => transactions.filter((trx) => {
    if (summaryTab === "HARI_INI") return trx.date === todayStr;
    if (summaryTab === "BULAN_INI") return String(trx.date || "").startsWith(currentMonthStr);
    if (summaryTab === "CUSTOM") return trx.date === filterDate;
    return true;
  }), [transactions, summaryTab, todayStr, currentMonthStr, filterDate]);

  const filteredKas = useMemo(() => kasPresidenList.filter((kas) => {
    if (summaryTab === "HARI_INI") return kas.tanggal === todayStr;
    if (summaryTab === "BULAN_INI") return String(kas.tanggal || "").startsWith(currentMonthStr);
    if (summaryTab === "CUSTOM") return kas.tanggal === filterDate;
    return true;
  }), [kasPresidenList, summaryTab, todayStr, currentMonthStr, filterDate]);

  const tableTransactions = useMemo(() => filteredTransactions.filter((trx) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return String(trx.actor || "").toLowerCase().includes(query)
      || formatDisplayName(String(trx.item || "")).toLowerCase().includes(query)
      || String(trx.type || "").toLowerCase().includes(query);
  }), [filteredTransactions, searchQuery]);

  const summaryKasGov = filteredTransactions.reduce((sum, trx) => sum + Number(trx.gov || 0), 0);
  const summaryKasPresiden = filteredKas.reduce((sum, kas) => sum + Number(kas.jumlah || 0), 0);
  const totalKasPemerintah = summaryKasGov + summaryKasPresiden;
  const summaryKomisi = filteredTransactions.reduce((sum, trx) => sum + Number(trx.officerCut || 0), 0);
  const summaryBarangIn = filteredTransactions.filter((trx) => trx.type === "IN").reduce((sum, trx) => sum + Number(trx.qty || 0), 0);
  const summaryBarangOut = filteredTransactions.filter((trx) => trx.type === "OUT").reduce((sum, trx) => sum + Number(trx.qty || 0), 0);
  const totalStockItems = Object.values(warehouseStock).reduce<number>((sum, qty) => sum + Number(qty || 0), 0);
  const crisisCount = Object.entries(masterKomoditas).filter(([item, regulation]) => (warehouseStock[item] || 0) < regulation.minHijau / 2).length;

  const showNotice = (type: "success" | "error", text: string) => setNotice({ type, text });

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
  };

  const refreshData = async () => {
    try {
      const currentLimit = Math.max(20, transactions.length);
      const [trxResult, stockResult, kasResult] = await Promise.all([
        getTransactions(currentLimit, 0), getWarehouseStock(), getKasNegara(),
      ]);
      setTransactions(trxResult.transactions || []);
      setHasMore(Boolean(trxResult.hasMore));
      setWarehouseStock(stockResult || {});
      setKasPresidenList(kasResult || []);
      if (isAdmin) setAuditLogs((await getAuditLogs()) || []);
    } catch (error) {
      console.error("Gagal memperbarui data:", error);
      showNotice("error", "Gagal memperbarui data dashboard.");
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const result = await getTransactions(20, transactions.length);
      setTransactions((previous) => [...previous, ...(result.transactions || [])]);
      setHasMore(Boolean(result.hasMore));
    } catch (error) {
      console.error("Gagal memuat transaksi tambahan:", error);
      showNotice("error", "Transaksi tambahan gagal dimuat.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value as "IN" | "OUT";
    setTrxType(nextType);
    if (nextType === "IN") setActorName("Warga (General)");
  };

  const handleAddToCart = () => {
    if (!quantity || Number(quantity) <= 0 || pricePerUnit === "" || Number(pricePerUnit) <= 0) {
      showNotice("error", "Jumlah dan harga harus lebih besar dari nol.");
      return;
    }
    const qty = Number(quantity);
    const regulation = masterKomoditas[itemName];
    if (!isPromo && regulation) {
      if (trxType === "IN" && qty > regulation.maxTerima) {
        showNotice("error", `Maksimal penerimaan ${number(regulation.maxTerima)} pcs per transaksi.`);
        return;
      }
      if (trxType === "OUT" && qty > regulation.maxJual) {
        showNotice("error", `Maksimal penjualan ${number(regulation.maxJual)} pcs per KTP.`);
        return;
      }
    }
    const targetName = isPromo ? `[PROMO] ${itemName}` : itemName;
    setCartItems((previous) => [...previous, { item: targetName, qty, price: Number(pricePerUnit) }]);
    setQuantity("");
    showNotice("success", `${formatDisplayName(targetName)} ditambahkan ke nota.`);
  };

  const handleRemoveFromCart = (index: number) => setCartItems((previous) => previous.filter((_, itemIndex) => itemIndex !== index));

  const handleSaveTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cartItems.length === 0) {
      showNotice("error", "Nota masih kosong. Tambahkan barang terlebih dahulu.");
      return;
    }
    if (trxType === "OUT") {
      for (const cart of cartItems) {
        const baseName = cart.item.replace("[PROMO] ", "").trim();
        const currentStock = warehouseStock[baseName] || 0;
        if (currentStock < cart.qty) {
          showNotice("error", `Stok ${formatDisplayName(baseName)} tidak cukup. Tersedia ${number(currentStock)} pcs.`);
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const total = cartItems.reduce((sum, cart) => sum + cart.qty * cart.price, 0);
      const gov = trxType === "OUT" ? total * 0.8 : -total;
      const officerCut = trxType === "OUT" ? total * 0.2 : 0;
      const payload = {
        date: inputDate,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        type: trxType,
        item: cartItems.map((cart) => `${cart.qty}x ${cart.item}`).join(", "),
        actor: actorName,
        qty: cartItems.reduce((sum, cart) => sum + cart.qty, 0),
        price: cartItems[0].price,
        total,
        gov,
        officerCut,
        petugas: activeUser?.name || "Sistem",
      };
      const result = await saveTransaction(payload, cartItems);
      if (!result.success) throw new Error("Transaksi gagal disimpan ke database.");
      setCartItems([]);
      setIsPromo(false);
      setQuantity("");
      await refreshData();
      showNotice("success", "Transaksi berhasil disimpan dan stok gudang diperbarui.");
    } catch (error) {
      console.error("Gagal menyimpan transaksi:", error);
      showNotice("error", error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan transaksi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingTrx) return;
    setIsUpdating(true);
    try {
      const result = await updateTransaction(editingTrx.id, {
        date: editingTrx.date, time: editingTrx.time, actor: editingTrx.actor,
      });
      if (!result.success) throw new Error(result.message || "Gagal memperbarui transaksi.");
      setEditingTrx(null);
      await refreshData();
      showNotice("success", "Data transaksi berhasil diperbarui.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Gagal memperbarui transaksi.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus transaksi ini? Stok barang terkait akan dipulihkan.")) return;
    try {
      const result = await deleteTransaction(id);
      if (!result.success) throw new Error(result.message || "Gagal menghapus transaksi.");
      await refreshData();
      showNotice("success", "Transaksi dihapus dan stok telah disesuaikan.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Gagal menghapus transaksi.");
    }
  };

  const handleSaveKas = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nominalPresiden || Number(nominalPresiden) <= 0) {
      showNotice("error", "Nominal kas harus lebih besar dari nol.");
      return;
    }
    setIsSavingKas(true);
    try {
      const result = await addKasNegara({
        tanggal: inputKasDate,
        jumlah: Number(nominalPresiden),
        keterangan: ketPresiden || "Suntikan Dana Presiden",
        penerima: activeUser?.name || "Menteri",
      });
      if (!result.success) throw new Error(result.message || "Gagal mencatat kas.");
      setNominalPresiden("");
      setKetPresiden("");
      await refreshData();
      showNotice("success", "Suntikan kas berhasil dicatat.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Gagal mencatat kas.");
    } finally {
      setIsSavingKas(false);
    }
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingUser(true);
    try {
      const result = await createUser({ username: newUsername, name: newName, password: newPassword, role: newRole });
      if (!result.success) throw new Error(result.message || "Gagal membuat akun.");
      setNewUsername(""); setNewName(""); setNewPassword(""); setNewRole("STAFF");
      setUsersList((await getAllUsers()) || []);
      showNotice("success", "Akun pegawai berhasil dibuat.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Gagal membuat akun.");
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    const newPassword = window.prompt(`Masukkan kata sandi baru untuk ${name}:`);
    if (!newPassword) return;
    try {
      const result = await resetUserPassword(id, newPassword);
      if (!result.success) throw new Error(result.message || "Gagal mereset kata sandi.");
      showNotice("success", `Kata sandi ${name} berhasil diubah.`);
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Gagal mereset kata sandi.");
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin mencabut akses ${name}? Akun tersebut tidak dapat masuk kembali.`)) return;
    try {
      const result = await deleteUser(id);
      if (!result.success) throw new Error(result.message || "Gagal menghapus akun.");
      setUsersList((await getAllUsers()) || []);
      showNotice("success", `Akses ${name} berhasil dicabut.`);
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Gagal menghapus akun.");
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Keluar dari Portal Disnaker sekarang?")) return;
    try {
      await logoutUser();
      router.replace("/login");
    } catch (error) {
      console.error("Gagal logout:", error);
      showNotice("error", "Gagal mengakhiri sesi. Silakan coba kembali.");
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      showNotice("error", "Tidak ada transaksi pada periode yang dipilih.");
      return;
    }
    const headers = ["Tanggal", "Waktu", "Tipe Transaksi", "Pihak Terkait", "Rincian Barang", "Total Barang", "Nilai Transaksi ($)", "Kas Pemerintah ($)", "Komisi Petugas ($)", "Nama Petugas"];
    const rows = filteredTransactions.map((trx) => {
      const safe = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
      return [trx.date, trx.time, trx.type === "IN" ? "Barang Masuk (Beli)" : "Barang Keluar (Jual)", safe(trx.actor), safe(formatDisplayName(trx.item)), trx.qty, trx.total, trx.gov, trx.officerCut, safe(trx.petugas || "Sistem")].join(",");
    });
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Disnaker_${summaryTab}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showNotice("success", "Laporan CSV berhasil disiapkan.");
  };

  const navItems = [
    { id: "overview", label: "Ikhtisar", icon: LayoutDashboard },
    { id: "inventory", label: "Stok Gudang", icon: Warehouse },
    { id: "finance", label: "Ringkasan Keuangan", icon: Wallet },
    { id: "transactions", label: "Transaksi & Laporan", icon: ArrowLeftRight },
    ...(isAdmin ? [{ id: "administration", label: "Administrasi", icon: ShieldCheck }] : []),
  ];

  if (!isMounted || !activeUser) {
    return (
      <div className="min-h-screen bg-[#061d1b] text-emerald-50 flex items-center justify-center gap-4">
        <LoaderCircle className="h-7 w-7 animate-spin text-emerald-400" />
        <div>
          <p className="text-sm font-bold tracking-[.18em]">MEMUAT PORTAL DISNAKER</p>
          <p className="mt-1 text-xs text-emerald-100/45">Memverifikasi sesi dan menyiapkan data gudang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-[#edf4f1] text-slate-800 transition-colors duration-300 dark:bg-[#041b19] dark:text-emerald-50">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-48 left-[28%] h-[520px] w-[520px] rounded-full bg-emerald-400/10 blur-[120px] dark:bg-emerald-400/10" />
          <div className="absolute -bottom-56 right-[-8%] h-[600px] w-[600px] rounded-full bg-amber-300/10 blur-[140px] dark:bg-amber-400/[0.06]" />
          <div className="absolute inset-0 opacity-[.18] dark:opacity-[.11]" style={{ backgroundImage: "linear-gradient(rgba(10,90,75,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(10,90,75,.12) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "linear-gradient(to bottom, black, transparent 85%)" }} />
        </div>

        {mobileMenuOpen && <button aria-label="Tutup menu" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-[#001613]/65 backdrop-blur-sm md:hidden" />}

        <aside className={`fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col overflow-y-auto border-r border-emerald-900/10 bg-[#f8fbf9]/95 px-5 py-6 shadow-2xl backdrop-blur-2xl transition-transform duration-300 dark:border-emerald-100/10 dark:bg-[#062421]/95 md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-700 to-[#052d29] shadow-lg shadow-emerald-950/20">
                <img src="/portal-disnaker-logo.png" alt="Logo Portal Disnaker" className="h-10 w-10 object-contain" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-black tracking-[.18em] text-emerald-950 dark:text-white">PORTAL DISNAKER</p>
                <p className="mt-1 truncate text-[9px] font-semibold tracking-[.16em] text-emerald-700/65 dark:text-emerald-200/45">PUSAT LOGISTIK KOTA</p>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-black/5 dark:text-emerald-100/60 dark:hover:bg-white/5 md:hidden"><X size={18} /></button>
          </div>

          <div className="mt-9 px-3 text-[9px] font-black uppercase tracking-[.2em] text-slate-400 dark:text-emerald-100/30">Menu utama</div>
          <nav className="mt-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[12px] font-bold transition-all ${active ? "border border-emerald-500/20 bg-emerald-600 text-white shadow-lg shadow-emerald-950/15" : "text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-800 dark:text-emerald-100/60 dark:hover:text-emerald-100"}`}>
                  <Icon size={17} className={active ? "text-amber-200" : "text-emerald-700/60 group-hover:text-emerald-600 dark:text-emerald-300/55"} />
                  {item.label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_#ffd34d]" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-700 to-[#07332e] p-4 text-white shadow-xl shadow-emerald-950/15">
            <div className="flex items-center gap-2 text-amber-200"><Boxes size={16} /><span className="text-[9px] font-black uppercase tracking-[.16em]">Kondisi gudang</span></div>
            <p className="mt-3 text-2xl font-black tabular-nums">{number(totalStockItems)}</p>
            <p className="mt-1 text-[10px] text-emerald-100/65">Total unit tercatat</p>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px]">
              <span className="text-emerald-100/70">Item perlu perhatian</span>
              <span className="font-black text-amber-200">{crisisCount} item</span>
            </div>
          </div>
          <a
            href={DISCORD_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buka profil Discord administrator Portal Disnaker untuk mengirim pesan"
            className="group mt-4 block rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[.09] to-cyan-500/[.04] p-4 transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-emerald-500/[.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fbf9] dark:focus-visible:ring-offset-[#062421]"
          >
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
              <span className="grid h-8 w-8 place-items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"><MessageCircle size={16} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-black uppercase tracking-[.12em]">Butuh bantuan?</span>
                <span className="mt-0.5 block text-[9px] font-medium normal-case tracking-normal text-slate-500 dark:text-emerald-100/50">Buka profil administrator dan pilih Message untuk mengirim DM</span>
              </span>
              <ExternalLink size={13} className="shrink-0 text-emerald-600/70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-emerald-200/60" />
            </div>
            <span className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#5865F2]/30 bg-[#5865F2]/10 px-3 py-2 text-[9px] font-black uppercase tracking-[.12em] text-[#5865F2] transition group-hover:bg-[#5865F2] group-hover:text-white dark:text-[#aeb5ff]">
              <MessageCircle size={13} /> Buka Discord & Kirim DM
            </span>
          </a>
          <div className="mt-4 flex items-center gap-2 px-2 text-[9px] font-semibold tracking-[.12em] text-slate-400 dark:text-emerald-100/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> SISTEM OPERASIONAL · V2.0
          </div>
        </aside>

        <main className="relative z-10 min-h-screen md:pl-[276px]">
          <header className="sticky top-0 z-30 border-b border-emerald-900/10 bg-[#f4f8f6]/85 backdrop-blur-2xl dark:border-emerald-100/10 dark:bg-[#041b19]/80">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-9">
              <div className="flex min-w-0 items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="rounded-xl border border-emerald-900/10 bg-white p-2.5 text-emerald-800 shadow-sm dark:border-emerald-100/10 dark:bg-white/5 dark:text-emerald-100 md:hidden"><Menu size={18} /></button>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[.2em] text-emerald-700/60 dark:text-emerald-300/45">Pemerintah Satu Mimpi / Divisi Logistik</p>
                  <p className="mt-1 truncate text-sm font-extrabold text-slate-900 dark:text-white sm:text-base">Pusat Kendali Operasional</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-2 rounded-xl border border-emerald-900/10 bg-white/80 px-3 py-2 text-[10px] font-semibold text-slate-500 dark:border-emerald-100/10 dark:bg-white/5 dark:text-emerald-100/55 lg:flex"><Clock3 size={13} className="text-emerald-600 dark:text-emerald-300" /> {new Date().toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</div>
                <button onClick={toggleTheme} title="Ganti tema" className="rounded-xl border border-emerald-900/10 bg-white/80 p-2.5 text-slate-500 transition hover:text-amber-600 dark:border-emerald-100/10 dark:bg-white/5 dark:text-emerald-100/60 dark:hover:text-amber-300">{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
                <div className="hidden h-8 w-px bg-emerald-900/10 dark:bg-white/10 sm:block" />
                <div className="hidden text-right sm:block">
                  <p className="max-w-[150px] truncate text-[11px] font-extrabold text-slate-800 dark:text-emerald-50">{activeUser.name}</p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[.12em] text-emerald-700 dark:text-emerald-300">{isAdmin ? "PUSAT ADMIN" : activeUser.role}</p>
                </div>
                <button onClick={handleLogout} title="Keluar" className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-[10px] font-extrabold text-rose-600 transition hover:bg-rose-500 hover:text-white dark:text-rose-300"><LogOut size={15} /><span className="hidden sm:inline">Keluar</span></button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] space-y-7 px-4 py-6 sm:px-6 lg:space-y-8 lg:px-9 lg:py-8">
            {notice && (
              <div role="status" className={`fixed right-4 top-20 z-[70] flex max-w-[min(420px,calc(100vw-2rem))] items-start gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-xl ${notice.type === "success" ? "border-emerald-400/30 bg-emerald-950/95 text-emerald-100" : "border-rose-400/30 bg-rose-950/95 text-rose-100"}`}>
                {notice.type === "success" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-300" /> : <XCircle size={16} className="mt-0.5 shrink-0 text-rose-300" />}
                <span>{notice.text}</span>
                <button onClick={() => setNotice(null)} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
              </div>
            )}

            <section id="overview" className="scroll-mt-24">
              <div className="relative overflow-hidden rounded-[26px] border border-emerald-400/20 bg-gradient-to-br from-[#0b6255] via-[#07483f] to-[#052d29] p-6 text-white shadow-[0_24px_70px_rgba(3,48,41,.22)] sm:p-8 lg:p-9">
                <div className="absolute -right-12 -top-28 h-80 w-80 rounded-full border border-white/10" />
                <div className="absolute -right-1 top-[-65px] h-64 w-64 rounded-full border border-amber-300/15" />
                <div className="absolute bottom-[-100px] right-[18%] h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
                <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.2em] text-amber-200"><Activity size={13} /> Sistem operasional aktif</div>
                    <h1 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-[46px]">Selamat bertugas,<br /><span className="text-amber-300">{activeUser.name}</span></h1>
                    <p className="mt-4 max-w-xl text-xs leading-6 text-emerald-50/70 sm:text-sm">Pantau pergerakan stok, kelola transaksi, dan pastikan distribusi logistik Pemerintah Kota berjalan dengan tertib.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:min-w-[290px]">
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4 backdrop-blur-md"><p className="text-[9px] font-bold uppercase tracking-[.15em] text-emerald-100/55">Status akun</p><div className="mt-2 flex items-center gap-2 text-sm font-extrabold"><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" /> Aktif</div></div>
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4 backdrop-blur-md"><p className="text-[9px] font-bold uppercase tracking-[.15em] text-emerald-100/55">Level akses</p><p className="mt-2 truncate text-sm font-extrabold text-amber-200">{activeUser.role}</p></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className={`${panelClass} p-4 sm:p-5`}>
                  <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 dark:text-emerald-100/45">Total stok</span><span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300"><Package size={17} /></span></div>
                  <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">{number(totalStockItems)}</p><p className="mt-1 text-[10px] text-slate-400 dark:text-emerald-100/35">Unit seluruh komoditas</p>
                </div>
                <div className={`${panelClass} p-4 sm:p-5`}>
                  <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 dark:text-emerald-100/45">Barang masuk</span><span className="rounded-xl bg-sky-500/10 p-2 text-sky-700 dark:text-sky-300"><ArrowDownToLine size={17} /></span></div>
                  <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">{number(summaryBarangIn)}</p><p className="mt-1 text-[10px] text-slate-400 dark:text-emerald-100/35">Periode terpilih · unit</p>
                </div>
                <div className={`${panelClass} p-4 sm:p-5`}>
                  <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 dark:text-emerald-100/45">Barang keluar</span><span className="rounded-xl bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300"><ArrowUpFromLine size={17} /></span></div>
                  <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">{number(summaryBarangOut)}</p><p className="mt-1 text-[10px] text-slate-400 dark:text-emerald-100/35">Periode terpilih · unit</p>
                </div>
                <div className={`${panelClass} p-4 sm:p-5`}>
                  <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 dark:text-emerald-100/45">Stok kritis</span><span className="rounded-xl bg-rose-500/10 p-2 text-rose-700 dark:text-rose-300"><AlertTriangle size={17} /></span></div>
                  <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">{crisisCount}</p><p className="mt-1 text-[10px] text-slate-400 dark:text-emerald-100/35">Komoditas perlu perhatian</p>
                </div>
              </div>
            </section>

            <section id="inventory" className="scroll-mt-24">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div><p className="text-[9px] font-black uppercase tracking-[.2em] text-emerald-700 dark:text-emerald-300/65">Inventory monitoring</p><h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">Stok Gudang</h2><p className="mt-1 text-xs text-slate-500 dark:text-emerald-100/40">Kondisi persediaan komoditas berdasarkan data database.</p></div>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-emerald-100/45"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Hijau: aman <span className="ml-2 h-2 w-2 rounded-full bg-amber-400" /> Perhatian <span className="ml-2 h-2 w-2 rounded-full bg-rose-500" /> Kritis</div>
              </div>
              <div className={`${panelClass} p-4 sm:p-5`}>
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-white/5"><div className="flex items-center gap-2"><div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300"><Warehouse size={17} /></div><div><p className="text-xs font-extrabold text-slate-800 dark:text-white">Kestabilan persediaan</p><p className="mt-0.5 text-[9px] text-slate-400 dark:text-emerald-100/35">{Object.keys(masterKomoditas).length} jenis komoditas terdaftar</p></div></div><span className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-2.5 py-1.5 text-[9px] font-black tracking-wider text-emerald-700 dark:text-emerald-300">DATABASE</span></div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                  {Object.keys(masterKomoditas).filter((item) => item !== "Bawang" && item !== "Strawberry").map((item) => {
                    const regulation = masterKomoditas[item];
                    const qty = warehouseStock[item] || 0;
                    const full = qty >= regulation.stokMax;
                    const healthy = qty >= regulation.minHijau;
                    const critical = qty < regulation.minHijau / 2;
                    const tone = critical ? "rose" : full ? "sky" : healthy ? "emerald" : "amber";
                    const tones: Record<string, string> = { rose: "text-rose-600 dark:text-rose-300", sky: "text-sky-600 dark:text-sky-300", emerald: "text-emerald-700 dark:text-emerald-300", amber: "text-amber-600 dark:text-amber-300" };
                    const bars: Record<string, string> = { rose: "bg-rose-500", sky: "bg-sky-500", emerald: "bg-emerald-500", amber: "bg-amber-500" };
                    return <div key={item} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition hover:-translate-y-0.5 hover:border-emerald-500/25 hover:shadow-md dark:border-white/5 dark:bg-[#061e1b] sm:p-3.5">
                      <div className="flex items-start justify-between gap-2"><p className="line-clamp-1 text-[10px] font-bold text-slate-500 dark:text-emerald-100/55" title={formatDisplayName(item)}>{formatDisplayName(item)}</p>{critical && <AlertTriangle size={13} className="shrink-0 text-rose-500" />}</div>
                      <p className={`mt-3 text-xl font-black tabular-nums ${tones[tone]}`}>{number(qty)}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className={`h-full rounded-full ${bars[tone]}`} style={{ width: `${Math.min((qty / regulation.stokMax) * 100, 100)}%` }} /></div>
                      <div className="mt-2 flex justify-between gap-1 text-[8px] text-slate-400 dark:text-emerald-100/30"><span>{critical ? "KRITIS" : full ? "KAPASITAS PENUH" : healthy ? "STABIL" : "PERHATIAN"}</span><span>{Math.round(Math.min((qty / regulation.stokMax) * 100, 100))}%</span></div>
                    </div>;
                  })}
                </div>
              </div>
            </section>

            <section id="finance" className="scroll-mt-24">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div><p className="text-[9px] font-black uppercase tracking-[.2em] text-emerald-700 dark:text-emerald-300/65">Financial overview</p><h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">Ringkasan Keuangan</h2><p className="mt-1 text-xs text-slate-500 dark:text-emerald-100/40">Perhitungan berdasarkan periode laporan yang dipilih.</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  {(["HARI_INI", "BULAN_INI"] as SummaryTab[]).map((tab) => (tab === "HARI_INI" || isPetinggi) && <button key={tab} onClick={() => setSummaryTab(tab)} className={`rounded-xl px-3.5 py-2.5 text-[10px] font-extrabold transition ${summaryTab === tab ? "bg-emerald-700 text-white shadow-lg shadow-emerald-950/15" : "border border-slate-200 bg-white text-slate-500 hover:border-emerald-500/40 dark:border-white/10 dark:bg-white/5 dark:text-emerald-100/55"}`}>{tab === "HARI_INI" ? "Hari Ini" : "Bulan Ini"}</button>)}
                  {isPetinggi && <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5"><CalendarDays size={14} className="text-emerald-600 dark:text-emerald-300" /><input aria-label="Filter tanggal laporan" type="date" value={filterDate} onChange={(event) => { setFilterDate(event.target.value); setSummaryTab("CUSTOM"); }} className="w-[126px] bg-transparent text-[10px] text-slate-600 outline-none dark:text-emerald-100" /></label>}
                  {isPetinggi && <button onClick={handleExportCSV} className="flex items-center gap-2 rounded-xl border border-emerald-600/20 bg-emerald-600/10 px-3.5 py-2.5 text-[10px] font-extrabold text-emerald-700 transition hover:bg-emerald-600 hover:text-white dark:text-emerald-300"><Download size={14} /> Export CSV</button>}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className={`${panelClass} relative overflow-hidden p-5`}><div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl"/><div className="relative flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 dark:text-emerald-100/45">Kas Pemerintah · 80%</span><TrendingUp size={18} className="text-emerald-600 dark:text-emerald-300"/></div>{isMenteriOrAdmin ? <p className={`relative mt-4 text-2xl font-black ${totalKasPemerintah >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>{totalKasPemerintah >= 0 ? "+" : "−"}{money(Math.abs(totalKasPemerintah))}</p> : <p className="mt-4 text-sm font-bold italic text-slate-400 dark:text-emerald-100/30">Akses dibatasi</p>}<p className="mt-2 text-[9px] text-slate-400 dark:text-emerald-100/35">Termasuk suntikan kas Presiden</p></div>
                <div className={`${panelClass} p-5`}><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 dark:text-emerald-100/45">Komisi Petugas · 20%</span><Wallet size={18} className="text-sky-600 dark:text-sky-300"/></div><p className="mt-4 text-2xl font-black text-sky-700 dark:text-sky-300">+{money(summaryKomisi)}</p><p className="mt-2 text-[9px] text-slate-400 dark:text-emerald-100/35">Akumulasi komisi transaksi OUT</p></div>
                <div className={`${panelClass} p-5`}><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 dark:text-emerald-100/45">Total Pembelian</span><ArrowDownToLine size={18} className="text-violet-600 dark:text-violet-300"/></div><p className="mt-4 text-2xl font-black text-violet-700 dark:text-violet-300">{number(summaryBarangIn)} <span className="text-xs">unit</span></p><p className="mt-2 text-[9px] text-slate-400 dark:text-emerald-100/35">Barang masuk (IN)</p></div>
                <div className={`${panelClass} p-5`}><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 dark:text-emerald-100/45">Total Penjualan</span><ArrowUpFromLine size={18} className="text-amber-600 dark:text-amber-300"/></div><p className="mt-4 text-2xl font-black text-amber-700 dark:text-amber-300">{number(summaryBarangOut)} <span className="text-xs">unit</span></p><p className="mt-2 text-[9px] text-slate-400 dark:text-emerald-100/35">Barang keluar (OUT)</p></div>
              </div>
            </section>

            <section id="transactions" className="scroll-mt-24">
              <div className="mb-4"><p className="text-[9px] font-black uppercase tracking-[.2em] text-emerald-700 dark:text-emerald-300/65">Operations & records</p><h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">Transaksi & Laporan</h2><p className="mt-1 text-xs text-slate-500 dark:text-emerald-100/40">Pencatatan pergerakan barang dan buku besar transaksi.</p></div>
              <div className="grid grid-cols-1 items-start gap-5 2xl:grid-cols-[370px_minmax(0,1fr)]">
                <div className="space-y-5">
                  {isMenteriOrAdmin && <div className={`${panelClass} overflow-hidden`}>
                    <div className="border-b border-emerald-500/10 bg-emerald-500/[0.04] p-5"><div className="flex items-center gap-2"><div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300"><Banknote size={17}/></div><div><h3 className="text-sm font-black text-slate-900 dark:text-white">Terima Kas Presiden</h3><p className="mt-0.5 text-[9px] text-slate-400 dark:text-emerald-100/40">Pencatatan suntikan dana pemerintah</p></div></div></div>
                    <form onSubmit={handleSaveKas} className="space-y-3.5 p-5">
                      <label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Tanggal masuk</span><input type="date" value={inputKasDate} onChange={(event) => setInputKasDate(event.target.value)} className={inputClass} /></label>
                      <label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Nominal ($)</span><input type="number" min="1" required value={nominalPresiden} onChange={(event) => setNominalPresiden(event.target.value === "" ? "" : Number(event.target.value))} placeholder="Contoh: 50000" className={inputClass}/></label>
                      <label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Keterangan</span><input type="text" value={ketPresiden} onChange={(event) => setKetPresiden(event.target.value)} placeholder="Suntikan dana operasional" className={inputClass}/></label>
                      <button type="submit" disabled={isSavingKas} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-white shadow-lg shadow-emerald-950/15 transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60">{isSavingKas ? <LoaderCircle size={15} className="animate-spin"/> : <Plus size={15}/>} {isSavingKas ? "Memproses..." : "Catat Uang Masuk"}</button>
                    </form>
                  </div>}

                  <div className={`${panelClass} overflow-hidden`}>
                    <div className="border-b border-emerald-500/10 p-5"><div className="flex items-center gap-2"><div className="rounded-xl bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300"><ArrowLeftRight size={17}/></div><div><h3 className="text-sm font-black text-slate-900 dark:text-white">Transaksi Borongan</h3><p className="mt-0.5 text-[9px] text-slate-400 dark:text-emerald-100/40">Input barang masuk dan keluar</p></div></div></div>
                    <form onSubmit={handleSaveTransaction} className="space-y-3.5 p-5">
                      <label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Tanggal transaksi (backdate)</span><input type="date" value={inputDate} onChange={(event) => setInputDate(event.target.value)} className={inputClass}/></label>
                      <label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Arus barang</span><select value={trxType} onChange={handleTypeChange} className={inputClass}><option value="OUT">Barang keluar · Penjualan</option><option value="IN">Barang masuk · Pembelian</option></select></label>
                      <div className="space-y-1.5"><div className="flex items-center justify-between gap-2"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Jenis barang</span><label className="flex cursor-pointer items-center gap-1.5 text-[9px] font-bold text-amber-700 dark:text-amber-300"><input type="checkbox" checked={isPromo} onChange={(event) => { setIsPromo(event.target.checked); if (event.target.checked) setPricePerUnit(""); }} className="accent-amber-500"/> Harga promo</label></div><select value={itemName} onChange={(event) => setItemName(event.target.value)} className={inputClass}>{Object.keys(masterKomoditas).filter((item) => item !== "Bawang" && item !== "Strawberry").map((item) => <option key={item} value={item}>{formatDisplayName(item)}</option>)}</select></div>
                      <label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">{trxType === "IN" ? "Sumber barang" : "Pembeli / bisnis"}</span>{trxType === "IN" ? <input value="Warga (General)" readOnly className={`${inputClass} opacity-65`}/> : <select value={actorName} onChange={(event) => setActorName(event.target.value)} className={inputClass}>{allActors.map((actor) => <option key={actor} value={actor}>{actor}</option>)}</select>}</label>
                      <div className="grid grid-cols-2 gap-3"><label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Jumlah</span><input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value === "" ? "" : Number(event.target.value))} placeholder="0" className={inputClass}/></label><label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Harga / unit</span><input type="number" min="1" value={pricePerUnit} onChange={(event) => setPricePerUnit(event.target.value === "" ? "" : Number(event.target.value))} readOnly={!isPromo} placeholder="0" className={`${inputClass} ${!isPromo ? "cursor-not-allowed border-emerald-500/20 bg-emerald-500/5 font-bold text-emerald-700 dark:text-emerald-300" : ""}`}/></label></div>
                      {!isPromo && <p className="-mt-2 text-[9px] text-emerald-700/70 dark:text-emerald-300/50">Harga mengikuti regulasi otomatis.</p>}
                      <button type="button" onClick={handleAddToCart} className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/20 bg-emerald-600/5 py-2.5 text-[10px] font-extrabold text-emerald-700 transition hover:bg-emerald-600/10 dark:text-emerald-300"><Plus size={14}/> Masukkan ke nota</button>
                      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-black/10"><div className="mb-2 flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/45">Daftar barang nota</span><span className="rounded-md bg-white px-2 py-1 text-[9px] font-bold text-slate-500 dark:bg-white/5 dark:text-emerald-100/55">{cartItems.length} item</span></div>{cartItems.length ? <div className="max-h-40 space-y-2 overflow-y-auto">{cartItems.map((cart, index) => <div key={`${cart.item}-${index}`} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white p-2.5 dark:border-white/5 dark:bg-white/[0.03]"><div className="min-w-0"><p className="truncate text-[10px] font-extrabold text-slate-700 dark:text-emerald-50">{formatDisplayName(cart.item)}</p><p className="mt-0.5 text-[9px] text-slate-400">{number(cart.qty)} pcs × {money(cart.price)}</p></div><button type="button" onClick={() => handleRemoveFromCart(index)} aria-label="Hapus item nota" className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10"><Trash2 size={13}/></button></div>)}</div> : <p className="py-4 text-center text-[10px] italic text-slate-400">Nota masih kosong.</p>}{cartItems.length > 0 && <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] dark:border-white/10"><span className="font-bold text-slate-500 dark:text-emerald-100/50">Total sementara</span><strong className="text-emerald-700 dark:text-emerald-300">{money(cartItems.reduce((sum, item) => sum + item.qty * item.price, 0))}</strong></div>}</div>
                      <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3.5 text-[10px] font-black uppercase tracking-[.12em] text-[#17372f] shadow-lg shadow-amber-950/10 transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60">{isSaving ? <LoaderCircle size={15} className="animate-spin"/> : <CheckCircle2 size={15}/>} {isSaving ? "Menyimpan transaksi..." : "Simpan nota permanen"}</button>
                    </form>
                  </div>
                </div>

                <div className={`${panelClass} min-w-0 overflow-hidden`}>
                  <div className="flex flex-col gap-3 border-b border-emerald-500/10 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><div className="rounded-xl bg-sky-500/10 p-2 text-sky-700 dark:text-sky-300"><FileText size={17}/></div><h3 className="text-sm font-black text-slate-900 dark:text-white">Buku Besar Transaksi</h3></div><p className="mt-2 text-[9px] text-slate-400 dark:text-emerald-100/40">Data transaksi berdasarkan filter periode aktif.</p></div><div className="relative w-full sm:max-w-[250px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari pihak atau barang..." className={`${inputClass} pl-9 py-2.5 text-[11px]`}/></div></div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3 dark:border-white/5"><div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 dark:text-emerald-100/35"><Filter size={13}/> PERIODE</div><div className="flex flex-wrap gap-1.5">{(["HARI_INI", ...(isPetinggi ? ["BULAN_INI", "CUSTOM"] : [])] as SummaryTab[]).map((tab) => <button key={tab} onClick={() => setSummaryTab(tab)} className={`rounded-lg px-2.5 py-1.5 text-[9px] font-extrabold ${summaryTab === tab ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-emerald-100/50"}`}>{tab === "HARI_INI" ? "Hari ini" : tab === "BULAN_INI" ? "Bulan ini" : "Tanggal khusus"}</button>)}</div></div>
                  {summaryTab === "CUSTOM" && isPetinggi && <div className="border-b border-slate-100 px-5 py-3 dark:border-white/5"><input type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} className={`${inputClass} max-w-[220px] py-2.5 text-[11px]`}/></div>}
                  <div className="max-h-[780px] overflow-auto">
                    <table className="w-full min-w-[820px] border-collapse text-left">
                      <thead className="sticky top-0 z-10 bg-[#f2f7f4] dark:bg-[#0c2d29]"><tr className="border-b border-emerald-900/10 text-[8px] font-black uppercase tracking-[.13em] text-slate-500 dark:border-white/10 dark:text-emerald-100/45"><th className="px-4 py-3">Waktu</th><th className="px-3 py-3">Tipe</th><th className="px-3 py-3">Info transaksi</th><th className="px-3 py-3 text-right">Nilai</th><th className="px-3 py-3 text-right">Kas Gov</th><th className="px-3 py-3 text-right">Komisi</th><th className="px-4 py-3 text-center">Aksi</th></tr></thead>
                      <tbody className="text-[10px]">
                        {filteredKas.map((kas, index) => <tr key={`kas-${kas.id || index}`} className="border-b border-emerald-500/10 bg-emerald-500/[.035] hover:bg-emerald-500/[.07]"><td className="whitespace-nowrap px-4 py-3 font-bold text-emerald-700 dark:text-emerald-300">{kas.tanggal}<span className="mt-1 block text-[8px] font-medium text-emerald-600/60">Uang kas</span></td><td className="px-3 py-3"><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[8px] font-black text-emerald-700 dark:text-emerald-300">SUNTIKAN</span></td><td className="px-3 py-3"><p className="font-extrabold text-slate-700 dark:text-emerald-50">{kas.keterangan}</p><p className="mt-1 text-[9px] text-slate-400">Oleh: {kas.penerima}</p></td><td className="px-3 py-3 text-right font-black text-emerald-700 dark:text-emerald-300">+{money(kas.jumlah)}</td><td className="px-3 py-3 text-right font-bold text-emerald-700 dark:text-emerald-300">+{money(kas.jumlah)}</td><td className="px-3 py-3 text-right text-slate-300">—</td><td className="px-4 py-3 text-center text-slate-300">—</td></tr>)}
                        {tableTransactions.map((trx) => <tr key={trx.id} className="border-b border-slate-100 transition hover:bg-emerald-500/[.035] dark:border-white/5 dark:hover:bg-white/[.025]"><td className="whitespace-nowrap px-4 py-3 font-bold text-slate-700 dark:text-emerald-50">{trx.date}<span className="mt-1 block text-[9px] font-medium text-slate-400">{trx.time}</span></td><td className="px-3 py-3">{trx.type === "OUT" ? <span className="rounded-full border border-rose-500/15 bg-rose-500/5 px-2 py-1 text-[8px] font-black text-rose-600 dark:text-rose-300">OUT</span> : <span className="rounded-full border border-emerald-500/15 bg-emerald-500/5 px-2 py-1 text-[8px] font-black text-emerald-700 dark:text-emerald-300">IN</span>}</td><td className="max-w-[240px] px-3 py-3"><p className="truncate font-extrabold text-slate-700 dark:text-emerald-50" title={formatDisplayName(trx.item)}>{formatDisplayName(trx.item)}</p><p className="mt-1 truncate text-[9px] text-slate-400">Pihak: {trx.actor}</p>{isPetinggi && <p className="mt-1 text-[8px] font-bold tracking-wider text-emerald-700/65 dark:text-emerald-300/45">INPUT BY: {trx.petugas || "Sistem"}</p>}</td><td className="px-3 py-3 text-right font-black text-slate-700 dark:text-emerald-50">{money(trx.total)}</td><td className={`px-3 py-3 text-right font-bold ${Number(trx.gov) >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>{Number(trx.gov) > 0 ? "+" : Number(trx.gov) < 0 ? "−" : ""}{money(Math.abs(Number(trx.gov || 0)))}</td><td className="px-3 py-3 text-right font-bold text-sky-700 dark:text-sky-300">+{money(trx.officerCut)}</td><td className="px-4 py-3"><div className="flex items-center justify-center gap-1.5"><button onClick={() => setEditingTrx(trx)} title="Edit transaksi" className="rounded-lg border border-amber-500/15 bg-amber-500/5 p-2 text-amber-700 transition hover:bg-amber-500/15 dark:text-amber-300"><Edit3 size={13}/></button><button onClick={() => handleDeleteTransaction(trx.id)} title="Hapus transaksi" className="rounded-lg border border-rose-500/15 bg-rose-500/5 p-2 text-rose-600 transition hover:bg-rose-500/15 dark:text-rose-300"><Trash2 size={13}/></button></div></td></tr>)}
                        {filteredKas.length === 0 && tableTransactions.length === 0 && <tr><td colSpan={7} className="px-5 py-14 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><FileText size={19}/></div><p className="mt-3 text-xs font-bold text-slate-500 dark:text-emerald-100/50">Tidak ada data pada periode ini</p><p className="mt-1 text-[9px] text-slate-400">Coba ubah filter atau kata pencarian.</p></td></tr>}
                      </tbody>
                    </table>
                  </div>
                  {hasMore && <div className="border-t border-slate-100 p-4 text-center dark:border-white/5"><button onClick={handleLoadMore} disabled={isLoadingMore} className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/20 bg-emerald-600/5 px-5 py-2.5 text-[10px] font-extrabold text-emerald-700 transition hover:bg-emerald-600/10 disabled:opacity-50 dark:text-emerald-300">{isLoadingMore && <LoaderCircle size={13} className="animate-spin"/>}{isLoadingMore ? "Memuat data..." : "Tampilkan transaksi lainnya"}<ChevronDown size={13}/></button></div>}
                </div>
              </div>
            </section>

            {isAdmin && <section id="administration" className="scroll-mt-24">
              <div className="mb-4"><p className="text-[9px] font-black uppercase tracking-[.2em] text-rose-600 dark:text-rose-300/65">System administration</p><h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">Administrasi & Audit</h2><p className="mt-1 text-xs text-slate-500 dark:text-emerald-100/40">Pengelolaan akun personel dan pemantauan aktivitas sensitif.</p></div>
              <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">
                <div className={`${panelClass} overflow-hidden`}><div className="border-b border-rose-500/10 bg-rose-500/[.035] p-5"><div className="flex items-center gap-2"><div className="rounded-xl bg-rose-500/10 p-2 text-rose-600 dark:text-rose-300"><UserPlus size={17}/></div><div><h3 className="text-sm font-black text-slate-900 dark:text-white">Daftarkan pengguna</h3><p className="mt-0.5 text-[9px] text-slate-400">Pembuatan akun personel baru</p></div></div></div>
                  <form onSubmit={handleCreateUser} className="space-y-3.5 p-5"><label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">ID Login / Username</span><input required value={newUsername} onChange={(event) => setNewUsername(event.target.value)} placeholder="Contoh: ucup_admin" className={inputClass}/></label><label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Nama lengkap karakter RP</span><input required value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Contoh: Ucup Surucup" className={inputClass}/></label><label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Kata sandi</span><input required type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Buat kata sandi" className={inputClass}/></label><label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Tingkat jabatan</span><select value={newRole} onChange={(event) => setNewRole(event.target.value)} className={inputClass}><option value="STAFF">Pegawai Biasa (Staff)</option><option value="WAMEN">Wakil Menteri (Wamen)</option><option value="MENTERI">Menteri</option><option value="ADMIN">Pusat Admin (Super User)</option></select></label><button type="submit" disabled={isSavingUser} className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-500 disabled:opacity-60">{isSavingUser ? <LoaderCircle size={15} className="animate-spin"/> : <UserPlus size={15}/>} {isSavingUser ? "Membuat akun..." : "Berikan akses pusat"}</button></form>
                </div>
                <div className={`${panelClass} min-w-0 overflow-hidden`}><div className="flex items-center justify-between border-b border-emerald-500/10 p-5"><div><h3 className="text-sm font-black text-slate-900 dark:text-white">Daftar akun terdaftar</h3><p className="mt-1 text-[9px] text-slate-400">Kelola izin akses personel dan petinggi kota.</p></div><span className="rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[9px] font-black text-emerald-700 dark:text-emerald-300">{usersList.length} AKUN</span></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead className="bg-slate-50 text-[8px] font-black uppercase tracking-[.14em] text-slate-400 dark:bg-white/[.025] dark:text-emerald-100/40"><tr><th className="px-5 py-3">Nama pegawai</th><th className="px-4 py-3">ID akses</th><th className="px-4 py-3">Jabatan</th><th className="px-5 py-3 text-center">Tindakan</th></tr></thead><tbody className="text-[10px]">{usersList.length === 0 ? <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">Belum ada data pegawai.</td></tr> : usersList.map((user) => <tr key={user.id} className="border-t border-slate-100 hover:bg-emerald-500/[.025] dark:border-white/5"><td className="px-5 py-3 font-extrabold text-slate-700 dark:text-emerald-50">{user.name}</td><td className="px-4 py-3 text-slate-500 dark:text-emerald-100/50">@{user.username}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[8px] font-black ${user.role === "ADMIN" ? "bg-rose-500/10 text-rose-600 dark:text-rose-300" : user.role === "MENTERI" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : user.role === "WAMEN" ? "bg-sky-500/10 text-sky-700 dark:text-sky-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>{user.role}</span></td><td className="px-5 py-3"><div className="flex justify-center gap-1.5"><button onClick={() => handleResetPassword(user.id, user.name)} title="Ganti sandi" className="rounded-lg border border-sky-500/15 bg-sky-500/5 p-2 text-sky-700 hover:bg-sky-500/10 dark:text-sky-300"><KeyRound size={13}/></button><button onClick={() => handleDeleteUser(user.id, user.name)} title="Cabut akses" className="rounded-lg border border-rose-500/15 bg-rose-500/5 p-2 text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"><Trash2 size={13}/></button></div></td></tr>)}</tbody></table></div></div>
              </div>
              <div className={`${panelClass} mt-5 overflow-hidden`}><div className="border-b border-rose-500/10 bg-rose-500/[.035] p-5"><div className="flex items-center gap-2"><div className="rounded-xl bg-rose-500/10 p-2 text-rose-600 dark:text-rose-300"><ShieldAlert size={17}/></div><div><h3 className="text-sm font-black text-slate-900 dark:text-white">Catatan aktivitas sensitif</h3><p className="mt-0.5 text-[9px] text-slate-400">Audit log untuk pemantauan edit dan penghapusan transaksi.</p></div></div></div><div className="max-h-[420px] overflow-auto"><table className="w-full min-w-[680px] text-left"><thead className="sticky top-0 bg-[#fff8f7] text-[8px] font-black uppercase tracking-[.14em] text-rose-500 dark:bg-[#301a1b] dark:text-rose-200/60"><tr><th className="px-5 py-3">Waktu</th><th className="px-4 py-3">Eksekutor</th><th className="px-4 py-3">Tindakan</th><th className="px-5 py-3">Rincian lengkap</th></tr></thead><tbody className="text-[10px]">{auditLogs.length === 0 ? <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">Belum ada aktivitas tercatat.</td></tr> : auditLogs.map((log) => <tr key={log.id} className="border-t border-slate-100 dark:border-white/5"><td className="whitespace-nowrap px-5 py-3 text-slate-500 dark:text-emerald-100/45">{new Date(log.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</td><td className="px-4 py-3"><p className="font-extrabold text-slate-700 dark:text-emerald-50">{log.executor}</p><p className="mt-1 text-[8px] uppercase text-slate-400">{log.role}</p></td><td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-[8px] font-black ${log.action === "HAPUS_TRANSAKSI" ? "bg-rose-500/10 text-rose-600 dark:text-rose-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>{String(log.action || "").replaceAll("_", " ")}</span></td><td className="max-w-[440px] px-5 py-3 leading-5 text-slate-500 dark:text-emerald-100/50">{log.details}</td></tr>)}</tbody></table></div></div>
            </section>}

            <footer className="flex flex-col justify-between gap-2 border-t border-emerald-900/10 py-5 text-[9px] font-semibold tracking-[.12em] text-slate-400 dark:border-emerald-100/10 dark:text-emerald-100/30 sm:flex-row sm:items-center"><span><strong className="text-emerald-700 dark:text-emerald-300">PORTAL DISNAKER</strong> · SISTEM MANAJEMEN LOGISTIK</span><span>PEMERINTAH SATU MIMPI · VERSI 2.0</span></footer>
          </div>
        </main>

        {editingTrx && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#001713]/70 p-4 backdrop-blur-md"><div role="dialog" aria-modal="true" aria-labelledby="edit-transaction-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-emerald-400/20 bg-white shadow-2xl dark:bg-[#082522]"><div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-white/10"><div><p className="text-[9px] font-black uppercase tracking-[.17em] text-emerald-700 dark:text-emerald-300/60">Transaction editor</p><h3 id="edit-transaction-title" className="mt-1 text-base font-black text-slate-900 dark:text-white">Edit data transaksi</h3></div><button onClick={() => setEditingTrx(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"><X size={17}/></button></div><div className="p-5"><div className="mb-4 rounded-xl border border-amber-500/15 bg-amber-500/5 p-3"><p className="text-xs font-extrabold text-slate-800 dark:text-emerald-50">{formatDisplayName(editingTrx.item)}</p><p className="mt-1 text-[10px] text-slate-500 dark:text-emerald-100/45">Nilai transaksi: {money(editingTrx.total)}</p><p className="mt-2 text-[9px] leading-4 text-amber-700 dark:text-amber-300/70">Rincian barang dan nominal tidak dapat diubah melalui form ini untuk menjaga sinkronisasi stok.</p></div><form onSubmit={handleUpdateTransaction} className="space-y-3.5"><label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Tanggal</span><input type="date" required value={editingTrx.date} onChange={(event) => setEditingTrx({ ...editingTrx, date: event.target.value })} className={inputClass}/></label><label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Waktu</span><input type="time" required value={editingTrx.time} onChange={(event) => setEditingTrx({ ...editingTrx, time: event.target.value })} className={inputClass}/></label><label className="block space-y-1.5"><span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-slate-500 dark:text-emerald-100/50">Pihak terkait</span><input required value={editingTrx.actor} onChange={(event) => setEditingTrx({ ...editingTrx, actor: event.target.value })} className={inputClass}/></label><div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditingTrx(null)} className="w-1/2 rounded-xl border border-slate-200 py-3 text-[10px] font-extrabold text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-emerald-100/60 dark:hover:bg-white/5">Batal</button><button type="submit" disabled={isUpdating} className="flex w-1/2 items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-[10px] font-extrabold text-white hover:bg-emerald-600 disabled:opacity-60">{isUpdating && <LoaderCircle size={14} className="animate-spin"/>}{isUpdating ? "Menyimpan..." : "Simpan perubahan"}</button></div></form></div></div></div>}
      </div>
    </div>
  );
}
