'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { translations, type Lang } from '@/lib/translations'

export default function Home() {
  const [lang, setLang] = useState<Lang>('en')
  const t = translations[lang]

  const [form, setForm] = useState({
    tenantName: '',
    unitAddress: '',
    issueTitle: '',
    issueDescription: '',
    location: '',
    severity: '',
  })
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).slice(0, 5)
      setFiles(selected)
    }
  }

  const uploadPhotos = async (): Promise<string[]> => {
    if (files.length === 0) return []
    const urls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `work-orders/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('work-order-photos').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('work-order-photos').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.tenantName || !form.unitAddress || !form.issueTitle || !form.issueDescription || !form.location || !form.severity) {
      setError(t.errorRequired)
      return
    }

    setSubmitting(true)
    try {
      const photoUrls = await uploadPhotos()
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photoUrls }),
      })
      if (!res.ok) throw new Error('Submit failed')
      setSubmitted(true)
    } catch {
      setError(t.errorSubmit)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t.successTitle}</h2>
          <p className="text-gray-500 mb-6">{t.successMessage}</p>
          <button
            onClick={() => { setSubmitted(false); setForm({ tenantName: '', unitAddress: '', issueTitle: '', issueDescription: '', location: '', severity: '' }); setFiles([]) }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            {t.submitAnother}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{t.title}</h1>
            <p className="text-blue-200 text-sm mt-0.5">{t.subtitle}</p>
          </div>
          <button
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            {t.switchLang}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto p-4 pb-12">
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">

          {/* Tenant Name */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.tenantName} *</label>
            <input
              type="text"
              placeholder={t.tenantNamePlaceholder}
              value={form.tenantName}
              onChange={e => setForm({ ...form, tenantName: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Unit Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.unitAddress} *</label>
            <input
              type="text"
              placeholder={t.unitAddressPlaceholder}
              value={form.unitAddress}
              onChange={e => setForm({ ...form, unitAddress: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Issue Title */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.issueTitle} *</label>
            <input
              type="text"
              placeholder={t.issueTitlePlaceholder}
              value={form.issueTitle}
              onChange={e => setForm({ ...form, issueTitle: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.location} *</label>
            <input
              type="text"
              placeholder={t.locationPlaceholder}
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Severity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">{t.severity} *</label>
            <div className="space-y-2">
              {(['low', 'medium', 'high', 'critical'] as const).map(level => {
                const label = t[`severity${level.charAt(0).toUpperCase() + level.slice(1)}` as keyof typeof t]
                const colors = {
                  low: 'border-green-200 bg-green-50 text-green-800',
                  medium: 'border-yellow-200 bg-yellow-50 text-yellow-800',
                  high: 'border-orange-200 bg-orange-50 text-orange-800',
                  critical: 'border-red-200 bg-red-50 text-red-800',
                }
                const selected = form.severity === level
                return (
                  <label key={level} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selected ? colors[level] + ' border-current' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input
                      type="radio"
                      name="severity"
                      value={level}
                      checked={selected}
                      onChange={e => setForm({ ...form, severity: e.target.value })}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.issueDescription} *</label>
            <textarea
              placeholder={t.issueDescriptionPlaceholder}
              value={form.issueDescription}
              onChange={e => setForm({ ...form, issueDescription: e.target.value })}
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.photos}</label>
            <p className="text-xs text-gray-400 mb-3">{t.photosHelp}</p>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
              <span className="text-2xl mb-1">📷</span>
              <span className="text-sm text-gray-500">{files.length > 0 ? `${files.length} photo${files.length > 1 ? 's' : ''} selected` : 'Tap to add photos'}</span>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" />
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? t.submitting : t.submit}
          </button>
        </form>
      </div>
    </div>
  )
}
