'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Play, Pause, Loader2, Megaphone, Trash2 } from 'lucide-react';

const STATUS_STYLES = {
  DRAFT:     'bg-white/10 text-white/60',
  ACTIVE:    'bg-green-500/10 text-green-500',
  PAUSED:    'bg-yellow-500/10 text-yellow-500',
  COMPLETED: 'bg-primary/20 text-primary',
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [launching, setLaunching] = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [showNew,   setShowNew]   = useState(false);
  const [name,      setName]      = useState('');
  const [channel,   setChannel]   = useState('WHATSAPP');
  const [customerIds, setCustomerIds] = useState([]);

  const load = async () => {
    try {
      const [c, cu] = await Promise.all([
        api.get('/campaigns'),
        api.get('/customers?limit=200')
      ]);
      setCampaigns(c.data.campaigns);
      setCustomers(cu.data.customers);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createCampaign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', { name, channel, customerIds });
      toast.success('Campaign created!');
      setShowNew(false);
      setName('');
      setChannel('WHATSAPP');
      setCustomerIds([]);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const launch = async (id) => {
    setLaunching(id);
    try {
      const { data } = await api.post(`/campaigns/${id}/launch`);
      toast.success(`${data.message} — ${data.sent} sent`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Launch failed');
    } finally { setLaunching(null); }
  };

  const pause = async (id) => {
    try {
      await api.patch(`/campaigns/${id}/pause`);
      toast.success('Campaign paused');
      load();
    } catch (err) {
      toast.error('Failed to pause');
    }
  };

  const deleteCampaign = async (id, campaignName) => {
    const confirm = window.confirm(`Are you sure you want to delete "${campaignName}"?`);
    if (!confirm) return;
    setDeleting(id);
    try {
      await api.delete(`/campaigns/${id}`);
      toast.success('Campaign deleted!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally { setDeleting(null); }
  };

  const toggleCustomer = (id) => {
    setCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (customerIds.length === customers.length) {
      setCustomerIds([]);
    } else {
      setCustomerIds(customers.map((c) => c.id));
    }
  };

  return (
    <div className="w-full pb-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">Campaigns</h1>
            <p className="text-white/40">
              Manage and launch review request campaigns
            </p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            <Plus size={16} /> New Campaign
          </button>
        </div>

        {/* Create form */}
        {showNew && (
          <div className="glass-dark rounded-[24px] border border-white/10 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Megaphone size={20} className="text-primary" /> New Campaign
            </h3>
            <form onSubmit={createCampaign} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Diwali 2024 — Salon"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white/60">
                    Select Customers ({customerIds.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-sm text-primary font-bold hover:underline"
                  >
                    {customerIds.length === customers.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                  {customers.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={customerIds.includes(c.id)}
                        onChange={() => toggleCustomer(c.id)}
                        className="accent-primary w-4 h-4"
                      />
                      <span className="text-sm font-medium text-white">
                        {c.firstName} {c.lastName || ''}
                      </span>
                      <span className="text-xs text-white/40">
                        {c.phone || c.email}
                      </span>
                    </label>
                  ))}
                  {!customers.length && (
                    <p className="text-sm text-white/40 p-4 text-center">
                      No customers yet — please upload first.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  Create Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="glass-dark border border-white/10 rounded-[24px] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {['Campaign', 'Channel', 'Customers', 'Sent', 'Clicked', 'Reviews', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-xs text-white/60 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                    <td className="px-6 py-4 text-white/60 text-xs">{c.channel}</td>
                    <td className="px-6 py-4 text-white/80">{c.stats.total}</td>
                    <td className="px-6 py-4 text-primary font-bold">{c.stats.sent}</td>
                    <td className="px-6 py-4 text-purple-400 font-bold">{c.stats.clicked}</td>
                    <td className="px-6 py-4 text-green-400 font-bold">{c.stats.reviewed}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${STATUS_STYLES[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {c.status !== 'ACTIVE' && c.status !== 'COMPLETED' && (
                           <button
                             onClick={() => launch(c.id)}
                             disabled={launching === c.id}
                             className="flex items-center justify-center w-8 h-8 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition"
                             title="Launch Campaign"
                           >
                             {launching === c.id
                               ? <Loader2 size={14} className="animate-spin" />
                               : <Play size={14} className="ml-0.5" />}
                           </button>
                        )}
                        {c.status === 'ACTIVE' && (
                           <button
                             onClick={() => pause(c.id)}
                             className="flex items-center justify-center w-8 h-8 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg transition"
                             title="Pause Campaign"
                           >
                             <Pause size={14} />
                           </button>
                        )}
                        <button
                          onClick={() => deleteCampaign(c.id, c.name)}
                          disabled={deleting === c.id}
                          className="flex items-center justify-center w-8 h-8 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition"
                          title="Delete Campaign"
                        >
                          {deleting === c.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!campaigns.length && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-white/40 text-sm">
                      No campaigns yet — create one above
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}