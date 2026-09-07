import { redirect } from 'next/navigation';

export default function Home() {
  // Begitu ada warga yang buka website utama, langsung ditendang ke halaman login
  redirect('/login');
}