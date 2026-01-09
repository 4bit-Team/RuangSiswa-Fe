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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Section */}
        <div className="hidden md:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  RuangSiswa
                </h1>
                <p className="text-sm text-gray-600">SMK Negeri 1 Cibinong</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Selamat Datang di
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Portal RuangSiswa
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
                className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg text-white">
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
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
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
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
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
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Ingat saya</span>
                </label>
                <button
                  className="text-sm font-medium text-blue-600 hover:text-indigo-600 transition-colors"
                  type="button"
                >
                  Lupa Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
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
                <a href="/register" className="font-semibold text-blue-600 hover:text-indigo-600">
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
              <button className="text-blue-600 hover:text-indigo-600 font-medium" type="button">
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
