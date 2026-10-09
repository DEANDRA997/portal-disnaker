"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Landmark, ArrowUp, ArrowDown, TrendingUp, PieChart, User, Plus, LogOut, 
  AlertCircle, Package, Calendar, CalendarDays, AlertTriangle, ShieldAlert, ShieldCheck, 
  Download, Search, UserPlus, Users, Trash2, Key, Banknote, CalendarSearch, Edit,
  Sun, Moon // <-- Icon baru untuk tema
} from 'lucide-react';

import { 
  getTransactions, saveTransaction, getWarehouseStock, getActiveUser, logoutUser, 
  getAllUsers, createUser, resetUserPassword, deleteUser, getKasNegara, addKasNegara,
  updateTransaction, deleteTransaction 
} from '../actions';

const masterKomoditas: Record<string, { buyPrice: number; sellInstansi: number; sellWarga: number; maxTerima: number; maxJual: number; stokMax: number; minHijau: number; }> = {
  'Batu Bersih':      { buyPrice: 900,  sellInstansi: 1000, sellWarga: 1100, maxTerima: 99999, maxJual: 99999, stokMax: 50000, minHijau: 5000 },
  'Recycle Package':  { buyPrice: 900,  sellInstansi: 1000, sellWarga: 1100, maxTerima: 99999, maxJual: 99999, stokMax: 50000, minHijau: 5000 },
  'Baju':             { buyPrice: 900, sellInstansi: 1100, sellWarga: 1200, maxTerima: 99999, maxJual: 99999, stokMax: 15000, minHijau: 3000 },
  'Kulit':            { buyPrice: 800, sellInstansi: 1100, sellWarga: 1200, maxTerima: 99999, maxJual: 99999, stokMax: 5000, minHijau: 3000 },
  'Tembaga':          { buyPrice: 7500, sellInstansi: 8000, sellWarga: 8100, maxTerima: 99999, maxJual: 99999, stokMax: 10000, minHijau: 500 },
  'Anggur':           { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Strawberry':       { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Strawberry (NEW!!)':{ buyPrice: 500, sellInstansi: 600, sellWarga: 700, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Bawang':           { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Bawang (NEW!!)':   { buyPrice: 850, sellInstansi: 950, sellWarga: 1050, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Susu':             { buyPrice: 700, sellInstansi: 800,  sellWarga: 900,  maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Cabai':            { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Papan Kayu':       { buyPrice: 700, sellInstansi: 800,  sellWarga: 900,  maxTerima: 99999, maxJual: 99999, stokMax: 15000, minHijau: 3000 },
  'Drum Oil':         { buyPrice: 700, sellInstansi: 800,  sellWarga: 900,  maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Beras':            { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Wortel':           { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Tomat':            { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Jagung':           { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Jeruk':            { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Package Ayam':     { buyPrice: 1000, sellInstansi: 1100, sellWarga: 1200, maxTerima: 99999, maxJual: 99999, stokMax: 10000, minHijau: 1000 },
};

const formatDisplayName = (text: string) => {
  if (!text) return text;
  let res = text;
  res = res.split('Bawang (NEW!!)').join('__BWG_NEW__');
  res = res.split('Strawberry (NEW!!)').join('__STR_NEW__');
  res = res.split('Bawang').join('Bawang (Old)');
  res = res.split('Strawberry').join('Strawberry (Old)');
  res = res.split('__BWG_NEW__').join('Bawang');
  res = res.split('__STR_NEW__').join('Strawberry');
  return res;
};

export default function DashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Tema
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [activeUser, setActiveUser] = useState<{name: string, role: string} | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [warehouseStock, setWarehouseStock] = useState<Record<string, number>>({});
  const [usersList, setUsersList] = useState<any[]>([]);
  const [kasPresidenList, setKasPresidenList] = useState<any[]>([]); 
  
  const [summaryTab, setSummaryTab] = useState<'HARI_INI' | 'BULAN_INI' | 'CUSTOM'>('HARI_INI');
  const [filterDate, setFilterDate] = useState(''); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit & Update State
  const [editingTrx, setEditingTrx] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Input Transaksi
  const [isSaving, setIsSaving] = useState(false);
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [inputDate, setInputDate] = useState(todayStr); 
  const [trxType, setTrxType] = useState<'OUT' | 'IN'>('OUT');
  const [itemName, setItemName] = useState('Anggur');
  const [customItemName, setCustomItemName] = useState('');
  const [actorName, setActorName] = useState('Warga (General)');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [pricePerUnit, setPricePerUnit] = useState<number | ''>(1000);
  const [isPromo, setIsPromo] = useState(false);
  const [cartItems, setCartItems] = useState<Array<{item: string; qty: number; price: number;}>>([]);

  // Form Users & Kas
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('STAFF');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [inputKasDate, setInputKasDate] = useState(todayStr);
  const [nominalPresiden, setNominalPresiden] = useState<number | ''>('');
  const [ketPresiden, setKetPresiden] = useState('');
  const [isSavingKas, setIsSavingKas] = useState(false);

  const allActors = ["Warga (General)", "Nusantara Resto", "Kungkungkhap Resto", "969 Resto", "Tekno garage", "969 garage", "stunberg garage", "max garage", "kungkung garage", "maison rainheart", "kedai YGM", "YGM Center", "sumber rezeki"];

  useEffect(() => {
    // Muat preferensi tema dari local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }

    async function loadInitialData() {
      try {
        const user = await getActiveUser();
        if (!user || !user.role || !user.name) {
          window.location.href = '/login'; 
          return;
        }
        setActiveUser(user);
        const dbData = await getTransactions();
        setTransactions(dbData);
        const dbStock = await getWarehouseStock();
        setWarehouseStock(dbStock || {});
        const dbKas = await getKasNegara();
        setKasPresidenList(dbKas);

        if (user.role === 'ADMIN') {
          const dbUsers = await getAllUsers();
          setUsersList(dbUsers);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setIsMounted(true);
      }
    }
    loadInitialData();
  }, []); 

  useEffect(() => {
    if (itemName === 'PROMO') {
      setIsPromo(true);
      setPricePerUnit('');
    } else {
      setIsPromo(false);
      const regulasi = masterKomoditas[itemName];
      if (trxType === 'IN') {
        setPricePerUnit(regulasi.buyPrice);
      } else {
        setPricePerUnit(actorName === 'Warga (General)' ? regulasi.sellWarga : regulasi.sellInstansi);
      }
    }
  }, [itemName, trxType, actorName]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'OUT' | 'IN';
    setTrxType(newType);
    if (newType === 'IN') setActorName('Warga (General)');
  };

  const handleAddToCart = () => {
    if (!quantity || Number(quantity) <= 0 || pricePerUnit === '') return alert("Data tidak valid!");
    
    const qtyNum = Number(quantity);
    const regulasi = masterKomoditas[itemName];
    const targetItemName = isPromo ? `[PROMO] ${customItemName || 'Item Custom'}` : itemName;

    if (!isPromo) {
      if (trxType === 'IN' && qtyNum > regulasi.maxTerima) return alert(`⚠️ BATAS TERIMA!\nMaksimal ${regulasi.maxTerima} pcs per transaksi.`);
      if (trxType === 'OUT' && qtyNum > regulasi.maxJual) return alert(`⚠️ BATAS JUAL!\nMaksimal ${regulasi.maxJual} pcs per KTP.`);
    }

    setCartItems([...cartItems, { item: targetItemName, qty: qtyNum, price: Number(pricePerUnit) }]);
    setQuantity('');
    if(isPromo) setCustomItemName('');
  };

  const handleRemoveFromCart = (index: number) => setCartItems(cartItems.filter((_, i) => i !== index));

  const handleSimpanTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("Nota kosong! Tambahkan barang ke keranjang.");

    if (trxType === 'OUT') {
      for (const cart of cartItems) {
        const baseName = cart.item.replace('[PROMO] ', '');
        const currentStock = warehouseStock[baseName] || 0; 
        if (!cart.item.includes('PROMO') && currentStock < cart.qty) {
          return alert(`❌ STOK TIDAK CUKUP!\nSisa ${formatDisplayName(baseName)}: ${currentStock.toLocaleString('id-ID')}`);
        }
      }
    }

    setIsSaving(true);
    let totalKeseluruhan = 0;
    cartItems.forEach(cart => { totalKeseluruhan += cart.qty * cart.price; });

    const gov = trxType === 'OUT' ? totalKeseluruhan * 0.8 : -totalKeseluruhan;
    const officerCut = trxType === 'OUT' ? totalKeseluruhan * 0.2 : 0;
    
    const newTrxData = {
      date: inputDate, 
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: trxType,
      item: cartItems.map(c => `${c.qty}x ${c.item}`).join(', '),
      actor: actorName,
      qty: cartItems.reduce((acc, curr) => acc + curr.qty, 0),
      price: cartItems[0].price,
      total: totalKeseluruhan, gov, officerCut,
      petugas: activeUser?.name || 'Sistem' 
    };

    const res = await saveTransaction(newTrxData, cartItems);

    if (res.success) {
      const [updatedTransactions, updatedStock] = await Promise.all([
        getTransactions(),
        getWarehouseStock()
      ]);
      setTransactions(updatedTransactions);
      setWarehouseStock(updatedStock || {});
      setCartItems([]);
    } else {
      alert("Terjadi kesalahan sistem!");
    }
    
    setIsSaving(false);
  };

  const handleEditTransaksi = (trx: any) => {
    setEditingTrx(trx);
  };

  const handleUpdateTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrx) return;
    setIsUpdating(true);

    const res = await updateTransaction(editingTrx.id, {
      date: editingTrx.date,
      time: editingTrx.time,
      actor: editingTrx.actor
    });

    if (res.success) {
      const [updatedTransactions, updatedStock] = await Promise.all([
        getTransactions(),
        getWarehouseStock()
      ]);
      setTransactions(updatedTransactions);
      setWarehouseStock(updatedStock || {});
      setEditingTrx(null); 
      alert("Data transaksi berhasil diperbarui!");
    } else {
      alert(res.message);
    }
    setIsUpdating(false);
  };

  const handleHapusTransaksi = async (id: string) => {
    if (confirm("⚠️ PERINGATAN!\nApakah Anda yakin ingin menghapus transaksi ini? Stok barang akan otomatis dikembalikan ke gudang.")) {
      const res = await deleteTransaction(id);
      if (res.success) {
        const [updatedTransactions, updatedStock] = await Promise.all([
          getTransactions(),
          getWarehouseStock()
        ]);
        setTransactions(updatedTransactions);
        setWarehouseStock(updatedStock || {});
        alert("Berhasil! Transaksi dihapus dan stok gudang telah diperbarui.");
      } else {
        alert(res.message);
      }
    }
  };

  const handleSimpanKasPresiden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominalPresiden || Number(nominalPresiden) <= 0) return alert("Nominal tidak valid!");
    setIsSavingKas(true);
    
    const data = {
      tanggal: inputKasDate, 
      jumlah: Number(nominalPresiden),
      keterangan: ketPresiden || 'Suntikan Dana Presiden',
      penerima: activeUser?.name || 'Menteri'
    };

    const res = await addKasNegara(data);
    if (res.success) {
      setNominalPresiden(''); setKetPresiden('');
      setKasPresidenList(await getKasNegara());
    } else alert("Gagal menyimpan data kas.");
    setIsSavingKas(false);
  };

  const handleTambahPegawai = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    const res = await createUser({ username: newUsername, name: newName, password: newPassword, role: newRole });
    if (res.success) {
      setNewUsername(''); setNewName(''); setNewPassword(''); setNewRole('STAFF');
      setUsersList(await getAllUsers());
    } else {
      alert(res.message);
    }
    setIsSavingUser(false);
  };

  const handleResetPassword = async (id: string, name: string) => {
    const newPass = prompt(`Masukkan Kata Sandi BARU untuk ${name}:`);
    if (!newPass) return;
    const res = await resetUserPassword(id, newPass);
    if (!res.success) alert(res.message);
  };

  const handleHapusPegawai = async (id: string, name: string) => {
    if (confirm(`⚠️ PERINGATAN!\nApakah Anda yakin ingin memecat dan mencabut akses sistem untuk ${name}?`)) {
      const res = await deleteUser(id);
      if (res.success) setUsersList(await getAllUsers());
      else alert(res.message);
    }
  };

  const handleKeluar = async () => {
    if (confirm("Anda yakin ingin keluar dari sistem?")) {
      await logoutUser();
      window.location.href = '/login';
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return alert("Tidak ada data transaksi untuk diexport pada periode ini.");
    const headers = ["Tanggal", "Waktu", "Tipe Transaksi", "Pihak Terkait", "Rincian Barang", "Total Barang", "Nilai Transaksi ($)", "Kas Pemerintah ($)", "Komisi Petugas ($)", "Nama Petugas"];
    const rows = filteredTransactions.map(trx => {
      const safeItem = `"${formatDisplayName(trx.item)}"`; 
      return `${trx.date},${trx.time},${trx.type === 'IN' ? 'Barang Masuk (Beli)' : 'Barang Keluar (Jual)'},"${trx.actor}",${safeItem},${trx.qty},${trx.total},${trx.gov},${trx.officerCut},"${trx.petugas || 'Sistem'}"`;
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `Laporan_Disnaker_${summaryTab}.csv`;
    link.style.display = 'none'; document.body.appendChild(link);
    link.click(); document.body.removeChild(link);
  };

  if (!isMounted || !activeUser) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f111a] flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
       <p className="text-cyan-600 dark:text-cyan-400 ml-4 font-bold tracking-widest animate-pulse">MEMVERIFIKASI TIKET OTORITAS...</p>
    </div>
  );

  const isAdmin = activeUser.role === 'ADMIN';
  const isPetinggi = activeUser.role === 'MENTERI' || activeUser.role === 'WAMEN' || isAdmin;
  const isMenteriOrAdmin = activeUser.role === 'MENTERI' || isAdmin; 

  const currentMonthStr = todayStr.substring(0, 7);
  const filteredTransactions = transactions.filter(trx => {
    if (summaryTab === 'HARI_INI') return trx.date === todayStr;
    if (summaryTab === 'BULAN_INI') return trx.date.startsWith(currentMonthStr);
    if (summaryTab === 'CUSTOM') return trx.date === filterDate;
    return true;
  });

  const filteredKas = kasPresidenList.filter(k => {
    if (summaryTab === 'HARI_INI') return k.tanggal === todayStr;
    if (summaryTab === 'BULAN_INI') return k.tanggal.startsWith(currentMonthStr);
    if (summaryTab === 'CUSTOM') return k.tanggal === filterDate;
    return true;
  });

  const summaryKasGov = filteredTransactions.reduce((acc, curr) => acc + curr.gov, 0);
  const summaryKasPresiden = filteredKas.reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalKasPemerintah = summaryKasGov + summaryKasPresiden;
  const summaryKomisi = filteredTransactions.reduce((acc, curr) => acc + curr.officerCut, 0);
  const summaryBarangIn = filteredTransactions.filter(t => t.type === 'IN').reduce((acc, curr) => acc + curr.qty, 0);
  const summaryBarangOut = filteredTransactions.filter(t => t.type === 'OUT').reduce((acc, curr) => acc + curr.qty, 0);

  const tableTransactions = filteredTransactions.filter(trx => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      trx.actor.toLowerCase().includes(q) || 
      formatDisplayName(trx.item).toLowerCase().includes(q) || 
      trx.type.toLowerCase().includes(q)
    );
  });

  // WRAPPER UTAMA UNTUK TEMA TERSINKRONISASI
  return (
   <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 relative font-sans overflow-hidden p-4 md:p-8 pb-20 transition-colors duration-300 z-0">
        
        {/* Latar Belakang Dekoratif: Glow Halus di Sudut Layar */}
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 dark:bg-blue-600/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 dark:bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm dark:shadow-lg transition-colors">
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-600 transition-colors">
                <Landmark className="text-slate-600 dark:text-slate-200 w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide transition-colors">Portal Disnaker</h1>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Pemerintah Satu Mimpi - Divisi Logistik</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-3 px-5 rounded-2xl shadow-sm dark:shadow-lg transition-colors">
              <div className={`p-2 rounded-full ${isAdmin ? 'bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/50' : isPetinggi ? 'bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/50' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {isAdmin ? <ShieldAlert className="w-5 h-5 text-rose-500 dark:text-rose-400 animate-pulse" /> : isPetinggi ? <ShieldCheck className="w-5 h-5 text-amber-500 dark:text-amber-400" /> : <User className="w-5 h-5 text-slate-500 dark:text-slate-300" />}
              </div>
              <div className="flex flex-col pr-3 border-r border-slate-200 dark:border-white/10">
                <p className={`text-sm font-bold ${isAdmin ? 'text-rose-600 dark:text-rose-400' : isPetinggi ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-white'}`}>{activeUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></span>
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">{isAdmin ? 'PUSAT ADMIN' : activeUser.role}</p>
                </div>
              </div>
              
              {/* TOMBOL TOGGLE MODE TERANG/GELAP */}
              <button onClick={toggleTheme} className="px-3 border-r border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors flex flex-col items-center group">
                {theme === 'dark' ? <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />}
                <span className="text-[10px] font-bold mt-1">{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
              </button>

              <button onClick={handleKeluar} className="pl-3 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex flex-col items-center group">
                <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-[10px] font-bold mt-1">Keluar</span>
              </button>
            </div>
          </div>

          {/* STOCK GUDANG */}
          <div className="bg-white/90 dark:bg-[#151822]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">Kestabilan Stok Gudang (DB Real-time)</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3">
              {Object.keys(masterKomoditas)
                .filter(item => item !== 'Bawang' && item !== 'Strawberry')
                .map((item) => {
                const qty = warehouseStock[item] || 0; 
                const reg = masterKomoditas[item];
                const isHijau = qty >= reg.minHijau;
                const isPenuh = qty >= reg.stokMax;
                const isKrisis = qty < (reg.minHijau / 2);
                
                const displayName = formatDisplayName(item); 

                return (
                  <div key={item} className="bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-white/5 p-3 rounded-xl flex flex-col justify-between transition-colors">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1 truncate" title={displayName}>{displayName}</span>
                    <div className="flex items-end justify-between mt-2">
                      <span className={`text-lg font-extrabold ${isPenuh ? 'text-blue-600 dark:text-blue-400' : isHijau ? 'text-emerald-600 dark:text-emerald-400' : isKrisis ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {qty.toLocaleString('id-ID')}
                      </span>
                      {isKrisis && <span title="Stok Krisis!"><AlertTriangle className="w-4 h-4 text-red-500 mb-1 animate-pulse" /></span>}
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden transition-colors">
                       <div className={`h-full ${isHijau ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min((qty / reg.stokMax) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REKAPAN KEUANGAN & FILTERING */}
          <div>
            <div className="flex flex-col md:flex-row gap-3 mb-4 justify-between items-start md:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setSummaryTab('HARI_INI')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${summaryTab === 'HARI_INI' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'}`}>
                  <Calendar className="w-4 h-4" /> Hari Ini
                </button>
                
                {isPetinggi && (
                  <>
                    <button onClick={() => setSummaryTab('BULAN_INI')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${summaryTab === 'BULAN_INI' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/50 border border-amber-500/50' : 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500/70 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-900/20'}`}>
                      <CalendarDays className="w-4 h-4" /> Rekap Bulan Ini
                    </button>
                    <div className="flex items-center gap-2 bg-white dark:bg-white/5 p-1.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 transition-colors">
                      <CalendarSearch className="w-4 h-4 text-slate-400" />
                      <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setSummaryTab('CUSTOM'); }} className="bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none cursor-pointer" />
                    </div>
                  </>
                )}
              </div>
              
              {isPetinggi && (
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/50 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 hover:shadow-lg hover:shadow-emerald-900/40 active:scale-95">
                  <Download className="w-4 h-4" /> Export Data (CSV)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400"><TrendingUp className="w-4 h-4" /><p className="text-xs font-medium">Kas Pemerintah (80%)</p></div>
                {isMenteriOrAdmin ? (
                  <p className={`text-3xl font-bold ${totalKasPemerintah >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{totalKasPemerintah >= 0 ? `+$${totalKasPemerintah.toLocaleString('en-US')}` : `-$${Math.abs(totalKasPemerintah).toLocaleString('en-US')}`}</p>
                ) : (
                  <p className="text-lg font-bold text-slate-400 dark:text-slate-500 mt-2 italic">Akses Dibatasi</p>
                )}
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-200 dark:border-blue-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400"><PieChart className="w-4 h-4" /><p className="text-xs font-medium">Komisi Petugas (20%)</p></div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">+${summaryKomisi.toLocaleString('en-US')}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-200 dark:border-purple-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400"><ArrowDown className="w-4 h-4" /><p className="text-xs font-medium">Total Beli (IN)</p></div>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{summaryBarangIn.toLocaleString('en-US')} <span className="text-sm">Unit</span></p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-200 dark:border-orange-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400"><ArrowUp className="w-4 h-4" /><p className="text-xs font-medium">Total Jual (OUT)</p></div>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{summaryBarangOut.toLocaleString('en-US')} <span className="text-sm">Unit</span></p>
              </div>
            </div>
          </div>

          {/* INPUT TRANSAKSI & BUKU BESAR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              
              {/* KAS PRESIDEN */}
              {isMenteriOrAdmin && (
                <div className="bg-white/90 dark:bg-[#151822]/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 shadow-sm dark:shadow-xl dark:shadow-emerald-900/10 transition-colors">
                  <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2"><Banknote className="w-5 h-5" /> Terima Kas Presiden</h2>
                  <form onSubmit={handleSimpanKasPresiden} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium uppercase tracking-wider">Pilih Tanggal Masuk</label>
                      <input type="date" value={inputKasDate} onChange={(e) => setInputKasDate(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-emerald-300 dark:border-emerald-700/50 p-3 rounded-xl text-slate-800 dark:text-emerald-200 outline-none focus:border-emerald-500 cursor-pointer" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium uppercase tracking-wider">Nominal Suntikan ($)</label>
                      <input type="number" min="1" required value={nominalPresiden} onChange={(e) => setNominalPresiden(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Contoh: 50000" className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-emerald-300 dark:border-emerald-700/50 p-3 rounded-xl text-slate-800 dark:text-emerald-200 outline-none focus:border-emerald-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium uppercase tracking-wider">Keterangan (Opsional)</label>
                      <input type="text" value={ketPresiden} onChange={(e) => setKetPresiden(e.target.value)} placeholder="Contoh: Modal Awal Pembangunan" className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-emerald-300 dark:border-emerald-700/50 p-3 rounded-xl text-slate-800 dark:text-emerald-200 outline-none focus:border-emerald-500" />
                    </div>
                    <button type="submit" disabled={isSavingKas} className="w-full bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/50 disabled:opacity-50">
                      {isSavingKas ? "Memproses..." : "+ Catat Uang Masuk"}
                    </button>
                  </form>
                </div>
              )}

              {/* TRANSAKSI BARANG */}
              <div className="bg-white/90 dark:bg-[#151822]/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-xl h-fit transition-colors">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Plus className="w-4 h-4 text-cyan-500 dark:text-cyan-400" /> Catat Transaksi Borongan</h2>
                <form onSubmit={handleSimpanTransaksi} className="space-y-4 flex flex-col">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Pilih Tanggal (Backdate)</label>
                    <input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} disabled={!isPetinggi} className={`w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-3 rounded-xl text-slate-800 dark:text-slate-200 outline-none ${!isPetinggi ? 'cursor-not-allowed opacity-60' : 'cursor-pointer focus:border-cyan-500'}`} />
                    <p className="text-[10px] text-slate-500 italic">{isPetinggi ? 'Akses Petinggi: Anda dapat melakukan backdate.' : 'Otomatis terisi tanggal hari ini untuk Staff.'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Tipe Transaksi</label>
                    <select value={trxType} onChange={handleTypeChange} className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-3 rounded-xl text-slate-800 dark:text-slate-200 outline-none">
                      <option value="OUT">Barang Keluar (Jual ke Bisnis/Warga)</option>
                      <option value="IN">Barang Masuk (Beli dari Warga)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Pilih Jenis Barang</label>
                    <select value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-3 rounded-xl text-slate-800 dark:text-slate-200 outline-none cursor-pointer">
                      {Object.keys(masterKomoditas)
                        .filter(barang => barang !== 'Bawang' && barang !== 'Strawberry')
                        .map((barang) => (
                          <option key={barang} value={barang}>{formatDisplayName(barang)}</option>
                        ))
                      }
                      <option value="PROMO">🌟 Harga Khusus (Promo / Event)</option>
                    </select>
                  </div>
                  {isPromo && (
                    <div className="space-y-1.5 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                      <label className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Nama Barang Custom</label>
                      <input type="text" value={customItemName} onChange={(e) => setCustomItemName(e.target.value)} placeholder="Contoh: Lelang Besi Tua" className="w-full mt-1 bg-white dark:bg-[#0b0e14] border border-amber-300 dark:border-amber-700/50 p-2.5 rounded-lg text-amber-800 dark:text-amber-200 outline-none focus:border-amber-500" />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{trxType === 'IN' ? 'Sumber Barang' : 'Nama Pembeli / Bisnis'}</label>
                    {trxType === 'IN' ? (
                      <input type="text" value="Warga (General)" readOnly className="w-full bg-slate-100 dark:bg-[#0b0e14]/50 border border-slate-300 dark:border-slate-700/50 p-3 rounded-xl text-slate-500 cursor-not-allowed" />
                    ) : (
                      <select value={actorName} onChange={(e) => setActorName(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-3 rounded-xl text-slate-800 dark:text-slate-200 outline-none cursor-pointer">
                        {allActors.map((actor, idx) => (<option key={idx} value={actor}>{actor}</option>))}
                      </select>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Jumlah</label>
                      <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-3 rounded-xl text-slate-800 dark:text-slate-200 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium uppercase tracking-wider flex justify-between items-center ${isPromo ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        <span>Harga/Unit</span>
                        {isPromo ? <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 px-1.5 rounded text-amber-600 dark:text-amber-300">Custom</span> : <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 px-1.5 rounded text-emerald-600 dark:text-emerald-300">Regulasi</span>}
                      </label>
                      <input type="number" min="1" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value === '' ? '' : Number(e.target.value))} readOnly={!isPromo} placeholder="0" className={`w-full p-3 rounded-xl outline-none ${isPromo ? 'bg-slate-50 dark:bg-[#0b0e14] border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-200 focus:border-amber-500' : 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-bold cursor-not-allowed'}`} />
                    </div>
                  </div>

                  <button type="button" onClick={handleAddToCart} className="w-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 font-semibold py-2.5 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-all text-sm">
                    + Masukkan ke Nota
                  </button>

                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Daftar Barang Nota Ini:</label>
                    {cartItems.length > 0 ? (
                      <div className="bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-white/10 rounded-xl p-2 space-y-2 max-h-40 overflow-y-auto">
                        {cartItems.map((c, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs bg-white dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-transparent">
                            <div><span className="font-bold text-slate-800 dark:text-slate-200">{formatDisplayName(c.item)}</span><span className="text-slate-500 dark:text-slate-400 ml-2">({c.qty} pcs)</span></div>
                            <button type="button" onClick={() => handleRemoveFromCart(idx)} className="text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 font-bold px-2">✕</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-3 bg-slate-50 dark:bg-[#0b0e14]/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">Keranjang kosong.</p>
                    )}
                  </div>

                  <button type="submit" disabled={isSaving} className="w-full mt-2 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50 flex justify-center gap-2 disabled:opacity-50">
                    {isSaving ? "Menyimpan..." : "Simpan Nota Permanen"}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white/90 dark:bg-[#151822]/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-xl overflow-hidden flex flex-col h-fit transition-colors">
              <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Buku Besar Transaksi DB</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Data live berdasarkan filter {summaryTab === 'HARI_INI' ? 'Hari Ini' : summaryTab === 'BULAN_INI' ? 'Bulan Ini' : 'Pilihan Custom'}.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input type="text" placeholder="Cari pihak atau barang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 py-2.5 pl-10 pr-4 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 outline-none transition-all" />
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[800px]">
                <table className="w-full text-left border-collapse relative">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-[#151822] z-10 shadow-sm">
                    <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-200 dark:border-white/5">
                      <th className="px-2 py-3">Waktu</th>
                      <th className="px-2 py-3">Tipe</th>
                      <th className="px-2 py-3">Info Borongan / Keterangan</th>
                      <th className="px-2 py-3 text-right">Nilai / Transaksi</th>
                      <th className="px-2 py-3 text-right">Kas Gov</th>
                      <th className="px-2 py-3 text-right">Komisi</th>
                      <th className="px-2 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {isLoading ? (
                      <tr><td colSpan={7} className="px-2 py-8 text-center text-slate-500">Memuat data...</td></tr>
                    ) : (tableTransactions.length === 0 && filteredKas.length === 0) ? (
                      <tr><td colSpan={7} className="px-2 py-8 text-center text-slate-500">Tidak ada data ditemukan pada periode ini.</td></tr>
                    ) : (
                      <>
                        {filteredKas.map((kas, idx) => (
                          <tr key={`kas-${idx}`} className="border-b border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors">
                            <td className="px-2 py-3"><p className="text-emerald-700 dark:text-emerald-300 font-medium">{kas.tanggal}</p><p className="text-emerald-500 text-xs mt-0.5">Uang Kas</p></td>
                            <td className="px-2 py-3"><span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"><Banknote className="w-3 h-3" /> SUNTIKAN</span></td>
                            <td className="px-2 py-3">
                              <p className="font-bold text-emerald-800 dark:text-emerald-200">{kas.keterangan}</p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Oleh: {kas.penerima}</p>
                            </td>
                            <td className="px-2 py-3 text-right"><p className="font-bold text-emerald-800 dark:text-emerald-200">+${kas.jumlah.toLocaleString('en-US')}</p></td>
                            <td className="px-2 py-3 text-right"><span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">+${kas.jumlah.toLocaleString('en-US')}</span></td>
                            <td className="px-2 py-3 text-right"><span className="font-bold text-sm text-emerald-400/50 dark:text-emerald-700/50">-</span></td>
                            <td className="px-2 py-3 text-center text-slate-400 dark:text-slate-500 text-xs">-</td>
                          </tr>
                        ))}

                        {tableTransactions.map((trx, index) => (
                          <tr key={index} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-2 py-3"><p className="text-slate-700 dark:text-slate-300 font-medium">{trx.date}</p><p className="text-slate-500 text-xs mt-0.5">{trx.time}</p></td>
                            <td className="px-2 py-3">{trx.type === 'OUT' ? <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"><ArrowUp className="w-3 h-3" /> OUT</span> : <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"><ArrowDown className="w-3 h-3" /> IN</span>}</td>
                            <td className="px-2 py-3">
                              <p className="font-bold text-slate-800 dark:text-slate-200">{formatDisplayName(trx.item)}</p>
                              <p className="text-xs text-slate-500 mt-0.5">Pihak: {trx.actor}</p>
                              {isPetinggi && <p className="text-[10px] text-cyan-600 dark:text-cyan-500 mt-1.5 font-bold tracking-wider">INPUT BY: {trx.petugas || 'Sistem'}</p>}
                            </td>
                            <td className="px-2 py-3 text-right"><p className="font-bold text-slate-800 dark:text-slate-200">${trx.total.toLocaleString('en-US')}</p></td>
                            <td className="px-2 py-3 text-right"><span className={`font-bold text-sm ${trx.gov > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{trx.gov > 0 ? `+$${trx.gov.toLocaleString('en-US')}` : `-$${Math.abs(trx.gov).toLocaleString('en-US')}`}</span></td>
                            <td className="px-2 py-3 text-right"><span className="font-bold text-sm text-blue-600 dark:text-blue-400">{trx.officerCut > 0 ? `+$${trx.officerCut.toLocaleString('en-US')}` : '+$0'}</span></td>
                            <td className="px-2 py-3">
                              <div className="flex items-center justify-center gap-1">
                                {isPetinggi && (
                                  <button onClick={() => handleEditTransaksi(trx)} className="p-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-lg transition-colors" title="Edit Transaksi">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}
                                {isMenteriOrAdmin && (
                                  <button onClick={() => handleHapusTransaksi(trx.id)} className="p-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors" title="Hapus Transaksi">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                                {!isPetinggi && <span className="text-xs text-slate-400 dark:text-slate-500">-</span>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* PUSAT MANAJEMEN PEGAWAI (HANYA ADMIN) */}
          {isAdmin && (
            <div className="pt-8 border-t border-slate-200 dark:border-white/10 mt-10">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><ShieldAlert className="text-rose-500 dark:text-rose-400" /> Pusat Manajemen Pegawai & Akses Kota</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Panel kendali tertinggi untuk mengatur seluruh otoritas server</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white/90 dark:bg-[#151822]/80 backdrop-blur-md p-6 rounded-2xl border border-rose-200 dark:border-rose-500/20 shadow-sm dark:shadow-xl h-fit dark:shadow-rose-900/10 transition-colors">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><UserPlus className="w-5 h-5 text-rose-500 dark:text-rose-400" /> Daftarkan Pengguna Baru</h2>
                  <form onSubmit={handleTambahPegawai} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">ID Login (Username)</label>
                      <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Contoh: ucup_admin" className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-3 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Nama Lengkap (Karakter RP)</label>
                      <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Contoh: Ucup Surucup" className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-3 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Kata Sandi</label>
                      <input type="text" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-3 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Tingkat Jabatan (Role)</label>
                      <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-3 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500">
                        <option value="STAFF">Pegawai Biasa (Staff)</option>
                        <option value="WAMEN">Wakil Menteri (Wamen)</option>
                        <option value="MENTERI">Menteri</option>
                        <option value="ADMIN">Pusat Admin (Super User)</option>
                      </select>
                    </div>
                    <button type="submit" disabled={isSavingUser} className="w-full mt-4 bg-rose-50 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/50 font-bold py-3.5 px-4 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                      {isSavingUser ? "Memproses..." : "+ Berikan Akses Pusat"}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white/90 dark:bg-[#151822]/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-xl overflow-hidden flex flex-col transition-colors">
                  <div className="p-6 border-b border-slate-200 dark:border-white/5">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Users className="w-5 h-5 text-cyan-500 dark:text-cyan-400" /> Daftar Akun Terdaftar</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola seluruh izin akses petugas dan petinggi kota di sini.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                          <th className="px-4 py-3">Nama Pegawai</th>
                          <th className="px-4 py-3">ID Akses (Username)</th>
                          <th className="px-4 py-3">Jabatan / Level</th>
                          <th className="px-4 py-3 text-center">Tindakan Khusus</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {usersList.length === 0 ? (
                          <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada data pegawai.</td></tr>
                        ) : (
                          usersList.map((u, index) => (
                            <tr key={u.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{u.name}</td>
                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">@{u.username}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                  u.role === 'ADMIN' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' :
                                  u.role === 'MENTERI' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' : 
                                  u.role === 'WAMEN' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' : 
                                  'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleResetPassword(u.id, u.name)} title="Ganti Sandi" className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors">
                                    <Key className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleHapusPegawai(u.id, u.name)} title="Cabut Akses (Pecat)" className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL EDIT TRANSAKSI */}
          {editingTrx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-[#151822] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-md transition-colors">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Edit Data Transaksi</h3>
                
                <div className="mb-4 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 transition-colors">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{formatDisplayName(editingTrx.item)}</p>
                  <p>Nilai: ${editingTrx.total}</p>
                  <p className="mt-1 text-[10px] text-amber-600/80 dark:text-amber-400/80 italic">*Untuk menjaga sinkronisasi stok gudang, rincian barang dan nominal tidak dapat diubah.</p>
                </div>
                
                <form onSubmit={handleUpdateTransaksi} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Tanggal</label>
                    <input type="date" value={editingTrx.date} onChange={(e) => setEditingTrx({...editingTrx, date: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-2.5 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-cyan-500 transition-colors" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Waktu</label>
                    <input type="time" value={editingTrx.time} onChange={(e) => setEditingTrx({...editingTrx, time: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-2.5 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-cyan-500 transition-colors" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Pihak Terkait (Warga/Bisnis)</label>
                    <input type="text" value={editingTrx.actor} onChange={(e) => setEditingTrx({...editingTrx, actor: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-slate-700/50 p-2.5 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-cyan-500 transition-colors" required />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setEditingTrx(null)} className="w-1/2 py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Batal</button>
                    <button type="submit" disabled={isUpdating} className="w-1/2 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50 disabled:opacity-50">
                      {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}