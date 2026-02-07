"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowRight, ArrowLeft, Shield, Sparkles } from "lucide-react";
import { getUserFromCookieOrRedirect } from "@/lib/authRedirect";

export default function VerificationPage() {
  const [extractedData, setExtractedData] = useState<any>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userKelas, setUserKelas] = useState<string>("");
  const [userJurusan, setUserJurusan] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const user = getUserFromCookieOrRedirect(router);

    if (user) {
      setUserId(user.id?.toString() || null);
      setUserKelas(user.kelas?.nama?.toUpperCase() || "-");
      setUserJurusan(user.jurusan?.nama?.toUpperCase() || "-");

      localStorage.setItem("userId", user.id?.toString() || "");
      localStorage.setItem("kelas", user.kelas?.nama || "");
      localStorage.setItem("jurusan", user.jurusan?.nama || "");
    } else {
      const localId = localStorage.getItem("userId");
      const localKelas = localStorage.getItem("kelas");
      const localJurusan = localStorage.getItem("jurusan");

      if (localId) setUserId(localId);
      if (localKelas) setUserKelas(localKelas.toUpperCase());
      if (localJurusan) setUserJurusan(localJurusan.toUpperCase());
    }

    console.log("✅ userId:", userId || localStorage.getItem("userId"));
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      alert("⚠️ Format file tidak valid! Hanya JPG, PNG, atau WEBP.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert("⚠️ Ukuran file terlalu besar! Maksimal 5MB.");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUploadMessage(null);
    setExtractedData(null);
  };

  const handleUpload = async () => {
    const user = userId || localStorage.getItem("userId");
    const kelas = userKelas || localStorage.getItem("kelas");
    const jurusan = userJurusan || localStorage.getItem("jurusan");

    if (!file) return alert("Silakan pilih foto kartu pelajar terlebih dahulu!");
    if (!user) return alert("User ID tidak ditemukan, silakan login ulang.");

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("kartu_pelajar", file);
      formData.append("userId", user);
      formData.append("kelas", userKelas);
      formData.append("jurusan", userJurusan);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const res = await fetch(`${apiUrl}/student-card/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("📥 Respon dari server:", data);

      setUploadMessage(data.message);
      setExtractedData(data.extractedData || null);
    } catch (err: any) {
      console.error("Upload gagal:", err);
      setUploadMessage("Terjadi kesalahan saat upload kartu pelajar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReuploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800"></div>

        <svg className="absolute -top-48 -left-32 w-[450px] h-[450px] opacity-22" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="verifyGradTop2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.28)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </linearGradient>
          </defs>
          <path d="M 0,80 C 45,40 90,60 130,45 C 165,32 185,65 200,95 L 200,200 C 110,190 45,200 0,200 Z" fill="url(#verifyGradTop2)" />
        </svg>

        <svg className="absolute -bottom-32 -right-32 w-[600px] h-[600px] opacity-26" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="verifyGradBottom" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.38)" />
              <stop offset="40%" stopColor="rgba(59, 130, 246, 0.18)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0.07)" />
            </linearGradient>
          </defs>
          <path d="M 200,40 C 165,75 130,100 90,120 C 50,140 20,95 0,130 L 0,200 C 60,190 140,200 200,200 Z" fill="url(#verifyGradBottom)" />
          <path d="M 200,65 C 170,100 140,125 100,140 C 60,155 30,110 0,150 L 0,200 C 60,190 140,200 200,200 Z" fill="url(#verifyGradBottom)" opacity="0.7" />
          <path d="M 200,90 C 175,120 150,145 110,160 C 70,175 40,130 0,170 L 0,200 C 65,190 145,200 200,200 Z" fill="url(#verifyGradBottom)" opacity="0.5" />
        </svg>

        <svg className="absolute -bottom-48 -right-32 w-[450px] h-[450px] opacity-20" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="verifyGradBottom2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0.06)" />
            </linearGradient>
          </defs>
          <path d="M 200,50 C 160,90 130,115 80,140 C 40,160 15,105 0,145 L 0,200 C 70,190 140,200 200,200 Z" fill="url(#verifyGradBottom2)" />
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

      <div className="relative w-full max-w-3xl z-10">
        {/* Header Badge */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center gap-3 bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 px-6 py-3 rounded-full text-sm font-bold backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            Verifikasi Identitas
          </div>
        </div>

        {/* Main Card */}
        <div className="relative bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/30 shadow-2xl p-8 md:p-10 hover:border-cyan-400/50 hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-white mb-2">Verifikasi Kartu Pelajar</h1>
              <p className="text-blue-200">Unggah foto kartu pelajar Anda untuk melengkapi proses registrasi</p>
            </div>

            {/* Upload Area */}
            <div className="mb-8">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-400/50 rounded-xl p-8 cursor-pointer hover:bg-cyan-500/10 hover:border-cyan-300 transition-all duration-300 backdrop-blur-sm">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="rounded-xl w-full max-h-64 object-cover"
                  />
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-cyan-300 mb-3" />
                    <span className="text-blue-100 font-semibold text-lg">
                      Klik untuk memilih foto kartu pelajar
                    </span>
                    <span className="text-xs text-blue-300 mt-2">
                      Format JPG, PNG, WEBP (maks. 5MB)
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {preview && (
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setExtractedData(null);
                    setUploadMessage(null);
                  }}
                  className="mt-3 text-sm text-red-400 hover:text-red-300 font-semibold transition-colors"
                >
                  ✕ Ganti Foto
                </button>
              )}
            </div>

            {/* Upload Button */}
            {!extractedData && (
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all duration-300 transform disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 mb-6"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <span>Upload Sekarang</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}

            {/* Upload Message */}
            {uploadMessage && (
              <div
                className={`mb-6 p-4 rounded-xl text-center font-semibold border-2 ${
                  uploadMessage.startsWith("✅")
                    ? "bg-green-500/20 text-green-200 border-green-400/50"
                    : "bg-red-500/20 text-red-200 border-red-400/50"
                }`}
              >
                {uploadMessage}
              </div>
            )}

            {/* Extracted Data */}
            {extractedData && (
              <div className="mb-6 p-6 bg-cyan-500/10 rounded-xl border-2 border-cyan-400/30">
                <h2 className="text-lg font-black mb-4 text-cyan-100">
                  Hasil Ekstraksi Kartu Pelajar
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs text-blue-300 font-semibold block mb-1">Nama</span>
                    <span className="text-white font-medium">{extractedData.nama}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs text-blue-300 font-semibold block mb-1">NIS</span>
                    <span className="text-white font-medium">{extractedData.nis}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs text-blue-300 font-semibold block mb-1">NISN</span>
                    <span className="text-white font-medium">{extractedData.nisn || "-"}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs text-blue-300 font-semibold block mb-1">TTL</span>
                    <span className="text-white font-medium">{extractedData.ttl}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs text-blue-300 font-semibold block mb-1">Gender</span>
                    <span className="text-white font-medium">{extractedData.gender}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs text-blue-300 font-semibold block mb-1">Kelas</span>
                    <span className="text-white font-medium">{extractedData.kelas}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs text-blue-300 font-semibold block mb-1">Jurusan</span>
                    <span className="text-white font-medium">{extractedData.jurusan}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs text-blue-300 font-semibold block mb-1">Kelas Lengkap</span>
                    <span className="text-white font-medium">{extractedData.kelas_lengkap}</span>
                  </div>
                </div>

                {/* Validation Status */}
                {extractedData.validasi && (
                  <div className="mb-6 p-4 bg-white/5 rounded-lg border-2 border-white/10">
                    <span className="text-blue-300 font-semibold block mb-2">Status Verifikasi:</span>
                    <span
                      className={`text-lg font-black ${
                        extractedData.validasi.status === "sesuai"
                          ? "text-green-300"
                          : "text-red-300"
                      }`}
                    >
                      {extractedData.validasi.status === "sesuai"
                        ? "✓ Kelas & Jurusan Sesuai"
                        : "✕ Kelas/Jurusan Tidak Sesuai"}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {extractedData.validasi?.status === "sesuai" && (
                    <button
                      className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all duration-300 transform flex items-center justify-center gap-2"
                      onClick={() => {
                        localStorage.removeItem("justRegistered");
                        localStorage.removeItem("kelas");
                        localStorage.removeItem("jurusan");
                        window.location.href = "/login";
                      }}
                    >
                      <span>Lanjut ke Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    className="flex-1 bg-white/10 border-2 border-cyan-400/50 text-cyan-200 px-6 py-3 rounded-xl font-bold hover:bg-cyan-500/10 hover:border-cyan-300 transition-all duration-300 flex items-center justify-center gap-2"
                    onClick={handleReuploadClick}
                  >
                    <span>Upload Ulang</span>
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center space-x-2 text-blue-300 text-xs">
                <Shield className="w-4 h-4" />
                <span>Upload aman dengan enkripsi SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
