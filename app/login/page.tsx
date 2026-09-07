"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Landmark, User, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { loginUser } from '../actions'; // Import fungsi login aslinya

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Panggil fungsi Server Action untuk mencocokkan ke PostgreSQL
    const res = await loginUser(username, password);

    if (res.success) {
      // Jika berhasil, arahkan ke URL /dashboard
      router.push('/dashboard');
    } else {
      // Jika gagal, tampilkan pesan error
      setErrorMsg(res.message || 'Login Gagal');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-300 relative font-sans overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff20 1px, transparent 1px), linear-gradient(90deg, #ffffff20 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-600 shadow-[0_0_30px_rgba(6,182,212,0.15)] mb-4">
            <Landmark className="text-cyan-400 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">Portal Disnaker</h1>
          <p className="text-sm text-cyan-400/80 mt-2 font-medium tracking-widest uppercase">Pemerintah Satu Mimpi</p>
        </div>

        <div className="bg-[#151822]/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-300/90 font-medium">Sistem Terbatas. Akses dimonitor ketat oleh Server Kota.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider pl-1">ID Petugas</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="w-5 h-5 text-slate-500" /></div>
                <input 
                  type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="ID Petugas (cth: menteri)" 
                  className="w-full bg-[#0b0e14] border border-slate-700/50 py-3.5 pl-11 pr-4 rounded-xl text-slate-200 placeholder-slate-600 focus:border-cyan-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider pl-1">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-slate-500" /></div>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-[#0b0e14] border border-slate-700/50 py-3.5 pl-11 pr-4 rounded-xl text-slate-200 placeholder-slate-600 focus:border-cyan-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Jika ada pesan error dari database, munculkan di sini */}
            {errorMsg && (
              <p className="text-red-400 text-xs font-bold text-center bg-red-900/20 py-2 rounded-lg border border-red-500/30">
                {errorMsg}
              </p>
            )}

            <button type="submit" disabled={isLoading} className="w-full mt-4 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 font-bold py-3.5 px-4 rounded-xl hover:bg-cyan-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)] disabled:opacity-50">
              {isLoading ? <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div> : <><LogIn className="w-5 h-5" /> Otorisasi Akses</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}