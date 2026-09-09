"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Landmark, ArrowUp, ArrowDown, TrendingUp, PieChart, User, Plus, LogOut, 
  AlertCircle, Package, Calendar, CalendarDays, AlertTriangle, ShieldAlert, ShieldCheck, 
  Download, Search, UserPlus, Users, Trash2, Key, Banknote, CalendarSearch
} from 'lucide-react';

import { 
  getTransactions, saveTransaction, getWarehouseStock, getActiveUser, logoutUser, 
  getAllUsers, createUser, resetUserPassword, deleteUser, getKasNegara, addKasNegara 
} from '../actions';

const masterKomoditas: Record<string, { buyPrice: number; sellInstansi: number; sellWarga: number; maxTerima: number; maxJual: number; stokMax: number; minHijau: number; }> = {
  'Anggur':           { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Bawang':           { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Beras':            { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Cabai':            { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Jagung':           { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Jeruk':            { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Strawberry':       { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Tomat':            { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Wortel':           { buyPrice: 800, sellInstansi: 900, sellWarga: 1000, maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Papan Kayu':       { buyPrice: 700, sellInstansi: 800,  sellWarga: 900,  maxTerima: 99999, maxJual: 99999, stokMax: 15000, minHijau: 3000 },
  'Drum Oil':         { buyPrice: 700, sellInstansi: 800,  sellWarga: 900,  maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Susu':             { buyPrice: 700, sellInstansi: 800,  sellWarga: 900,  maxTerima: 99999, maxJual: 99999, stokMax: 7500, minHijau: 1000 },
  'Batu Bersih':      { buyPrice: 900,  sellInstansi: 1000, sellWarga: 1100, maxTerima: 99999, maxJual: 99999, stokMax: 50000, minHijau: 5000 },
  'Recycle Package':  { buyPrice: 900,  sellInstansi: 1000, sellWarga: 1100, maxTerima: 99999, maxJual: 99999, stokMax: 50000, minHijau: 5000 },
  'Package Ayam':     { buyPrice: 1000, sellInstansi: 1200, sellWarga: 1300, maxTerima: 99999, maxJual: 99999, stokMax: 10000, minHijau: 1000 },
  'Tembaga':          { buyPrice: 7500, sellInstansi: 8000, sellWarga: 8100, maxTerima: 99999, maxJual: 99999, stokMax: 10000, minHijau: 500 },
  'Baju':             { buyPrice: 900, sellInstansi: 1100, sellWarga: 1200, maxTerima: 99999, maxJual: 99999, stokMax: 15000, minHijau: 3000 },
  'Kulit':            { buyPrice: 800, sellInstansi: 1100, sellWarga: 1200, maxTerima: 99999, maxJual: 99999, stokMax: 5000, minHijau: 3000 }
};

export default function DashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeUser, setActiveUser] = useState<{name: string, role: string} | null>(null);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [warehouseStock, setWarehouseStock] = useState<Record<string, number>>({});
  const [usersList, setUsersList] = useState<any[]>([]);
  const [kasPresidenList, setKasPresidenList] = useState<any[]>([]); 
  
  const [summaryTab, setSummaryTab] = useState<'HARI_INI' | 'BULAN_INI' | 'CUSTOM'>('HARI_INI');
  const [filterDate, setFilterDate] = useState(''); // State untuk filter tanggal manual
  
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Transaksi
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [inputDate, setInputDate] = useState(todayStr); // Input backdate
  const [trxType, setTrxType] = useState<'OUT' | 'IN'>('OUT');
  const [itemName, setItemName] = useState('Anggur');
  const [customItemName, setCustomItemName] = useState('');
  const [actorName, setActorName] = useState('Warga (General)');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [pricePerUnit, setPricePerUnit] = useState<number | ''>(1000);
  const [isPromo, setIsPromo] = useState(false);
  const [cartItems, setCartItems] = useState<Array<{item: string; qty: number; price: number;}>>([]);

  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('STAFF');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Form Uang Kas Presiden
  const [inputKasDate, setInputKasDate] = useState(todayStr);
  const [nominalPresiden, setNominalPresiden] = useState<number | ''>('');
  const [ketPresiden, setKetPresiden] = useState('');
  const [isSavingKas, setIsSavingKas] = useState(false);

  const allActors = ["Warga (General)", "Nusantara Resto", "Kungkungkhap Resto", "969 Resto", "Tekno garage", "969 garage", "stunberg garage", "max garage", "kungkung garage", "maison rainheart", "kedai YGM", "YGM Center", "sumber rezeki"];

  useEffect(() => {
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
          return alert(`❌ STOK TIDAK CUKUP!\nSisa ${baseName}: ${currentStock.toLocaleString('id-ID')}`);
        }
      }
    }

    setIsSaving(true);
    let totalKeseluruhan = 0;
    cartItems.forEach(cart => { totalKeseluruhan += cart.qty * cart.price; });

    const gov = trxType === 'OUT' ? totalKeseluruhan * 0.8 : -totalKeseluruhan;
    const officerCut = trxType === 'OUT' ? totalKeseluruhan * 0.2 : 0;
    
    const newTrxData = {
      date: inputDate, // Menggunakan tanggal dari input
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: trxType,
      item: cartItems.map(c => `${c.qty}x ${c.item}`).join(', '),
      actor: actorName,
      qty: cartItems.reduce((acc, curr) => acc + curr.qty, 0),
      price: cartItems[0].price,
      total: totalKeseluruhan, gov, officerCut,
      petugas: activeUser?.name || 'Sistem' // Menyimpan siapa yang input
    };

    const res = await saveTransaction(newTrxData, cartItems);

    if (res.success) {
      setTransactions(await getTransactions());
      setWarehouseStock(await getWarehouseStock() || {});
      setCartItems([]);
      alert("Transaksi berhasil dicatat!");
    } else {
      alert("Terjadi kesalahan sistem!");
    }
    
    setIsSaving(false);
  };

  const handleSimpanKasPresiden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominalPresiden || Number(nominalPresiden) <= 0) return alert("Nominal tidak valid!");
    setIsSavingKas(true);
    
    const data = {
      tanggal: inputKasDate, // Menggunakan input manual jika diubah
      jumlah: Number(nominalPresiden),
      keterangan: ketPresiden || 'Suntikan Dana Presiden',
      penerima: activeUser?.name || 'Menteri'
    };

    const res = await addKasNegara(data);
    if (res.success) {
      alert("Dana dari Presiden berhasil masuk ke Kas!");
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
      alert("Berhasil mendaftarkan pegawai baru!");
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
    if (res.success) alert(`Sandi ${name} berhasil direset!`);
    else alert(res.message);
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

  if (!isMounted || !activeUser) return (
    <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
       <p className="text-cyan-400 ml-4 font-bold tracking-widest animate-pulse">MEMVERIFIKASI TIKET OTORITAS...</p>
    </div>
  );

  // LOGIKA AKSES ROLE
  const isAdmin = activeUser.role === 'ADMIN';
  const isPetinggi = activeUser.role === 'MENTERI' || activeUser.role === 'WAMEN' || isAdmin;
  const isMenteriOrAdmin = activeUser.role === 'MENTERI' || isAdmin; 

  // Kalkulasi Filter Data
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
      trx.item.toLowerCase().includes(q) ||  
      trx.type.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return alert("Tidak ada data transaksi untuk diexport pada periode ini.");
    const headers = ["Tanggal", "Waktu", "Tipe Transaksi", "Pihak Terkait", "Rincian Barang", "Total Barang", "Nilai Transaksi ($)", "Kas Pemerintah ($)", "Komisi Petugas ($)", "Nama Petugas"];
    const rows = filteredTransactions.map(trx => {
      const safeItem = `"${trx.item}"`; 
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

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-300 relative font-sans overflow-hidden p-4 md:p-8 pb-20">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff20 1px, transparent 1px), linear-gradient(90deg, #ffffff20 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* HEADER IDENTITAS PEGAWAI / ADMIN */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-lg">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-600">
              <Landmark className="text-slate-200 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Portal Disnaker</h1>
              <p className="text-sm text-emerald-400">Pemerintah Satu Mimpi - Divisi Logistik</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-3 px-5 rounded-2xl shadow-lg">
            <div className={`p-2 rounded-full ${isAdmin ? 'bg-rose-500/20 border border-rose-500/50' : isPetinggi ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-slate-700'}`}>
              {isAdmin ? <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" /> : isPetinggi ? <ShieldCheck className="w-5 h-5 text-amber-400" /> : <User className="w-5 h-5 text-slate-300" />}
            </div>
            <div className="flex flex-col pr-3 border-r border-white/10">
              <p className={`text-sm font-bold ${isAdmin ? 'text-rose-400' : isPetinggi ? 'text-amber-400' : 'text-white'}`}>{activeUser.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></span>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{isAdmin ? 'PUSAT ADMIN' : activeUser.role}</p>
              </div>
            </div>
            <button onClick={handleKeluar} className="pl-3 text-slate-400 hover:text-red-400 transition-colors flex flex-col items-center group">
              <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[10px] font-bold mt-1">Keluar</span>
            </button>
          </div>
        </div>

        {/* STOCK GUDANG */}
        <div className="bg-[#151822]/80 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Kestabilan Stok Gudang (DB Real-time)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3">
            {Object.keys(masterKomoditas).map((item) => {
              const qty = warehouseStock[item] || 0; 
              const reg = masterKomoditas[item];
              const isHijau = qty >= reg.minHijau;
              const isPenuh = qty >= reg.stokMax;
              const isKrisis = qty < (reg.minHijau / 2);

              return (
                <div key={item} className="bg-[#0b0e14] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                  <span className="text-xs font-medium text-slate-400 line-clamp-1 truncate" title={item}>{item}</span>
                  <div className="flex items-end justify-between mt-2">
                    <span className={`text-lg font-extrabold ${isPenuh ? 'text-blue-400' : isHijau ? 'text-emerald-400' : isKrisis ? 'text-red-400' : 'text-amber-400'}`}>
                      {qty.toLocaleString('id-ID')}
                    </span>
                    {isKrisis && <span title="Stok Krisis!"><AlertTriangle className="w-4 h-4 text-red-500 mb-1 animate-pulse" /></span>}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
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
              <button onClick={() => setSummaryTab('HARI_INI')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${summaryTab === 'HARI_INI' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                <Calendar className="w-4 h-4" /> Hari Ini
              </button>
              
              {isPetinggi && (
                <>
                  <button onClick={() => setSummaryTab('BULAN_INI')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${summaryTab === 'BULAN_INI' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/50 border border-amber-500/50' : 'bg-amber-900/10 text-amber-500/70 border border-amber-500/20 hover:bg-amber-900/20'}`}>
                    <CalendarDays className="w-4 h-4" /> Rekap Bulan Ini
                  </button>
                  <div className="flex items-center gap-2 bg-white/5 p-1.5 px-3 rounded-xl border border-white/10">
                    <CalendarSearch className="w-4 h-4 text-slate-400" />
                    <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setSummaryTab('CUSTOM'); }} className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer" />
                  </div>
                </>
              )}
            </div>
            
            {isPetinggi && (
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-600/30 hover:shadow-lg hover:shadow-emerald-900/40 active:scale-95">
                <Download className="w-4 h-4" /> Export Data (CSV)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-emerald-900/10 p-5 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2 text-emerald-400"><TrendingUp className="w-4 h-4" /><p className="text-xs font-medium">Kas Pemerintah (80%)</p></div>
              {isMenteriOrAdmin ? (
                <p className={`text-3xl font-bold ${totalKasPemerintah >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{totalKasPemerintah >= 0 ? `+$${totalKasPemerintah.toLocaleString('en-US')}` : `-$${Math.abs(totalKasPemerintah).toLocaleString('en-US')}`}</p>
              ) : (
                <p className="text-lg font-bold text-slate-500 mt-2 italic">Akses Dibatasi</p>
              )}
            </div>
            <div className="bg-blue-900/10 p-5 rounded-2xl border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2 text-blue-400"><PieChart className="w-4 h-4" /><p className="text-xs font-medium">Komisi Petugas (20%)</p></div>
              <p className="text-3xl font-bold text-blue-400">+${summaryKomisi.toLocaleString('en-US')}</p>
            </div>
            <div className="bg-purple-900/10 p-5 rounded-2xl border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2 text-purple-400"><ArrowDown className="w-4 h-4" /><p className="text-xs font-medium">Total Beli (IN)</p></div>
              <p className="text-3xl font-bold text-purple-300">{summaryBarangIn.toLocaleString('en-US')} <span className="text-sm">Unit</span></p>
            </div>
            <div className="bg-orange-900/10 p-5 rounded-2xl border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2 text-orange-400"><ArrowUp className="w-4 h-4" /><p className="text-xs font-medium">Total Jual (OUT)</p></div>
              <p className="text-3xl font-bold text-orange-300">{summaryBarangOut.toLocaleString('en-US')} <span className="text-sm">Unit</span></p>
            </div>
          </div>
        </div>

        {/* INPUT TRANSAKSI & BUKU BESAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            
            {/* KAS PRESIDEN */}
            {isMenteriOrAdmin && (
              <div className="bg-[#151822]/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-500/30 shadow-xl shadow-emerald-900/10">
                <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2"><Banknote className="w-5 h-5" /> Terima Kas Presiden</h2>
                <form onSubmit={handleSimpanKasPresiden} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-emerald-400/80 font-medium uppercase tracking-wider">Pilih Tanggal Masuk</label>
                    <input type="date" value={inputKasDate} onChange={(e) => setInputKasDate(e.target.value)} className="w-full bg-[#0b0e14] border border-emerald-700/50 p-3 rounded-xl text-emerald-200 outline-none focus:border-emerald-500 cursor-pointer" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-emerald-400/80 font-medium uppercase tracking-wider">Nominal Suntikan ($)</label>
                    <input type="number" min="1" required value={nominalPresiden} onChange={(e) => setNominalPresiden(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Contoh: 50000" className="w-full bg-[#0b0e14] border border-emerald-700/50 p-3 rounded-xl text-emerald-200 outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-emerald-400/80 font-medium uppercase tracking-wider">Keterangan (Opsional)</label>
                    <input type="text" value={ketPresiden} onChange={(e) => setKetPresiden(e.target.value)} placeholder="Contoh: Modal Awal Pembangunan" className="w-full bg-[#0b0e14] border border-emerald-700/50 p-3 rounded-xl text-emerald-200 outline-none focus:border-emerald-500" />
                  </div>
                  <button type="submit" disabled={isSavingKas} className="w-full bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/50 disabled:opacity-50">
                    {isSavingKas ? "Memproses..." : "+ Catat Uang Masuk"}
                  </button>
                </form>
              </div>
            )}

            {/* TRANSAKSI BARANG */}
            <div className="bg-[#151822]/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl h-fit">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Plus className="w-4 h-4 text-cyan-400" /> Catat Transaksi Borongan</h2>
              <form onSubmit={handleSimpanTransaksi} className="space-y-4 flex flex-col">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pilih Tanggal (Backdate)</label>
                  <input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700/50 p-3 rounded-xl text-slate-200 outline-none cursor-pointer" />
                  <p className="text-[10px] text-slate-500 italic">Otomatis terisi tanggal hari ini untuk Staff operasional.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Tipe Transaksi</label>
                  <select value={trxType} onChange={handleTypeChange} className="w-full bg-[#0b0e14] border border-slate-700/50 p-3 rounded-xl text-slate-200 outline-none">
                    <option value="OUT">Barang Keluar (Jual ke Bisnis/Warga)</option>
                    <option value="IN">Barang Masuk (Beli dari Warga)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pilih Jenis Barang</label>
                  <select value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700/50 p-3 rounded-xl text-slate-200 outline-none cursor-pointer">
                    {Object.keys(masterKomoditas).map((barang) => (<option key={barang} value={barang}>{barang}</option>))}
                    <option value="PROMO">🌟 Harga Khusus (Promo / Event)</option>
                  </select>
                </div>
                {isPromo && (
                  <div className="space-y-1.5 p-3 bg-amber-900/10 border border-amber-500/20 rounded-xl">
                    <label className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Nama Barang Custom</label>
                    <input type="text" value={customItemName} onChange={(e) => setCustomItemName(e.target.value)} placeholder="Contoh: Lelang Besi Tua" className="w-full mt-1 bg-[#0b0e14] border border-amber-700/50 p-2.5 rounded-lg text-amber-200" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">{trxType === 'IN' ? 'Sumber Barang' : 'Nama Pembeli / Bisnis'}</label>
                  {trxType === 'IN' ? (
                    <input type="text" value="Warga (General)" readOnly className="w-full bg-[#0b0e14]/50 border border-slate-700/50 p-3 rounded-xl text-slate-500 cursor-not-allowed" />
                  ) : (
                    <select value={actorName} onChange={(e) => setActorName(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700/50 p-3 rounded-xl text-slate-200 outline-none cursor-pointer">
                      {allActors.map((actor, idx) => (<option key={idx} value={actor}>{actor}</option>))}
                    </select>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Jumlah</label>
                    <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" className="w-full bg-[#0b0e14] border border-slate-700/50 p-3 rounded-xl text-slate-200 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-xs font-medium uppercase tracking-wider flex justify-between items-center ${isPromo ? 'text-amber-400' : 'text-emerald-400'}`}>
                      <span>Harga/Unit</span>
                      {isPromo ? <span className="text-[10px] bg-amber-500/20 px-1.5 rounded text-amber-300">Custom</span> : <span className="text-[10px] bg-emerald-500/20 px-1.5 rounded text-emerald-300">Regulasi</span>}
                    </label>
                    <input type="number" min="1" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value === '' ? '' : Number(e.target.value))} readOnly={!isPromo} placeholder="0" className={`w-full p-3 rounded-xl outline-none ${isPromo ? 'bg-[#0b0e14] border border-amber-700/50 text-amber-200 focus:border-amber-500' : 'bg-emerald-950/20 border border-emerald-900/50 text-emerald-400 font-bold cursor-not-allowed'}`} />
                  </div>
                </div>

                <button type="button" onClick={handleAddToCart} className="w-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold py-2.5 rounded-xl hover:bg-cyan-500/20 transition-all text-sm">
                  + Masukkan ke Nota
                </button>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Daftar Barang Nota Ini:</label>
                  {cartItems.length > 0 ? (
                    <div className="bg-[#0b0e14] border border-white/10 rounded-xl p-2 space-y-2 max-h-40 overflow-y-auto">
                      {cartItems.map((c, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg">
                          <div><span className="font-bold text-slate-200">{c.item}</span><span className="text-slate-400 ml-2">({c.qty} pcs)</span></div>
                          <button type="button" onClick={() => handleRemoveFromCart(idx)} className="text-red-400 hover:text-red-300 font-bold px-2">✕</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-3 bg-[#0b0e14]/50 rounded-xl border border-dashed border-slate-800">Keranjang kosong.</p>
                  )}
                </div>

                <button type="submit" disabled={isSaving} className="w-full mt-2 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50 flex justify-center gap-2 disabled:opacity-50">
                  {isSaving ? "Menyimpan..." : "Simpan Nota Permanen"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#151822]/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl overflow-hidden flex flex-col h-fit">
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Buku Besar Transaksi DB</h2>
                <p className="text-sm text-slate-400 mt-1">Data live berdasarkan filter {summaryTab === 'HARI_INI' ? 'Hari Ini' : summaryTab === 'BULAN_INI' ? 'Bulan Ini' : 'Pilihan Custom'}.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-500" />
                </div>
                <input type="text" placeholder="Cari pihak atau barang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700/50 py-2.5 pl-10 pr-4 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 outline-none transition-all" />
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[800px]">
              <table className="w-full text-left border-collapse min-w-max relative">
                <thead className="sticky top-0 bg-[#151822] z-10 shadow-sm">
                  <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">
                    <th className="p-4">Waktu</th>
                    <th className="p-4">Tipe</th>
                    <th className="p-4">Info Borongan / Keterangan</th>
                    <th className="p-4 text-right">Nilai / Transaksi</th>
                    <th className="p-4 text-right">Kas Gov</th>
                    <th className="p-4 text-right">Komisi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {isLoading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
                  ) : (tableTransactions.length === 0 && filteredKas.length === 0) ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Tidak ada data ditemukan pada periode ini.</td></tr>
                  ) : (
                    <>
                      {/* Baris Khusus Suntikan Kas Presiden */}
                      {filteredKas.map((kas, idx) => (
                        <tr key={`kas-${idx}`} className="border-b border-emerald-500/20 bg-emerald-900/10 hover:bg-emerald-900/20 transition-colors">
                          <td className="p-4"><p className="text-emerald-300 font-medium">{kas.tanggal}</p><p className="text-emerald-500 text-xs mt-0.5">Uang Kas</p></td>
                          <td className="p-4"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><Banknote className="w-3 h-3" /> SUNTIKAN</span></td>
                          <td className="p-4">
                            <p className="font-bold text-emerald-200">{kas.keterangan}</p>
                            <p className="text-xs text-emerald-500 mt-0.5">Oleh: {kas.penerima}</p>
                          </td>
                          <td className="p-4 text-right"><p className="font-bold text-emerald-200">+${kas.jumlah.toLocaleString('en-US')}</p></td>
                          <td className="p-4 text-right"><span className="font-bold text-sm text-emerald-400">+${kas.jumlah.toLocaleString('en-US')}</span></td>
                          <td className="p-4 text-right"><span className="font-bold text-sm text-emerald-700/50">-</span></td>
                        </tr>
                      ))}

                      {/* Baris Transaksi Reguler */}
                      {tableTransactions.map((trx, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4"><p className="text-slate-300 font-medium">{trx.date}</p><p className="text-slate-500 text-xs mt-0.5">{trx.time}</p></td>
                          <td className="p-4">{trx.type === 'OUT' ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"><ArrowUp className="w-3 h-3" /> OUT</span> : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ArrowDown className="w-3 h-3" /> IN</span>}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-200">{trx.item}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Pihak: {trx.actor}</p>
                            {/* FITUR AKSES: HANYA PETINGGI YANG BISA MELIHAT SIAPA YANG INPUT */}
                            {isPetinggi && <p className="text-[10px] text-cyan-500 mt-1.5 font-bold tracking-wider">INPUT BY: {trx.petugas || 'Sistem'}</p>}
                          </td>
                          <td className="p-4 text-right"><p className="font-bold text-slate-200">${trx.total.toLocaleString('en-US')}</p></td>
                          <td className="p-4 text-right"><span className={`font-bold text-sm ${trx.gov > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{trx.gov > 0 ? `+$${trx.gov.toLocaleString('en-US')}` : `-$${Math.abs(trx.gov).toLocaleString('en-US')}`}</span></td>
                          <td className="p-4 text-right"><span className="font-bold text-sm text-blue-400">{trx.officerCut > 0 ? `+$${trx.officerCut.toLocaleString('en-US')}` : '+$0'}</span></td>
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
          <div className="pt-8 border-t border-white/10 mt-10">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldAlert className="text-rose-400" /> Pusat Manajemen Pegawai & Akses Kota</h1>
              <p className="text-sm text-slate-400">Panel kendali tertinggi untuk mengatur seluruh otoritas server</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-[#151822]/80 backdrop-blur-md p-6 rounded-2xl border border-rose-500/20 shadow-xl h-fit shadow-rose-900/10">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><UserPlus className="w-5 h-5 text-rose-400" /> Daftarkan Pengguna Baru</h2>
                <form onSubmit={handleTambahPegawai} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">ID Login (Username)</label>
                    <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Contoh: ucup_admin" className="w-full bg-[#0b0e14] border border-slate-700/50 p-3 rounded-xl text-slate-200 outline-none focus:border-rose-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Nama Lengkap (Karakter RP)</label>
                    <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Contoh: Ucup Surucup" className="w-full bg-[#0b0e14] border border-slate-700/50 p-3 rounded-xl text-slate-200 outline-none focus:border-rose-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Kata Sandi</label>
                    <input type="text" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#0b0e14] border border-slate-700/50 p-3 rounded-xl text-slate-200 outline-none focus:border-rose-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Tingkat Jabatan (Role)</label>
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700/50 p-3 rounded-xl text-slate-200 outline-none focus:border-rose-500">
                      <option value="STAFF">Pegawai Biasa (Staff)</option>
                      <option value="WAMEN">Wakil Menteri (Wamen)</option>
                      <option value="MENTERI">Menteri</option>
                      <option value="ADMIN">Pusat Admin (Super User)</option>
                    </select>
                  </div>
                  <button type="submit" disabled={isSavingUser} className="w-full mt-4 bg-rose-600/20 text-rose-400 border border-rose-500/50 font-bold py-3.5 px-4 rounded-xl hover:bg-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {isSavingUser ? "Memproses..." : "+ Berikan Akses Pusat"}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-[#151822]/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-cyan-400" /> Daftar Akun Terdaftar</h2>
                  <p className="text-sm text-slate-400 mt-1">Kelola seluruh izin akses petugas dan petinggi kota di sini.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-max">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/5 bg-white/[0.02]">
                        <th className="p-4">Nama Pegawai</th>
                        <th className="p-4">ID Akses (Username)</th>
                        <th className="p-4">Jabatan / Level</th>
                        <th className="p-4 text-center">Tindakan Khusus</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {usersList.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada data pegawai.</td></tr>
                      ) : (
                        usersList.map((u, index) => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-bold text-slate-200">{u.name}</td>
                            <td className="p-4 text-slate-400">@{u.username}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                u.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                u.role === 'MENTERI' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                u.role === 'WAMEN' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleResetPassword(u.id, u.name)} title="Ganti Sandi" className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                                  <Key className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleHapusPegawai(u.id, u.name)} title="Cabut Akses (Pecat)" className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
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

      </div>
    </div>
  );
}