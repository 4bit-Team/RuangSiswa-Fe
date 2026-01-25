'use client'

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Loader, Video, Users, BookOpen, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/api';

interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface ScheduleData {
  sessionType: 'tatap-muka' | 'chat';
  daySchedules: DaySchedule[];
  isActive: boolean;
}

interface Jurusan {
  id: number;
  nama: string;
  kode: string;
}

interface BkJurusan {
  id: number;
  jurusanId: number;
  jurusan: Jurusan;
}

const PengaturanPage: React.FC = () => {
  const { user, token, loading } = useAuth();
  const [selectedSessionType, setSelectedSessionType] = useState<'tatap-muka' | 'chat'>('tatap-muka');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  
  // Schedule states
  const [schedules, setSchedules] = useState<Record<'tatap-muka' | 'chat', ScheduleData>>({
    'tatap-muka': { 
      sessionType: 'tatap-muka', 
      daySchedules: [
        { day: 'Monday', startTime: '08:00', endTime: '16:00', isActive: true },
        { day: 'Tuesday', startTime: '08:00', endTime: '16:00', isActive: true },
        { day: 'Wednesday', startTime: '08:00', endTime: '16:00', isActive: true },
        { day: 'Thursday', startTime: '08:00', endTime: '16:00', isActive: true },
        { day: 'Friday', startTime: '08:00', endTime: '16:00', isActive: true },
      ], 
      isActive: true 
    },
    'chat': { 
      sessionType: 'chat', 
      daySchedules: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isActive: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isActive: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isActive: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', isActive: true },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', isActive: true },
      ], 
      isActive: true 
    },
  });

  // Jurusan states
  const [allJurusan, setAllJurusan] = useState<Jurusan[]>([]);
  const [assignedJurusan, setAssignedJurusan] = useState<BkJurusan[]>([]);
  const [showAddJurusanModal, setShowAddJurusanModal] = useState(false);
  const [selectedJurusanToAdd, setSelectedJurusanToAdd] = useState<number | null>(null);

  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [isLoadingJurusan, setIsLoadingJurusan] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingJurusan, setIsAddingJurusan] = useState(false);
  const [isRemovingJurusan, setIsRemovingJurusan] = useState<number | null>(null);
  const [hasSchedules, setHasSchedules] = useState<Record<'tatap-muka' | 'chat', boolean>>({ 'tatap-muka': false, 'chat': false });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const daysDisplay = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  // Load data on mount
  useEffect(() => {
    if (!loading && user && token) {
      loadSchedules();
      loadJurusan();
    }
  }, [loading, user, token]);

  // Load all jurusan from database
  const loadJurusan = async () => {
    try {
      setIsLoadingJurusan(true);
      const response = await apiRequest('/jurusan', 'GET', undefined, token);
      if (Array.isArray(response)) {
        setAllJurusan(response);
      }
      // Load assigned jurusan for this BK
      await loadAssignedJurusan();
    } catch (error) {
      console.error('Error loading jurusan:', error);
      setMessage({ type: 'error', text: 'Gagal memuat data jurusan' });
    } finally {
      setIsLoadingJurusan(false);
    }
  };

  // Load jurusan assigned to current BK
  const loadAssignedJurusan = async () => {
    try {
      const response = await apiRequest('/bk-jurusan/my-jurusan', 'GET', undefined, token);
      if (Array.isArray(response)) {
        setAssignedJurusan(response);
      }
    } catch (error) {
      console.error('Error loading assigned jurusan:', error);
      setAssignedJurusan([]);
    }
  };

  const loadSchedules = async () => {
    try {
      setIsLoadingSchedule(true);
      const response = await apiRequest('/bk-schedule/my-schedules', 'GET', undefined, token);
      
      if (Array.isArray(response)) {
        const updatedSchedules = { ...schedules };
        const updatedHasSchedules = { ...hasSchedules };
        
        response.forEach((schedule: ScheduleData) => {
          updatedSchedules[schedule.sessionType] = schedule;
          updatedHasSchedules[schedule.sessionType] = true;
        });
        
        setSchedules(updatedSchedules);
        setHasSchedules(updatedHasSchedules);
      }
    } catch (error) {
      console.log('No existing schedules found, using defaults');
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const currentSchedule = schedules[selectedSessionType];
  const currentDaySchedule = currentSchedule.daySchedules.find(ds => ds.day === selectedDay);

  // Get available jurusan (not yet assigned)
  const availableJurusan = allJurusan.filter(
    j => !assignedJurusan.some(aj => aj.jurusanId === j.id)
  );

  const handleDayToggle = (day: string) => {
    setSchedules((prev: any) => ({
      ...prev,
      [selectedSessionType]: {
        ...prev[selectedSessionType],
        daySchedules: prev[selectedSessionType].daySchedules.map((ds: DaySchedule) =>
          ds.day === day ? { ...ds, isActive: !ds.isActive } : ds
        ),
      },
    }));
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user) {
      setMessage({ type: 'error', text: 'Autentikasi gagal. Silakan login kembali.' });
      return;
    }

    const activeDays = currentSchedule.daySchedules.filter(ds => ds.isActive);
    if (activeDays.length === 0) {
      setMessage({ type: 'error', text: 'Pilih minimal satu hari yang tersedia.' });
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        sessionType: selectedSessionType,
        daySchedules: activeDays,
      };

      if (hasSchedules[selectedSessionType]) {
        await apiRequest(`/bk-schedule/${selectedSessionType}`, 'PUT', payload, token);
      } else {
        await apiRequest(`/bk-schedule/${selectedSessionType}`, 'POST', payload, token);
        setHasSchedules((prev: any) => ({ ...prev, [selectedSessionType]: true }));
      }

      setMessage({ type: 'success', text: `Jadwal ${selectedSessionType === 'tatap-muka' ? 'Tatap Muka' : 'Chat'} berhasil disimpan!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Gagal menyimpan jadwal. Coba lagi.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    if (!currentDaySchedule) return;
    setSchedules((prev: any) => ({
      ...prev,
      [selectedSessionType]: {
        ...prev[selectedSessionType],
        daySchedules: prev[selectedSessionType].daySchedules.map((ds: DaySchedule) =>
          ds.day === selectedDay
            ? { ...ds, [field]: value }
            : ds
        ),
      },
    }));
  };

  // Handle adding a jurusan
  const handleAddJurusan = async () => {
    if (!selectedJurusanToAdd || !token) return;

    try {
      setIsAddingJurusan(true);
      await apiRequest(`/bk-jurusan/add/${selectedJurusanToAdd}`, 'POST', {}, token);
      
      setMessage({ type: 'success', text: 'Jurusan berhasil ditambahkan!' });
      setShowAddJurusanModal(false);
      setSelectedJurusanToAdd(null);
      
      // Reload assigned jurusan
      await loadAssignedJurusan();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Gagal menambahkan jurusan. Coba lagi.',
      });
    } finally {
      setIsAddingJurusan(false);
    }
  };

  // Handle removing a jurusan
  const handleRemoveJurusan = async (jurusanId: number) => {
    if (!token) return;

    try {
      setIsRemovingJurusan(jurusanId);
      await apiRequest(`/bk-jurusan/remove/${jurusanId}`, 'DELETE', undefined, token);
      
      setMessage({ type: 'success', text: 'Jurusan berhasil dihapus!' });
      
      // Reload assigned jurusan
      await loadAssignedJurusan();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Gagal menghapus jurusan. Coba lagi.',
      });
    } finally {
      setIsRemovingJurusan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pengaturan BK</h2>
        <p className="text-sm text-gray-600">Kelola jadwal kerja dan daftar jurusan yang Anda tangani</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Jurusan Management Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="text-purple-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Daftar Jurusan</h3>
              <p className="text-sm text-gray-600">Jurusan yang Anda tangani</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddJurusanModal(true)}
            disabled={availableJurusan.length === 0}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus size={18} />
            <span>Tambah Jurusan</span>
          </button>
        </div>

        {isLoadingJurusan ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin text-purple-600" size={30} />
          </div>
        ) : assignedJurusan.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-2">Belum ada jurusan yang ditambahkan</p>
            <p className="text-sm text-gray-500">Klik tombol "Tambah Jurusan" untuk menambahkan jurusan yang Anda tangani</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedJurusan.map((bkJurusan) => (
              <div
                key={bkJurusan.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{bkJurusan.jurusan.nama}</h4>
                  <p className="text-sm text-gray-500">Kode: {bkJurusan.jurusan.kode}</p>
                </div>
                <button
                  onClick={() => handleRemoveJurusan(bkJurusan.jurusanId)}
                  disabled={isRemovingJurusan === bkJurusan.jurusanId}
                  className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Hapus jurusan"
                >
                  {isRemovingJurusan === bkJurusan.jurusanId ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {availableJurusan.length === 0 && assignedJurusan.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              ✓ Semua jurusan telah ditambahkan
            </p>
          </div>
        )}
      </div>

      {/* Session Type Tabs */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Tipe Sesi</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedSessionType('tatap-muka')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
              selectedSessionType === 'tatap-muka'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Users className={`w-6 h-6 ${selectedSessionType === 'tatap-muka' ? 'text-blue-600' : 'text-gray-400'}`} />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Tatap Muka</p>
              <p className="text-xs text-gray-600">Konseling offline</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedSessionType('chat')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
              selectedSessionType === 'chat'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Video className={`w-6 h-6 ${selectedSessionType === 'chat' ? 'text-blue-600' : 'text-gray-400'}`} />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Sesi Chat</p>
              <p className="text-xs text-gray-600">Konseling online</p>
            </div>
          </button>
        </div>
      </div>

      {/* Schedule Form */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="text-blue-600" size={20} />
          Jadwal {selectedSessionType === 'tatap-muka' ? 'Tatap Muka' : 'Chat'}
        </h3>

        {isLoadingSchedule ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin text-blue-600" size={30} />
          </div>
        ) : (
          <form onSubmit={handleSaveSchedule}>
            {/* Day Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Hari</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {days.map((day, idx) => {
                  const daySchedule = currentSchedule.daySchedules.find(ds => ds.day === day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        selectedDay === day
                          ? 'border-blue-600 bg-blue-50'
                          : daySchedule?.isActive
                          ? 'border-green-400 bg-green-50 hover:border-blue-600'
                          : 'border-gray-300 bg-gray-50 hover:border-blue-600'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">{daysDisplay[idx]}</p>
                      {daySchedule?.isActive && (
                        <p className="text-xs text-green-700">{daySchedule.startTime} - {daySchedule.endTime}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Inputs for Selected Day */}
            {currentDaySchedule && (
              <>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Jadwal untuk {daysDisplay[days.indexOf(selectedDay)]}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai</label>
                      <input
                        type="time"
                        value={currentDaySchedule.startTime}
                        onChange={(e) => handleTimeChange('startTime', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai</label>
                      <input
                        type="time"
                        value={currentDaySchedule.endTime}
                        onChange={(e) => handleTimeChange('endTime', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentDaySchedule.isActive}
                      onChange={() => handleDayToggle(selectedDay)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Hari ini tersedia untuk konseling
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* All Days Overview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Daftar Hari Kerja</label>
              <div className="space-y-2">
                {currentSchedule.daySchedules.map((daySchedule) => (
                  <div
                    key={daySchedule.day}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      daySchedule.isActive
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {daysDisplay[days.indexOf(daySchedule.day)]}
                      </p>
                      {daySchedule.isActive && (
                        <p className="text-sm text-gray-600">
                          {daySchedule.startTime} - {daySchedule.endTime}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        daySchedule.isActive
                          ? 'bg-green-200 text-green-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {daySchedule.isActive ? '✓ Aktif' : '✗ Nonaktif'}
                    </span>
                  </div>
                ))}
              </div>

              {currentSchedule.daySchedules.filter(ds => ds.isActive).length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ Pilih minimal satu hari yang tersedia
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => loadSchedules()}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    {hasSchedules[selectedSessionType] ? 'Memperbarui...' : 'Menyimpan...'}
                  </>
                ) : (
                  hasSchedules[selectedSessionType] ? 'Perbarui Jadwal' : 'Simpan Jadwal'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Help */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Info:</strong> Setiap tipe sesi dapat memiliki jadwal kerja yang berbeda. Atur jadwal untuk masing-masing tipe sesi sesuai kebutuhan Anda.
          </p>
        </div>
      </div>

      {/* All Schedules Overview */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Semua Jadwal</h3>
        <div className="space-y-3">
          {(['tatap-muka', 'chat'] as const).map((type) => (
            <div key={type} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {type === 'tatap-muka' ? (
                  <Users className="w-5 h-5 text-blue-600" />
                ) : (
                  <Video className="w-5 h-5 text-purple-600" />
                )}
                <h4 className="font-semibold text-gray-900">
                  {type === 'tatap-muka' ? 'Tatap Muka' : 'Sesi Chat'}
                </h4>
                <span
                  className={`ml-auto text-xs px-2 py-1 rounded-full ${
                    hasSchedules[type]
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {hasSchedules[type] ? '✓ Terjadwal' : 'Belum diatur'}
                </span>
              </div>
              {hasSchedules[type] && (
                <p className="text-sm text-gray-600">
                  {schedules[type].daySchedules.filter(ds => ds.isActive).length > 0
                    ? `${schedules[type].daySchedules.find(ds => ds.isActive)?.startTime} - ${schedules[type].daySchedules.find(ds => ds.isActive)?.endTime} (${schedules[type].daySchedules.filter(ds => ds.isActive).length} hari aktif)`
                    : 'Tidak ada hari yang diatur'
                  }
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Jurusan Modal */}
      {showAddJurusanModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setShowAddJurusanModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold">Tambah Jurusan</h2>
                  <p className="text-purple-100 text-sm mt-1">Pilih jurusan yang ingin Anda tangani</p>
                </div>
                <button
                  onClick={() => setShowAddJurusanModal(false)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {availableJurusan.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">Semua jurusan telah ditambahkan</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {availableJurusan.map((jurusan) => (
                        <label
                          key={jurusan.id}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedJurusanToAdd === jurusan.id
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="jurusan"
                            value={jurusan.id}
                            checked={selectedJurusanToAdd === jurusan.id}
                            onChange={() => setSelectedJurusanToAdd(jurusan.id)}
                            className="w-5 h-5 text-purple-600"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{jurusan.nama}</p>
                            <p className="text-sm text-gray-500">Kode: {jurusan.kode}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowAddJurusanModal(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleAddJurusan}
                        disabled={selectedJurusanToAdd === null || isAddingJurusan}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2"
                      >
                        {isAddingJurusan ? (
                          <>
                            <Loader className="animate-spin" size={16} />
                            Menambahkan...
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            Tambah
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PengaturanPage;