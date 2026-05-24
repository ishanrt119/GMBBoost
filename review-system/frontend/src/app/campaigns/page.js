 'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Play, Pause, Loader2, Megaphone, Trash2 } from 'lucide-react';

const STATUS_STYLES = {
  DRAFT:     'bg-gray-100 text-gray-600',
  ACTIVE:    'bg-green-100 text-green-700',
  PAUSED:    'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
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
    <AppLayout>
      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Campaigns</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage and launch review request campaigns
            </p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Plus size={16} /> New Campaign
          </button>
        </div>

        {/* Create form */}
        {showNew && (
          <div className="bg-white border border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Megaphone size={16} /> New Campaign
            </h3>
            <form onSubmit={createCampaign} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Campaign Name *
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Diwali 2024 — Salon"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-500">
                    Select Customers ({customerIds.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {customerIds.length === customers.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-1">
                  {customers.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={customerIds.includes(c.id)}
                        onChange={() => toggleCustomer(c.id)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        {c.firstName} {c.lastName || ''}
                      </span>
                      <span className="text-xs text-gray-400">
                        {c.phone || c.email}
                      </span>
                    </label>
                  ))}
                  {!customers.length && (
                    <p className="text-xs text-gray-400 p-2">
                      No customers yet — upload first
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Create Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition"
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
            <Loader2 size={24} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Campaign', 'Channel', 'Customers', 'Sent', 'Clicked', 'Reviews', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs text-gray-500 font-medium"
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
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.channel}</td>
                    <td className="px-4 py-3 text-gray-700">{c.stats.total}</td>
                    <td className="px-4 py-3 text-blue-600 font-medium">{c.stats.sent}</td>
                    <td className="px-4 py-3 text-purple-600 font-medium">{c.stats.clicked}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{c.stats.reviewed}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {c.status !== 'ACTIVE' && c.status !== 'COMPLETED' && (
                          <button
                            onClick={() => launch(c.id)}
                            disabled={launching === c.id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs transition"
                          >
                            {launching === c.id
                              ? <Loader2 size={11} className="animate-spin" />
                              : <Play size={11} />}
                            Launch
                          </button>
                        )}
                        {c.status === 'ACTIVE' && (
                          <button
                            onClick={() => pause(c.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg text-xs transition"
                          >
                            <Pause size={11} /> Pause
                          </button>
                        )}
                        <button
                          onClick={() => deleteCampaign(c.id, c.name)}
                          disabled={deleting === c.id}
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs transition"
                        >
                          {deleting === c.id
                            ? <Loader2 size={11} className="animate-spin" />
                            : <Trash2 size={11} />}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!campaigns.length && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No campaigns yet — create one above
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}