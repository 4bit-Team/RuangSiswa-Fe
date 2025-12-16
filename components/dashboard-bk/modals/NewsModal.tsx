'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { X, Loader } from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load CKEditor to avoid window reference error during SSR
const CKEditorComponent = dynamic(
  async () => {
    const { CKEditor } = await import('@ckeditor/ckeditor5-react')
    const ClassicEditor = (await import('@ckeditor/ckeditor5-build-classic')).default
    
    return {
      default: ({ value, onChange }: { value: string; onChange: (data: string) => void }) => (
        <CKEditor
          editor={ClassicEditor}
          data={value}
          onChange={(_: any, editor: any) => onChange(editor.getData())}
          config={{
            toolbar: [
              'heading', '|',
              'bold', 'italic', 'link', 'bulletList', 'numberedList', 'blockQuote', '|',
              'insertTable', '|',
              'undo', 'redo'
            ],
            heading: {
              options: [
                { model: 'paragraph', title: 'Paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1' },
                { model: 'heading2', view: 'h2', title: 'Heading 2' },
                { model: 'heading3', view: 'h3', title: 'Heading 3' },
              ]
            },
            htmlSupport: {
              allow: [
                {
                  name: 'iframe',
                  attributes: {
                    allow: true,
                    allowfullscreen: true,
                    frameborder: true,
                    height: true,
                    src: true,
                    width: true,
                    style: true,
                  },
                },
              ],
            },
            htmlEmbed: {
              showPreviews: true,
            },
            paste: {
              preventDropFilesEditing: false,
              allowPasteFromOtherSources: true,
            },
          }}
        />
      )
    }
  },
  { ssr: false }
)

interface NewsModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: any
  mode?: 'create' | 'edit'
  loading?: boolean
  onImageUpload?: (file: File) => Promise<{ url: string }>
}

const NewsModal: React.FC<NewsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = 'create',
  loading = false,
  onImageUpload
}) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    categories: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    scheduledDate: '',
  })

  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const categories = [
    'Akademik',
    'Kesehatan Mental',
    'Karir',
    'Pengembangan Diri',
    'Sosial',
    'Pengumuman',
  ]

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          summary: initialData.summary || '',
          content: initialData.content || '',
          imageUrl: initialData.imageUrl || '',
          categories: initialData.categories || [],
          status: initialData.status || 'draft',
          scheduledDate: initialData.scheduledDate 
            ? new Date(initialData.scheduledDate).toISOString().slice(0, 16) 
            : '',
        })
      } else {
        setFormData({
          title: '',
          summary: '',
          content: '',
          imageUrl: '',
          categories: [],
          status: 'draft',
          scheduledDate: '',
        })
      }
    }
  }, [isOpen, initialData])

  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) return
    
    try {
      setUploading(true)
      const response = await onImageUpload(file)
      // Backend returns { url: string }
      const imageUrl = response?.url || ''
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl }))
      } else {
        console.error('No image URL in response', response)
      }
    } catch (err) {
      console.error('Failed to upload image', err)
    } finally {
      setUploading(false)
    }
  }

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Clean data - remove scheduledDate if not scheduled
      const cleanData = {
        ...formData,
        scheduledDate: formData.status === 'scheduled' ? formData.scheduledDate : undefined,
      }
      await onSubmit(cleanData)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-bold">{mode === 'create' ? 'Buat Berita' : 'Edit Berita'}</h2>
              <p className="text-blue-100 text-sm mt-1">Tambah atau ubah informasi berita</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content - Split Layout */}
          <div className="flex-1 overflow-y-auto flex gap-6 p-6">
            {/* Form Section */}
            <div className="flex-1 min-w-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Judul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Berita *
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan judul berita"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Ringkasan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ringkasan *
                  </label>
                  <textarea
                    placeholder="Masukkan ringkasan berita..."
                    rows={2}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Gambar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Berita
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                      className="flex-1"
                      disabled={uploading}
                    />
                    {uploading && <Loader size={20} className="animate-spin" />}
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-2 w-full h-32 rounded-lg overflow-hidden">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori * (Pilih minimal 1)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat)}
                          onChange={() => handleCategoryToggle(cat)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Konten */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konten Berita *
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-y-auto max-h-96 bg-gray-50">
                    <Suspense fallback={<div className="p-4 text-gray-500">Loading editor...</div>}>
                      <CKEditorComponent
                        value={formData.content}
                        onChange={(data: string) => setFormData({ ...formData, content: data })}
                      />
                    </Suspense>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={formData.status === 'draft'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Draft</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={formData.status === 'published'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Publish Sekarang</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="scheduled"
                        checked={formData.status === 'scheduled'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Jadwalkan</span>
                    </label>
                  </div>
                </div>

                {/* Scheduled Date */}
                {formData.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal & Waktu Publish
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || loading}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {submitting || loading ? (
                      <div className="flex items-center gap-2">
                        <Loader size={16} className="animate-spin" />
                        Menyimpan...
                      </div>
                    ) : (
                      'Simpan Berita'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div className="w-96 flex-shrink-0 border-l border-gray-200 pl-6 overflow-y-auto">
              <div className="sticky top-0 bg-white pb-4">
                <h3 className="font-bold text-gray-900 mb-4">Preview</h3>
              </div>

              {/* Preview Card - Like NewsDetailModal */}
              <div className="space-y-4">
                {/* Image */}
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt={formData.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                    <span className="text-sm font-semibold text-center px-4">Gambar Berita</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {formData.title || 'Judul Berita'}
                  </h2>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 py-3 border-y border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">👤</span>
                    <span>Bu Sarah Wijaya</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">📅</span>
                    <span>Hari ini</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {formData.categories.length > 0 ? (
                    formData.categories.map((cat) => (
                      <span key={cat} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">Pilih kategori</span>
                  )}
                </div>

                {/* Summary */}
                {formData.summary && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-gray-900 font-semibold mb-1 text-sm">Ringkasan</p>
                    <p className="text-gray-700 text-sm line-clamp-3">{formData.summary}</p>
                  </div>
                )}

                {/* Content Preview */}
                <div className="space-y-3">
                  <p className="font-semibold text-gray-900 text-sm">Konten:</p>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-72 overflow-y-auto">
                    <div 
                      className="text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none prose-table:border prose-table:border-gray-300 prose-tr:border prose-tr:border-gray-300 prose-td:border prose-td:border-gray-300 prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100"
                      dangerouslySetInnerHTML={{ 
                        __html: formData.content || '<p className="text-gray-400 italic">Konten berita akan ditampilkan di sini...</p>' 
                      }}
                    />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Status:</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-xs font-semibold ${
                    formData.status === 'published' ? 'bg-green-100 text-green-700' :
                    formData.status === 'scheduled' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {formData.status === 'published' ? '✓ Akan Dipublikasikan' : 
                     formData.status === 'scheduled' ? '⏰ Terjadwal' : '📝 Draft'}
                  </span>
                </div>

                {/* Scheduled Info */}
                {formData.status === 'scheduled' && formData.scheduledDate && (
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                    <p className="text-xs text-orange-700">
                      <strong>Jadwal Publish:</strong> {new Date(formData.scheduledDate).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NewsModal
