"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageSquare,
  Shield,
  Clock,
  Calendar,
  Users,
  MessageCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { CounselingCardProps } from "@types";
import AppointmentScheduleModal from "../modals/AppointmentScheduleModal";
import GroupCounselingModal from "../modals/GroupCounselingModal";
import { useAuth } from "@hooks/useAuth";
import { apiRequest } from "@lib/api";
import {
  getStatusLabel,
  getStatusBadgeColor,
  statusBadgeColor,
  getTypeColor,
  getStatusColor,
  formatDate,
  typeLabel,
} from "@/lib/reservasi";

interface Reservasi {
  id: number;
  counselorId: number;
  counselor?: { id: number; username: string; fullName?: string };
  preferredDate: string;
  preferredTime: string;
  type: "chat" | "tatap-muka";
  topic?: { id: number; name: string; description?: string } | string | null;
  topicId?: number;
  createdAt?: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
}

interface GroupReservasi {
  id: number;
  groupName: string;
  creatorId: number;
  creator?: { id: number; username: string; fullName?: string };
  counselorId: number;
  counselor?: { id: number; username: string; fullName?: string };
  students?: any[];
  preferredDate: string;
  preferredTime: string;
  type: "chat" | "tatap-muka";
  topic?: { id: number; name: string; description?: string } | string | null;
  topicId?: number;
  createdAt?: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
}

interface MergedReservationItem {
  id: string;
  kind: "personal" | "group";
  title: string;
  counselor?: { id: number; username: string; fullName?: string };
  dateTime: Date;
  preferredTime?: string | null;
  type?: "chat" | "tatap-muka";
  status: string;
  members?: number;
  createdAt?: Date;
  raw?: any;
}

const CounselingCard: React.FC<
  CounselingCardProps & {
    onBooking?: (type: string) => void;
    handleSubmitReservasi: (data: any) => void;
    useGroupModal?: boolean;
  }
> = ({
  icon: Icon,
  title,
  description,
  duration,
  color,
  badge,
  onBooking,
  handleSubmitReservasi,
  useGroupModal = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="relative">
          <div
            className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {badge && (
            <span className="absolute top-0 right-0 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm sm:text-xs font-medium">
              {badge}
            </span>
          )}
        </div>
        <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <Clock className="w-4 h-4" />
          <span>{duration}</span>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 hover:shadow-lg"
        >
          Buat Janji
        </button>
      </div>

      {useGroupModal ? (
        <GroupCounselingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={(data) => {
            console.log("Booking confirmed:", data);
            handleSubmitReservasi(data);
            setModalOpen(false);
          }}
        />
      ) : (
        <AppointmentScheduleModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          counselingType={title}
          onConfirm={(data) => {
            console.log("Booking confirmed:", data);
            handleSubmitReservasi(data);
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
};

const KonselingPage: React.FC = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [reservasiList, setReservasiList] = useState<Reservasi[]>([]);
  const [groupReservasiList, setGroupReservasiList] = useState<
    GroupReservasi[]
  >([]);
  const [sessionFilter, setSessionFilter] = useState<
    "all" | "personal" | "group"
  >("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [categories, setCategories] = useState<any[]>([]);
  const [topicFilter, setTopicFilter] = useState<number | "">("");
  const [counselorFilter, setCounselorFilter] = useState<number | "">("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchMyReservasi();
      fetchMyGroupReservasi();
      fetchCategories();
    }
  }, [user, token]);

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const resp = await apiRequest(
        "/counseling-category",
        "GET",
        undefined,
        token,
      );
      if (Array.isArray(resp)) setCategories(resp);
      else if (resp?.data && Array.isArray(resp.data)) setCategories(resp.data);
      else setCategories([]);
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
      setCategories([]);
    }
  };

  const fetchMyReservasi = async () => {
    try {
      console.log("📥 Fetching user reservasi...");
      const response = await apiRequest(
        "/reservasi/student/my-reservations",
        "GET",
        undefined,
        token,
      );
      console.log("✅ Reservasi loaded:", response);
      setReservasiList(response || []);
    } catch (error: any) {
      console.error("❌ Error fetching reservasi:", error);
    }
  };

  const fetchMyGroupReservasi = async () => {
    try {
      console.log("📥 Fetching user group reservasi...");
      const response = await apiRequest(
        "/reservasi/group/student/my-group-reservations",
        "GET",
        undefined,
        token,
      );
      console.log("✅ Group Reservasi loaded:", response);
      setGroupReservasiList(response || []);
    } catch (error: any) {
      console.error("❌ Error fetching group reservasi:", error);
    }
  };

  const handleSubmitReservasi = async (formData: any) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        studentId: user?.id,
        counselorId: formData.counselorId,
        preferredDate: new Date(formData.date).toISOString(),
        preferredTime: formData.time,
        type: formData.sessionType === "tatap-muka" ? "tatap-muka" : "chat",
        topic: formData.topic || formData.counselingType,
        notes: formData.notes,
      };

      console.log("📤 Submitting reservasi:", payload);
      const response = await apiRequest("/reservasi", "POST", payload, token);
      console.log("✅ Reservasi created:", response);

      setSuccessMessage(
        "Reservasi berhasil dibuat! Menunggu konfirmasi dari konselor.",
      );

      // Refresh list
      await fetchMyReservasi();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("❌ Error creating reservasi:", error);
      setErrorMessage(error?.message || "Gagal membuat reservasi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReservasiV2 = async (formData: any) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        groupName: formData.groupName,
        creatorId: user?.id,
        studentIds: [...formData.selectedStudentIds, user?.id],
        counselorId: formData.counselorId,
        preferredDate: new Date(formData.date).toISOString(),
        preferredTime: formData.time,
        type: formData.sessionType === "tatap-muka" ? "tatap-muka" : "chat",
        topicId: formData.topicId,
        notes: formData.notes,
      };

      console.log("📤 Submitting group reservasi:", payload);
      const response = await apiRequest(
        "/reservasi/group",
        "POST",
        payload,
        token,
      );
      console.log("✅ Group Reservasi created:", response);

      setSuccessMessage(
        "Reservasi kelompok berhasil dibuat! Menunggu konfirmasi dari konselor.",
      );

      // Refresh list
      await fetchMyGroupReservasi();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("❌ Error creating group reservasi:", error);
      setErrorMessage(error?.message || "Gagal membuat reservasi kelompok");
    } finally {
      setLoading(false);
    }
  };

  const mergedReservations = useMemo<any[]>(() => {
    const mapPersonal = reservasiList.map((res) => {
      const dt = res.preferredDate ? new Date(res.preferredDate) : new Date();
      if (res.preferredTime) {
        const [hh, mm] = (res.preferredTime || "").split(":").map(Number);
        if (!isNaN(hh)) dt.setHours(hh, isNaN(mm) ? 0 : mm);
      }
      const created = res.createdAt ? new Date(res.createdAt) : dt;
      return {
        id: `personal-${res.id}`,
        kind: "personal",
        title:
          typeof res.topic === "object" && res.topic?.name
            ? res.topic.name
            : typeof res.topic === "string"
              ? res.topic
              : "Konseling Pribadi",
        counselor: res.counselor,
        dateTime: dt,
        preferredTime: res.preferredTime,
        type: res.type,
        status: res.status,
        createdAt: created,
        raw: res,
      };
    });

    const mapGroup = groupReservasiList.map((res) => {
      const dt = res.preferredDate ? new Date(res.preferredDate) : new Date();
      if (res.preferredTime) {
        const [hh, mm] = (res.preferredTime || "").split(":").map(Number);
        if (!isNaN(hh)) dt.setHours(hh, isNaN(mm) ? 0 : mm);
      }
      const created = res.createdAt ? new Date(res.createdAt) : dt;
      return {
        id: `group-${res.id}`,
        kind: "group",
        title: res.groupName,
        counselor: res.counselor,
        dateTime: dt,
        preferredTime: res.preferredTime,
        members: res.students?.length || 0,
        type: res.type,
        status: res.status,
        createdAt: created,
        raw: res,
      };
    });
    return ([...mapPersonal, ...mapGroup] as MergedReservationItem[]).sort(
      (a, b) => b.dateTime.getTime() - a.dateTime.getTime(),
    );
  }, [reservasiList, groupReservasiList]);

  const filteredReservations = useMemo(() => {
    let list = mergedReservations.filter((i) => {
      if (sessionFilter === "all") return true;
      return sessionFilter === "personal"
        ? i.kind === "personal"
        : i.kind === "group";
    });

    if (topicFilter !== "") {
      list = list.filter((i) => {
        const raw = i.raw;
        if (!raw) return false;
        if (raw.topicId && Number(raw.topicId) === Number(topicFilter))
          return true;
        if (
          raw.topic &&
          typeof raw.topic === "object" &&
          raw.topic.id &&
          Number(raw.topic.id) === Number(topicFilter)
        )
          return true;
        return false;
      });
    }
    if (counselorFilter !== "") {
      list = list.filter(
        (i) =>
          i.counselor && Number(i.counselor.id) === Number(counselorFilter),
      );
    }

    return list;
  }, [mergedReservations, sessionFilter, topicFilter, counselorFilter]);

  const totalFiltered = filteredReservations.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // reset page when filters or pageSize change
  useEffect(() => {
    setPage(1);
  }, [sessionFilter, pageSize, topicFilter, counselorFilter]);

  const paginatedReservations = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredReservations.slice(start, start + pageSize);
  }, [filteredReservations, page, pageSize]);

  const counselorOptions = useMemo(() => {
    const map = new Map<
      number,
      { id: number; username?: string; fullName?: string }
    >();
    mergedReservations.forEach((i) => {
      if (i.counselor && i.counselor.id) map.set(i.counselor.id, i.counselor);
    });
    return Array.from(map.values());
  }, [mergedReservations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-2">💙 Konseling BK</h3>
        <p className="text-pink-50">Layanan konseling profesional untuk mendukung kesehatan mental dan perkembangan siswa</p>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700">
            ✅ <strong>Berhasil:</strong> {successMessage}
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">
            ❌ <strong>Error:</strong> {errorMessage}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Layanan Konseling
          </h3>
          <p className="text-gray-600 mt-1">Pilih jenis konseling yang sesuai dengan kebutuhan Anda</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CounselingCard
            icon={Heart}
            title="Konseling Umum"
            description="Sesi one-on-one dengan konselor untuk membahas masalah umum, emosional, atau sosial"
            duration="45-60 menit"
            color="bg-pink-500"
            handleSubmitReservasi={handleSubmitReservasi}
          />
          {/* <CounselingCard
            icon={MessageCircle}
            title="Konseling Akademik"
            description="Bantuan untuk mengatasi kesulitan belajar, motivasi akademik, dan perencanaan studi"
            duration="30-45 menit"
            color="bg-blue-500"
            handleSubmitReservasi={handleSubmitReservasi}
          />
          <CounselingCard
            icon={Calendar}
            title="Konseling Karir"
            description="Bimbingan untuk eksplorasi minat, bakat, dan perencanaan karir masa depan"
            duration="60 menit"
            color="bg-purple-500"
            handleSubmitReservasi={handleSubmitReservasi}
          /> */}
          <CounselingCard
            icon={Users}
            title="Konseling Kelompok"
            description="Sesi berkelompok dipandu konselor untuk membahas topik bersama, berbagi pengalaman, dan saling mendukung." 
            duration="90 menit"
            color="bg-green-500"
            badge="Terbatas"
            handleSubmitReservasi={handleSubmitReservasiV2}
            useGroupModal={true}
          />
          {/* <CounselingCard
            icon={MessageSquare}
            title="Konseling Lainnya"
            description="Konsultasi untuk masalah sosial, keluarga, atau topik khusus lainnya"
            duration="Disesuaikan"
            color="bg-orange-500"
            handleSubmitReservasi={handleSubmitReservasi}
          /> */}
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 mb-1">
                Kerahasiaan Terjamin
              </p>
              <p className="text-sm text-green-700">
                Semua informasi dan percakapan Anda dengan konselor BK bersifat
                rahasia dan dilindungi sesuai dengan kebijakan privasi sekolah.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Daftar Reservasi */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Daftar Reservasi
              </h3>
              <p className="text-gray-600 mt-1">Daftar reservasi konseling Anda</p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => router.push("/home/siswa/reservasi")}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:opacity-90 transition-shadow duration-200 shadow-sm"
              >
                Lihat Semua
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600">Tipe:</label>
            <select
              value={sessionFilter}
              onChange={(e) => {
                setSessionFilter(e.target.value as any);
              }}
              className="px-3 py-1 border rounded w-full sm:w-auto"
            >
              <option value="all">Semua</option>
              <option value="personal">Konseling Pribadi</option>
              <option value="group">Konseling Kelompok</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600">Konselor:</label>
            <select
              value={counselorFilter}
              onChange={(e) => {
                setCounselorFilter(
                  e.target.value === "" ? "" : Number(e.target.value),
                );
                setPage(1);
              }}
              className="px-3 py-1 border rounded w-full sm:w-auto"
            >
              <option value="">Semua</option>
              {counselorOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName || c.username || `Konselor ${c.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600">Topik:</label>
            <select
              value={topicFilter}
              onChange={(e) => {
                setTopicFilter(
                  e.target.value === "" ? "" : Number(e.target.value),
                );
                setPage(1);
              }}
              className="px-3 py-1 border rounded w-full sm:w-auto"
            >
              <option value="">Semua Topik</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600">Per halaman:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
              className="px-3 py-1 border rounded w-full sm:w-auto"
            >
              {[5, 10, 15, 20, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {totalFiltered === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">Belum ada reservasi</p>
          </div>
        ) : (
          <div>
            <div className="space-y-3">
              {paginatedReservations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-10 h-10 ${item.kind === "personal" ? "bg-blue-100" : "bg-green-100"} rounded-lg flex items-center justify-center`}
                    >
                      {item.kind === "personal" ? (
                        <Heart className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Users className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">
                        {item.title}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {item.kind === "personal"
                          ? `${typeLabel[item.type as keyof typeof typeLabel] || "Sesi"} • ${item.counselor?.username || item.counselor?.fullName || "Konselor"}`
                          : `${typeLabel[item.type as keyof typeof typeLabel] || "Chat"} • ${item.members || 0} anggota`}{" "}
                        • {formatDate(item.dateTime.toISOString())} •{" "}
                        {item.preferredTime || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm sm:text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeColor(item.status)}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-600 break-words">
                Menampilkan {(page - 1) * pageSize + 1} -{" "}
                {Math.min(page * pageSize, totalFiltered)} dari {totalFiltered}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 text-sm w-full sm:w-auto"
                >
                  Prev
                </button>
                <div className="text-sm px-2">
                  {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 text-sm w-full sm:w-auto"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default KonselingPage;