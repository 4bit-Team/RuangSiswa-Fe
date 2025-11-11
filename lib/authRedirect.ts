"use client";

/**
 * Redirect user ke dashboard jika sudah login berdasarkan cookie `auth_profile`.
 * Biasanya dipakai di halaman login/register.
 */
export function redirectIfLoggedInFromCookie() {
  try {
    const match = document.cookie.match(/auth_profile=([^;]+)/);
    if (!match) return;

    const user = JSON.parse(decodeURIComponent(match[1]));
    const role = user.role;

    if (role === "siswa") {
      window.location.href = "/home";
    } else if (role === "kesiswaan") {
      window.location.href = "/dashboard-kesiswaan";
    } else if (role === "bk") {
      window.location.href = "/dashboard-bk";
    } else if (role === "admin") {
      window.location.href = "/dashboard-admin";
    }
  } catch (err) {
    console.error("Cookie auth_profile tidak valid:", err);
  }
}

/**
 * Digunakan di halaman verifikasi.
 * Jika user tidak punya cookie `auth_profile`, redirect ke /register.
 * Jika punya, ambil info user (id, kelas, jurusan, dsb).
 * Jika baru register (justRegistered), tidak redirect.
 */
export function getUserFromCookieOrRedirect(router?: any) {
  try {
    const justRegistered = localStorage.getItem("justRegistered");

    const match = document.cookie.match(/auth_profile=([^;]+)/);
    if (!match) {
      // Kalau belum login dan bukan dari register → ke /register
      if (!justRegistered) {
        console.warn("Belum login & bukan dari register, redirect ke /register...");
        if (router) router.replace("/register");
      }
      return null;
    }

    const user = JSON.parse(decodeURIComponent(match[1]));

    // Validasi isi cookie
    if (!user || !user.id || !user.role) {
      console.warn("Data cookie auth_profile tidak valid, redirect ke /register...");
      if (router) router.replace("/register");
      return null;
    }

    return user;
  } catch (err) {
    console.error("Gagal membaca cookie auth_profile:", err);
    if (router) router.replace("/register");
    return null;
  }
}

export async function verifyAuthOrRedirect() {
  try {
    const res = await import("@/lib/api").then((m) =>
      m.apiRequest("/auth/me", "GET")
    );

    if (!res || !res.id) throw new Error("Invalid user");

    // simpan cookie kalau valid
    document.cookie = `auth_profile=${encodeURIComponent(
      JSON.stringify(res)
    )}; path=/; secure; SameSite=Lax`;

    return res;
  } catch {
    // hapus semua cookies
    document.cookie =
      "auth_profile=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.clear();
    sessionStorage.clear();

    // redirect ke login
    window.location.href = "/login";
    return null;
  }
}