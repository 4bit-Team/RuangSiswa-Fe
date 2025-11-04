"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { apiRequest } from "@/lib/api";

const RegisterPage: React.FC = () => {
  const router = useRouter(); // <-- pindahkan ke sini
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      console.warn("❌ Password dan konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest("/auth/register", "POST", {
        username,
        email,
        password,
        role: "siswa", // default siswa
      });

  console.log("✅ Registrasi berhasil. Arahkan ke halaman verifikasi kartu pelajar...");
  localStorage.setItem("justRegistered", "true");
  router.push("/register/verification");
    } catch (err: any) {
      console.error("❌ Gagal mendaftar:", err.message || err);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side */}
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
                Bergabung dengan
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Portal Digital SMK
                </span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Daftarkan akun siswa Anda untuk mengakses seluruh fitur akademik & pengembangan kompetensi.
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {["14+ Modul", "5 User Role", "24/7 Akses"].map((stat, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-blue-100">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.split(" ")[0]}
                </div>
                <div className="text-xs text-gray-600 mt-1">{stat.split(" ")[1]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Daftar Akun Baru</h3>
              <p className="text-gray-600">Isi data di bawah untuk membuat akun siswa Anda</p>
            </div>

            <div className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email aktif"
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
                    placeholder="Buat password"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
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
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Atau</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Sudah punya akun?{" "}
                <a href="/login" className="font-semibold text-blue-600 hover:text-indigo-600">
                  Masuk Sekarang
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

          {/* Help Text */}
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

export default RegisterPage;
