"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowRight, Shield, GraduationCap } from "lucide-react";
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

      // Simpan sementara untuk reload berikutnya
      localStorage.setItem("userId", user.id?.toString() || "");
      localStorage.setItem("kelas", user.kelas?.nama || "");
      localStorage.setItem("jurusan", user.jurusan?.nama || "");
    } else {
      // 🔹 fallback kalau getUserFromCookieOrRedirect return null
      const localId = localStorage.getItem("userId");
      const localKelas = localStorage.getItem("kelas");
      const localJurusan = localStorage.getItem("jurusan");

      if (localId) setUserId(localId);
      if (localKelas) setUserKelas(localKelas.toUpperCase());
      if (localJurusan) setUserJurusan(localJurusan.toUpperCase());
    }

    // Debug (sementara)
    console.log("✅ userId:", userId || localStorage.getItem("userId"));
  }, [router]);

  // Handle file input
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

  // Upload ke backend
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
      console.error("❌ Upload gagal:", err);
      setUploadMessage("❌ Terjadi kesalahan saat upload kartu pelajar.");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
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
                setExtractedData(null);
                setUploadMessage(null);
              }}
              className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Ganti Foto
            </button>
          )}
        </div>

        {/* Upload button */}
        {!extractedData && (
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
        )}

        {/* Hasil dari backend */}
        {uploadMessage && (
          <div
            className={`mt-6 p-4 rounded-xl text-center font-semibold ${
              uploadMessage.startsWith("✅")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {uploadMessage}
          </div>
        )}

        {/* Tampilkan hasil OCR jika ada */}
        {extractedData && (
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200 shadow">
            <h2 className="text-lg font-bold mb-4 text-blue-700">
              Hasil Ekstraksi Kartu Pelajar
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Nama:</span> {extractedData.nama}
              </div>
              <div>
                <span className="font-semibold">NIS:</span> {extractedData.nis}
              </div>
              <div>
                <span className="font-semibold">NISN:</span> {extractedData.nisn || "-"}
              </div>
              <div>
                <span className="font-semibold">TTL:</span> {extractedData.ttl}
              </div>
              <div>
                <span className="font-semibold">Gender:</span> {extractedData.gender}
              </div>
              <div>
                <span className="font-semibold">Kelas:</span> {extractedData.kelas}
              </div>
              <div>
                <span className="font-semibold">Jurusan:</span> {extractedData.jurusan}
              </div>
            </div>

            {/* Status dari backend */}
            {extractedData.validasi && (
              <div className="mt-4">
                <span className="font-semibold">Status Verifikasi:</span>
                <span
                  className={
                    extractedData.validasi.status === "sesuai"
                      ? "text-green-600 font-bold ml-2"
                      : "text-red-600 font-bold ml-2"
                  }
                >
                  {extractedData.validasi.status === "sesuai"
                    ? "Kelas & Jurusan Sesuai"
                    : "Kelas/Jurusan Tidak Sesuai"}
                </span>
              </div>
            )}

            {/* Tombol lanjut */}
            <div className="mt-6 flex gap-4">
              {extractedData.validasi?.status === "sesuai" && (
                <button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    localStorage.removeItem("justRegistered");
                    localStorage.removeItem("kelas");
                    localStorage.removeItem("jurusan");
                    window.location.href = "/login";
                  }}
                >
                  Lanjut ke Login
                </button>
              )}

              <button
                className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
                onClick={handleReuploadClick}
              >
                Upload Ulang
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm flex justify-center items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Upload aman dengan enkripsi SSL</span>
        </div>
      </div>
    </div>
  );
}
