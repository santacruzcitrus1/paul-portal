'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface WorkOrder {
  id: string
  created_at: string
  tenant_name: string
  unit_address: string
  issue_title: string
  issue_description: string
  location_in_property: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved'
  photo_urls: string[]
  notes: string
}

interface Recipient {
  id: string
  name: string
  email: string
  phone: string
  active: boolean
}

const severityConfig = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800', dot: 'bg-green-500', emoji: '🟢' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500', emoji: '🟡' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', emoji: '🟠' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800', dot: 'bg-red-500', emoji: '🔴' },
}

const statusConfig = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  resolved: { label: 'Resolved', color: 'bg-gray-100 text-gray-600' },
}

export default function Dashboard() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [selected, setSelected] = useState<WorkOrder | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'tickets' | 'notifications'>('tickets')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [newRecipient, setNewRecipient] = useState({ name: '', email: '', phone: '' })
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === (process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || 'Paul2026!')) {
      setAuthed(true)
      sessionStorage.setItem('portal-auth', '1')
      loadData()
    } else {
      setAuthError('Incorrect password')
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('portal-auth')) {
      setAuthed(true)
      loadData()
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: wo } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false })
    const { data: rec } = await supabase.from('notification_recipients').select('*').order('created_at', { ascending: true })
    if (wo) setOrders(wo)
    if (rec) setRecipients(rec)
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('work_orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as WorkOrder['status'] } : o))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as WorkOrder['status'] } : null)
  }

  const saveNotes = async () => {
    if (!selected) return
    setSavingNotes(true)
    await supabase.from('work_orders').update({ notes }).eq('id', selected.id)
    setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, notes } : o))
    setSelected(prev => prev ? { ...prev, notes } : null)
    setSavingNotes(false)
  }

  const addRecipient = async () => {
    if (!newRecipient.name || !newRecipient.email) return
    const { data } = await supabase.from('notification_recipients').insert({ ...newRecipient, active: true }).select().single()
    if (data) {
      setRecipients(prev => [...prev, data])
      setNewRecipient({ name: '', email: '', phone: '' })
    }
  }

  const toggleRecipient = async (id: string, active: boolean) => {
    await supabase.from('notification_recipients').update({ active }).eq('id', id)
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, active } : r))
  }

  const removeRecipient = async (id: string) => {
    await supabase.from('notification_recipients').delete().eq('id', id)
    setRecipients(prev => prev.filter(r => r.id !== id))
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const stats = {
    open: orders.filter(o => o.status === 'open').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    resolved: orders.filter(o => o.status === 'resolved').length,
    critical: orders.filter(o => o.severity === 'critical' && o.status !== 'resolved').length,
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🏠</div>
            <h1 className="text-2xl font-bold text-gray-900">Property Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Owner Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Property Portal</h1>
            <p className="text-blue-200 text-sm">Owner Dashboard</p>
          </div>
          <button onClick={() => { sessionStorage.removeItem('portal-auth'); setAuthed(false) }} className="text-blue-200 hover:text-white text-sm">
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Open', value: stats.open, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'In Progress', value: stats.in_progress, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Resolved', value: stats.resolved, color: 'text-gray-600', bg: 'bg-gray-100' },
            { label: 'Critical', value: stats.critical, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-4`}>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border border-gray-100 w-fit shadow-sm">
          <button onClick={() => setTab('tickets')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'tickets' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Work Orders
          </button>
          <button onClick={() => setTab('notifications')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'notifications' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Notifications
          </button>
        </div>

        {tab === 'tickets' && (
          <div className="flex gap-4">
            {/* List */}
            <div className="flex-1 min-w-0">
              {/* Filter */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">No work orders</div>
              ) : (
                <div className="space-y-2">
                  {filtered.map(order => (
                    <div
                      key={order.id}
                      onClick={() => { setSelected(order); setNotes(order.notes || '') }}
                      className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-sm ${selected?.id === order.id ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-100'}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">{severityConfig[order.severity]?.emoji}</span>
                          <span className="font-semibold text-gray-900 truncate">{order.issue_title}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusConfig[order.status]?.color}`}>
                          {statusConfig[order.status]?.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{order.unit_address}</p>
                      <p className="text-xs text-gray-400 mt-1">{order.tenant_name} · {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detail Panel */}
            {selected && (
              <div className="w-96 shrink-0 hidden md:block">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-4">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">{selected.issue_title}</h2>
                    <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                  </div>

                  <div className="space-y-3 text-sm mb-4">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityConfig[selected.severity]?.color}`}>
                        {severityConfig[selected.severity]?.emoji} {severityConfig[selected.severity]?.label}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[selected.status]?.color}`}>
                        {statusConfig[selected.status]?.label}
                      </span>
                    </div>
                    <div><span className="text-gray-400">Tenant:</span> <span className="font-medium">{selected.tenant_name}</span></div>
                    <div><span className="text-gray-400">Property:</span> <span className="font-medium">{selected.unit_address}</span></div>
                    <div><span className="text-gray-400">Location:</span> {selected.location_in_property}</div>
                    <div><span className="text-gray-400">Submitted:</span> {new Date(selected.created_at).toLocaleString()}</div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Description</p>
                    <p className="text-sm text-gray-700">{selected.issue_description}</p>
                  </div>

                  {selected.photo_urls?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Photos</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selected.photo_urls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt="" className="rounded-xl w-full h-24 object-cover hover:opacity-90 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Update Status</p>
                    <div className="flex gap-2 flex-wrap">
                      {(['open', 'in_progress', 'resolved'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selected.id, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selected.status === s ? statusConfig[s].color + ' ring-1 ring-current' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {statusConfig[s].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Notes</p>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Add notes about this work order..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button onClick={saveNotes} disabled={savingNotes} className="mt-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
                      {savingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'notifications' && (
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <h3 className="font-semibold text-gray-900 mb-4">Notification Recipients</h3>
              <p className="text-sm text-gray-500 mb-4">These people get an email (and SMS if phone provided) every time a work order is submitted.</p>

              <div className="space-y-3 mb-5">
                {recipients.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-400 truncate">{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={r.active} onChange={e => toggleRecipient(r.id, e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                      <span className="text-xs text-gray-500">Active</span>
                    </label>
                    <button onClick={() => removeRecipient(r.id)} className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                  </div>
                ))}
                {recipients.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No recipients yet</p>}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Add Recipient</p>
                <div className="space-y-2">
                  <input type="text" placeholder="Name" value={newRecipient.name} onChange={e => setNewRecipient({ ...newRecipient, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="email" placeholder="Email address" value={newRecipient.email} onChange={e => setNewRecipient({ ...newRecipient, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="tel" placeholder="Phone (optional, for SMS)" value={newRecipient.phone} onChange={e => setNewRecipient({ ...newRecipient, phone: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={addRecipient} className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                    Add Recipient
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
