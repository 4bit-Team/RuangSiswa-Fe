export async function fetchKelas() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const res = await fetch(`${apiUrl}/kelas`);
  if (!res.ok) throw new Error("Gagal fetch kelas");
  return res.json();
}

export async function fetchJurusan() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const res = await fetch(`${apiUrl}/jurusan`);
  if (!res.ok) throw new Error("Gagal fetch jurusan");
  return res.json();
}
