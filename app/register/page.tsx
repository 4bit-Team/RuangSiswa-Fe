"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Shield,
  Zap,
  BookOpen,
  Phone,
  Sparkles,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { fetchKelas, fetchJurusan } from "@/lib/masterData";
import { redirectIfLoggedInFromCookie } from "@/lib/authRedirect";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [kelas, setKelas] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [jurusanList, setJurusanList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    fetchKelas().then(data => setKelasList(data)).catch(() => setKelasList([]));
    fetchJurusan().then(data => setJurusanList(data)).catch(() => setJurusanList([]));
  }, []);

  useEffect(() => {
    redirectIfLoggedInFromCookie();
  }, []);

  const handleRegister = async () => {
    setValidationError("");
    
    if (!username.trim()) {
      setValidationError("Username tidak boleh kosong");
      return;
    }
    if (!email.trim()) {
      setValidationError("Email tidak boleh kosong");
      return;
    }
    if (!phoneNumber.trim()) {
      setValidationError("Nomor telepon tidak boleh kosong");
      return;
    }
    if (!kelas) {
      setValidationError("Pilih kelas terlebih dahulu");
      return;
    }
    if (!jurusan) {
      setValidationError("Pilih jurusan terlebih dahulu");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setValidationError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("/auth/register", "POST", {
        username,
        email,
        password,
        phone_number: phoneNumber,
        kelas_id: parseInt(kelas),
        jurusan_id: parseInt(jurusan),
        role: "siswa",
      });

      if (response && response.user && response.user.id) {
        localStorage.setItem("userId", response.user.id.toString());
        localStorage.setItem("kelas", kelas);
        localStorage.setItem("jurusan", jurusan);
      }
      
      localStorage.setItem("justRegistered", "true");
      console.log("Registrasi berhasil. Arahkan ke halaman verifikasi kartu pelajar...");
      router.push("/register/verification");
    } catch (err: any) {  
      console.error("Gagal mendaftar:", err.message || err);
      setValidationError(err.message || "Terjadi kesalahan saat mendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <Zap className="w-5 h-5" />, text: "Data Real-time & Aman" },
    { icon: <Shield className="w-5 h-5" />, text: "Konseling Online 24/7" },
    { icon: <BookOpen className="w-5 h-5" />, text: "21+ Fitur Terintegrasi" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800"></div>

        <svg className="absolute -top-48 -left-32 w-[450px] h-[450px] opacity-22" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="registerGradTop2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.28)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </linearGradient>
          </defs>
          <path d="M 0,80 C 45,40 90,60 130,45 C 165,32 185,65 200,95 L 200,200 C 110,190 45,200 0,200 Z" fill="url(#registerGradTop2)" />
        </svg>

        <svg className="absolute -bottom-32 -right-32 w-[600px] h-[600px] opacity-26" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="registerGradBottom" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.38)" />
              <stop offset="40%" stopColor="rgba(59, 130, 246, 0.18)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0.07)" />
            </linearGradient>
          </defs>
          <path d="M 200,40 C 165,75 130,100 90,120 C 50,140 20,95 0,130 L 0,200 C 60,190 140,200 200,200 Z" fill="url(#registerGradBottom)" />
          <path d="M 200,65 C 170,100 140,125 100,140 C 60,155 30,110 0,150 L 0,200 C 60,190 140,200 200,200 Z" fill="url(#registerGradBottom)" opacity="0.7" />
          <path d="M 200,90 C 175,120 150,145 110,160 C 70,175 40,130 0,170 L 0,200 C 65,190 145,200 200,200 Z" fill="url(#registerGradBottom)" opacity="0.5" />
        </svg>

        <svg className="absolute -bottom-48 -right-32 w-[450px] h-[450px] opacity-20" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="registerGradBottom2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0.06)" />
            </linearGradient>
          </defs>
          <path d="M 200,50 C 160,90 130,115 80,140 C 40,160 15,105 0,145 L 0,200 C 70,190 140,200 200,200 Z" fill="url(#registerGradBottom2)" />
        </svg>

        <div className="absolute w-72 h-72 top-1/4 left-1/4 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 70%)',
          filter: 'blur(30px)',  
          opacity: 0.28,
          animation: 'moveBlob1 15s infinite'
        }}></div>

        <div className="absolute w-60 h-60 top-1/3 right-1/4 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(34, 211, 238, 0.3) 0%, rgba(34, 211, 238, 0.05) 70%)',
          filter: 'blur(24px)',
          opacity: 0.22,
          animation: 'moveBlob2 18s infinite'
        }}></div>

        <div className="absolute w-56 h-56 bottom-1/4 left-1/3 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.05) 70%)',
          filter: 'blur(26px)',
          opacity: 0.24,
          animation: 'moveBlob3 20s infinite'
        }}></div>

        <div className="absolute top-20 right-20 w-2 h-2 md:w-3 md:h-3 bg-blue-400 rounded-full animate-shimmer" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full animate-shimmer" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 md:w-2.5 md:h-2.5 bg-indigo-400 rounded-full animate-shimmer" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-300 rounded-full animate-shimmer" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <style>{`
        @keyframes moveBlob1 {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.1); }
          50% { transform: translate(60px, 20px) scale(0.9); }
          75% { transform: translate(30px, 60px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes moveBlob2 {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-40px, 40px) scale(0.95); }
          50% { transform: translate(-20px, -40px) scale(1.1); }
          75% { transform: translate(40px, -20px) scale(1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes moveBlob3 {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, 40px) scale(1.05); }
          50% { transform: translate(-30px, 60px) scale(0.95); }
          75% { transform: translate(-50px, -30px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
      `}</style>

      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="fixed top-8 left-8 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-cyan-300 hover:bg-white/20 hover:border-cyan-400/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
        title="Kembali"
      >
        <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      <div className="relative w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center z-10">
        {/* Left Section */}
        <div className="hidden md:block space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 px-6 py-3 rounded-full text-sm font-bold backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              Platform RuangSiswa
            </div>

            <div>
              <h1 className="text-6xl font-black text-white mb-4 leading-tight">
                Daftar & Bergabung
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">dengan Platform Digital</span>
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed max-w-md">
                Akses lengkap ke portal akademik digital SMK Negeri 1 Cibinong dengan fitur bimbingan konseling dan manajemen kesiswaan terintegrasi.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-cyan-400/50 hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2.5 rounded-lg text-white group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <span className="text-blue-100 font-medium group-hover:text-white transition-colors">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full">
          <div className="relative bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/30 shadow-2xl p-8 md:p-10 hover:border-cyan-400/50 hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-white mb-2">Daftar Akun Baru</h3>
                <p className="text-blue-200">Isi data di bawah untuk membuat akun siswa Anda</p>
              </div>

              <div className="space-y-5">
                {/* Row 1: Username dan Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-100 mb-2">Username</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300/60 w-5 h-5" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan username"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 text-white placeholder-white/40 outline-none transition-all duration-300 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-100 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300/60 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Masukkan email aktif"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 text-white placeholder-white/40 outline-none transition-all duration-300 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Nomor Telepon dan Kelas */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-100 mb-2">Nomor Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300/60 w-5 h-5" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Masukkan nomor telepon"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 text-white placeholder-white/40 outline-none transition-all duration-300 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-100 mb-2">Kelas</label>
                    <div className="relative">
                      <select
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        className="w-full pl-4 pr-10 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 text-white placeholder-white/40 outline-none transition-all duration-300 backdrop-blur-sm appearance-none"
                      >
                        <option value="" className="text-gray-900">Pilih Kelas</option>
                        {kelasList.map((k: any) => (
                          <option key={k.id} value={k.id} className="text-gray-900">{k.nama}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-cyan-300">
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Jurusan */}
                <div>
                  <label className="block text-sm font-semibold text-blue-100 mb-2">Jurusan</label>
                  <div className="relative">
                    <select
                      value={jurusan}
                      onChange={(e) => setJurusan(e.target.value)}
                      className="w-full pl-4 pr-10 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 text-white placeholder-white/40 outline-none transition-all duration-300 backdrop-blur-sm appearance-none"
                    >
                      <option value="" className="text-gray-900">Pilih Jurusan</option>
                      {jurusanList.map((j: any) => (
                        <option key={j.id} value={j.id} className="text-gray-900">{j.nama + ' - ' + j.kode}</option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-cyan-300">
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                {/* Row 4: Password dan Konfirmasi */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-100 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300/60 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Buat password"
                        className="w-full pl-12 pr-12 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 text-white placeholder-white/40 outline-none transition-all duration-300 backdrop-blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-300/60 hover:text-cyan-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-100 mb-2">Konfirmasi Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300/60 w-5 h-5" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        className="w-full pl-12 pr-12 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 text-white placeholder-white/40 outline-none transition-all duration-300 backdrop-blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-300/60 hover:text-cyan-300 transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Validation Alert */}
                {validationError && (
                  <div className="bg-red-500/20 border-2 border-red-400/50 rounded-xl p-4 flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-200 font-medium">{validationError}</p>
                  </div>
                )}

                {/* Register Button */}
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all duration-300 transform disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Sekarang</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-center text-sm text-blue-200">
                  Sudah punya akun?{" "}
                  <a href="/login" className="font-semibold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                    Masuk Sekarang
                  </a>
                </p>
              </div>

              {/* Security Info */}
              <div className="mt-4 flex items-center justify-center space-x-2 text-blue-300 text-xs">
                <Shield className="w-4 h-4" />
                <span>Pendaftaran aman dengan enkripsi SSL</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="text-center mt-6">
            <p className="text-sm text-blue-200">
              Butuh bantuan?{" "}
              <button className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-semibold hover:opacity-80 transition-opacity" type="button">
                Hubungi Admin
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
