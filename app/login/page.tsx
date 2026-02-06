"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest, API_URL } from "@/lib/api";
import { redirectIfLoggedInFromCookie } from "@/lib/authRedirect";
import { authStorage } from "@/lib/authStorage";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    redirectIfLoggedInFromCookie();
  }, []);

  const fetchProfileAndSetCookie = async (token: string) => {
    try {
      console.log('📥 Fetching user profile...')
      
      // Gunakan token yang baru di-return dari login
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        console.error('❌ Failed to fetch profile, status:', response.status)
        // Return user data dari login response jika profile endpoint gagal
        return null
      }
      
      const profile = await response.json()
      console.log('✅ Profile fetched:', profile)
      
      // Simpan ke cookie
      document.cookie = `auth_profile=${encodeURIComponent(JSON.stringify(profile))}; path=/; max-age=86400`
      
      return profile
    } catch (err) {
      console.error('❌ Error fetching profile:', err)
      return null
    }
  }

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Email dan password wajib diisi!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Format email tidak valid!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("/auth/login", "POST", { email, password });
      const role = res.user?.role;
      const username = res.user?.username;

      if (!role) {
        alert("Login gagal! Anda tidak memiliki role yang valid.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("access_token", res.token);
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", role);

      const profile = await fetchProfileAndSetCookie(res.token);
      
      // Simpan profile ke localStorage juga (fallback jika profile dari /auth/me gagal)
      if (profile) {
        authStorage.setProfile(profile);
      } else {
        // Jika /auth/me gagal, gunakan user data dari login response
        console.warn('⚠️ Using user data from login response as fallback')
        const loginUser = res.user || {}
        authStorage.setProfile(loginUser);
      }

      try {
        const userToLog = profile || res.user || {}
        await apiRequest("/log/login", "POST", { username: userToLog?.username || username || "User", email: userToLog?.email, role: userToLog?.role });
      } catch (err) {
        console.error("Gagal kirim log login ke backend", err);
      }

      if (role === "siswa") {
        window.location.href = "/home/siswa";
      } else if (role === "kesiswaan") {
        window.location.href = "/home/kesiswaan";
      } else if (role === "bk") {
        window.location.href = "/home/bk";
      } else if (role === "admin") {
        window.location.href = "/home/admin";
      } else {
        alert("Role tidak dikenali! Login dibatalkan.");
        localStorage.removeItem("token");
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        alert(err.response.data?.message || "Login gagal! Email atau password salah.");
      } else {
        alert(err.message || "Terjadi kesalahan, coba lagi nanti.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <Zap className="w-5 h-5" />, text: "Akses Real-time" },
    { icon: <Shield className="w-5 h-5" />, text: "Keamanan Terjamin" },
    { icon: <BookOpen className="w-5 h-5" />, text: "14+ Modul Terintegrasi" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Layer - Matching Landing Page */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-white via-blue-50 to-white"></div>

        {/* Premium curved wave - top right */}
        <svg className="absolute -top-32 -right-24 w-[500px] h-[500px] opacity-25" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="loginGradTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
              <stop offset="40%" stopColor="rgba(34, 211, 238, 0.2)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.08)" />
            </linearGradient>
          </defs>
          <path d="M 0,50 C 35,15 70,40 110,28 C 150,16 180,50 200,80 L 200,200 C 120,185 40,195 0,200 Z" fill="url(#loginGradTop)" />
          <path d="M 0,75 C 40,40 80,65 125,50 C 160,40 180,75 200,105 L 200,200 C 120,185 40,195 0,200 Z" fill="url(#loginGradTop)" opacity="0.7" />
        </svg>

        {/* Premium curved wave - bottom left */}
        <svg className="absolute -bottom-32 -left-32 w-[500px] h-[500px] opacity-23" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="loginGradBottom" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.38)" />
              <stop offset="40%" stopColor="rgba(59, 130, 246, 0.18)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0.07)" />
            </linearGradient>
          </defs>
          <path d="M 200,40 C 165,75 130,100 90,120 C 50,140 20,95 0,130 L 0,200 C 60,190 140,200 200,200 Z" fill="url(#loginGradBottom)" />
          <path d="M 200,65 C 170,100 140,125 100,140 C 60,155 30,110 0,150 L 0,200 C 60,190 140,200 200,200 Z" fill="url(#loginGradBottom)" opacity="0.7" />
        </svg>

        {/* Floating blobs - matching landing page colors and opacity */}
        <div className="absolute w-72 h-72 top-1/4 left-1/4 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 70%)',
          filter: 'blur(30px)',  
          opacity: 0.28,
          animation: 'moveBlob1 15s infinite'
        }}></div>

        <div className="absolute w-60 h-60 top-1/3 right-1/4 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(34, 211, 238, 0.3) 0%, rgba(34, 211, 238, 0.05) 70%)',
          filter: 'blur(24px)',
          opacity: 0.25,
          animation: 'moveBlob2 18s infinite'
        }}></div>

        <div className="absolute w-56 h-56 bottom-1/4 right-1/3 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.05) 70%)',
          filter: 'blur(26px)',
          opacity: 0.24,
          animation: 'moveBlob3 20s infinite'
        }}></div>

        {/* Accent dots */}
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-shimmer" style={{ animationDelay: '0s', opacity: 0.6 }}></div>
        <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-shimmer" style={{ animationDelay: '1s', opacity: 0.5 }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-shimmer" style={{ animationDelay: '0.5s', opacity: 0.6 }}></div>
      </div>

      {/* Keyframe animations for blobs */}
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

      <div className="relative w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Section */}
        <div className="hidden md:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600 bg-clip-text text-transparent">
                  RuangSiswa
                </h1>
                <p className="text-sm text-gray-600">SMK Negeri 1 Cibinong</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Selamat Datang di
                <span className="block bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600 bg-clip-text text-transparent">
                  RuangSiswa!
                </span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Sistem terpadu Kesiswaan dan BK untuk memantau kondisi siswa serta menyediakan layanan konseling di sekolah.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100/50 hover:shadow-md transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg text-white">
                  {f.icon}
                </div>
                <span className="text-gray-700 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Masuk ke Akun Anda</h3>
              <p className="text-gray-600">Masukkan kredensial Anda untuk melanjutkan</p>
            </div>

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-600">Ingat saya</span>
                </label>
                <button
                  className="text-sm font-medium text-blue-500 hover:text-indigo-600 transition-colors"
                  type="button"
                >
                  Lupa Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Register */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Belum punya akun?{" "}
                <a href="/register" className="font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                  Daftar Sekarang
                </a>
              </p>
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <Shield className="w-4 h-4" />
                <span>Login aman dengan enkripsi SSL</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Butuh bantuan?{" "}
              <button className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent font-medium hover:opacity-80 transition-opacity" type="button">
                Hubungi Admin
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
