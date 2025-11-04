"use client";

import React, { useState, useEffect } from "react";
import { Upload, ArrowRight, Shield, GraduationCap } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function VerificationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 🔐 Ambil userId dari localStorage / JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedId = localStorage.getItem("userId");

    if (savedId) {
      setUserId(savedId);
      console.log("✅ userId ditemukan di localStorage:", savedId);
    } else if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const extractedId = decoded?.sub || decoded?.id || null;
        if (extractedId) {
          localStorage.setItem("userId", extractedId);
          setUserId(extractedId);
          console.log("✅ userId berhasil diekstrak dari token:", extractedId);
        } else {
          console.warn("⚠️ userId tidak ditemukan di token");
        }
      } catch (err) {
        console.error("❌ Gagal decode token:", err);
      }
    } else {
      console.warn("⚠️ Tidak ada token atau userId tersimpan");
    }
  }, []);

  // 📸 Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      console.warn("⚠️ Format file tidak valid:", f.type);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      console.warn("⚠️ Ukuran file terlalu besar (>5MB)");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // 🚀 Upload kartu pelajar
  const handleUpload = async () => {
    if (!file) {
      console.warn("⚠️ Silakan pilih file kartu pelajar terlebih dahulu");
      return;
    }
    if (!userId) {
      console.error("❌ User ID tidak ditemukan. Silakan login ulang.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("kartu_pelajar", file);
      formData.append("userId", userId);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      console.log("📤 Mengirim ke:", `${apiUrl}/student-card/upload`);

      const res = await fetch(`${apiUrl}/student-card/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("📥 Respon dari server:", data);

      if (!res.ok) {
        throw new Error(data.message || "Upload gagal");
      }

      console.log("✅ Kartu pelajar berhasil diunggah & diverifikasi!");
      window.location.href = "/login";
    } catch (err) {
      console.error("❌ Terjadi kesalahan saat upload:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-center mb-6 space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Verifikasi Kartu Pelajar
          </h1>
        </div>

        <p className="text-center text-gray-600 mb-8">
          Unggah foto kartu pelajar Anda untuk melengkapi proses registrasi.
        </p>

        {/* Upload area */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-8 cursor-pointer hover:bg-blue-50 transition-all">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="rounded-xl w-full object-cover"
              />
            ) : (
              <>
                <Upload className="w-10 h-10 text-blue-500 mb-3" />
                <span className="text-gray-600 font-medium">
                  Klik untuk memilih foto kartu pelajar
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Format JPG, PNG, WEBP (maks. 5MB)
                </span>
              </>
            )}
            <input
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
              }}
              className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Ganti Foto
            </button>
          )}
        </div>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Mengunggah...</span>
            </>
          ) : (
            <>
              <span>Upload Sekarang</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm flex justify-center items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Upload aman dengan enkripsi SSL</span>
        </div>
      </div>
    </div>
  );
}
