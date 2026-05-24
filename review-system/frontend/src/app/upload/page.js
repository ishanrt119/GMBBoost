 'use client';
import { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Upload, UserPlus, Loader2, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

const TABS = ['CSV Upload', 'Manual Entry', 'CRM Sync'];

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
    <input
      {...props}
      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
    />
  </div>
);

export default function UploadPage() {
  const [tab,      setTab]      = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const fileRef = useRef();

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [service,   setService]   = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [channel,   setChannel]   = useState('WHATSAPP');

  const handleCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/customers/upload', fd);
      setResult(data);
      toast.success(`Imported ${data.imported} customers`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  const handleManual = async (e) => {
    e.preventDefault();
    if (!phone && !email) return toast.error('Phone or email required');
    setLoading(true);
    try {
      await api.post('/customers', {
        firstName, lastName, phone, email, service, visitDate, channel
      });
      toast.success('Customer added!');
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setService('');
      setVisitDate('');
      setChannel('WHATSAPP');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    } finally { setLoading(false); }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Upload Customers</h1>
          <p className="text-gray-500 text-sm mt-1">
            Import customer data to start sending review requests
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition
                ${tab === i
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* CSV Upload */}
        {tab === 0 && (
          <div className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl p-10 text-center cursor-pointer transition"
            >
              {loading ? (
                <Loader2 size={32} className="animate-spin mx-auto mb-3 text-blue-600" />
              ) : (
                <FileSpreadsheet size={36} className="mx-auto mb-3 text-gray-400" />
              )}
              <p className="font-semibold mb-1 text-gray-700">Drop your CSV here or click to browse</p>
              <p className="text-sm text-gray-400">.csv or .xlsx — max 10 MB</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {['first_name', 'phone', 'email', 'service (optional)', 'visit_date (optional)'].map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium border border-blue-100"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={handleCSV}
              />
            </div>

            {result && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Import Results</h3>
                  <div className="flex gap-3 text-sm">
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle size={14} /> {result.imported} imported
                    </span>
                    <span className="text-yellow-600 flex items-center gap-1">
                      <AlertCircle size={14} /> {result.duplicates} duplicates
                    </span>
                    <span className="text-red-500">{result.invalid} invalid</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Name', 'Phone', 'Email', 'Status'].map((h) => (
                          <th key={h} className="text-left pb-2 text-gray-500 font-medium pr-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.slice(0, 10).map((r, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2 pr-3 font-medium text-gray-800">{r.firstName}</td>
                          <td className="py-2 pr-3 text-gray-500">{r.phone || '—'}</td>
                          <td className="py-2 pr-3 text-gray-500">{r.email || '—'}</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px]
                              ${r._status === 'clean'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'}`}>
                              {r._status === 'clean' ? '✓ Clean' : '⚠ Duplicate'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Entry */}
        {tab === 1 && (
          <form
            onSubmit={handleManual}
            className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name *"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Priya"
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 00000"
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Hair Cut, Massage..."
              />
              <Input
                label="Visit Date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Preferred Channel
              </label>
              <div className="flex gap-2">
                {['WHATSAPP', 'EMAIL', 'SMS'].map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition
                      ${channel === ch
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              Add Customer & Schedule Request
            </button>
          </form>
        )}

        {/* CRM Sync */}
        {tab === 2 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Salesforce', color: 'text-blue-600',   bg: 'bg-blue-50',   connected: false },
              { name: 'HubSpot',    color: 'text-orange-600', bg: 'bg-orange-50', connected: true  },
              { name: 'Zoho CRM',   color: 'text-green-600',  bg: 'bg-green-50',  connected: false },
            ].map(({ name, color, bg, connected }) => (
              <div
                key={name}
                className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm"
              >
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <span className={`text-2xl font-black ${color}`}>{name[0]}</span>
                </div>
                <div className="font-semibold text-sm mb-1 text-gray-800">{name}</div>
                {connected ? (
                  <>
                    <div className="text-[11px] text-green-600 mb-3">● Connected</div>
                    <button className="w-full py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition">
                      Sync Now
                    </button>
                  </>
                ) : (
                  <button className="w-full mt-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition">
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}