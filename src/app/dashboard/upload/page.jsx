'use client';
import { useState, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Upload, UserPlus, Loader2, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

const TABS = ['CSV Upload', 'Manual Entry', 'CRM Sync'];

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>
    <input
      {...props}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
    />
  </div>
);

export default function UploadPage() {
  const [tab,      setTab]      = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const fileRef = useRef(null);

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
      const { data } = await api.post('/reviews/upload-customers', fd);
      setResult(data);
      toast.success(`Imported ${data.added} customers`);
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
    <div className="w-full pb-10">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Upload Customers</h1>
          <p className="text-white/40">
            Import customer data to start sending review requests
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 w-fit">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                ${tab === i
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* CSV Upload */}
        {tab === 0 && (
          <div className="space-y-6">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 rounded-[32px] p-12 text-center cursor-pointer transition-all glass-dark"
            >
              {loading ? (
                <Loader2 size={40} className="animate-spin mx-auto mb-4 text-primary" />
              ) : (
                <FileSpreadsheet size={48} className="mx-auto mb-4 text-white/20" />
              )}
              <p className="text-xl font-bold mb-2 text-white">Drop your CSV here or click to browse</p>
              <p className="text-sm text-white/40">.csv or .xlsx — max 10 MB</p>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {['first_name', 'phone', 'email', 'service (optional)', 'visit_date (optional)'].map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-3 py-1 bg-white/5 text-white/60 rounded-full font-bold border border-white/10"
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
              <div className="glass-dark border border-white/10 rounded-[24px] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Import Results</h3>
                  <div className="flex gap-4 text-sm font-bold">
                    <span className="text-green-500 flex items-center gap-1.5 bg-green-500/10 px-3 py-1 rounded-lg">
                      <CheckCircle size={14} /> {result.added || result.imported} imported
                    </span>
                    <span className="text-yellow-500 flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1 rounded-lg">
                      <AlertCircle size={14} /> {result.duplicates} duplicates
                    </span>
                    <span className="text-red-500 flex items-center gap-1.5 bg-red-500/10 px-3 py-1 rounded-lg">
                      {result.invalid || 0} invalid
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Name', 'Phone', 'Email', 'Status'].map((h) => (
                          <th key={h} className="text-left pb-4 text-white/40 font-medium px-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(result.rows || []).slice(0, 10).map((r, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-all">
                          <td className="py-3 px-2 font-medium text-white">{r.firstName || r.name}</td>
                          <td className="py-3 px-2 text-white/60">{r.phone || '—'}</td>
                          <td className="py-3 px-2 text-white/60">{r.email || '—'}</td>
                          <td className="py-3 px-2">
                            <span className={`px-3 py-1 rounded-full font-bold text-[10px]
                              ${r._status === 'clean' || !r._status
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-yellow-500/10 text-yellow-500'}`}>
                              {r._status === 'clean' || !r._status ? '✓ Clean' : '⚠ Duplicate'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!result.rows || result.rows.length === 0) && (
                         <tr>
                           <td colSpan="4" className="py-8 text-center text-white/40">
                             Processed {result.total} rows. Check database for details.
                           </td>
                         </tr>
                      )}
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
            className="glass-dark border border-white/10 rounded-[32px] p-8 space-y-6"
          >
            <div className="grid grid-cols-2 gap-6">
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
            <div className="grid grid-cols-2 gap-6">
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
            <div className="grid grid-cols-2 gap-6">
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
              <label className="block text-sm font-medium text-white/60 mb-3">
                Preferred Channel
              </label>
              <div className="flex gap-3">
                {['WHATSAPP', 'EMAIL', 'SMS'].map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border
                      ${channel === ch
                        ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                        : 'bg-[#111] border-white/10 text-white/60 hover:text-white hover:border-white/30'}`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-60"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
                Add Customer & Schedule Request
              </button>
            </div>
          </form>
        )}

        {/* CRM Sync */}
        {tab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Salesforce', icon: 'S', color: 'text-blue-400',   bg: 'bg-blue-500/10',   connected: false },
              { name: 'HubSpot',    icon: 'H', color: 'text-orange-400', bg: 'bg-orange-500/10', connected: true  },
              { name: 'Zoho CRM',   icon: 'Z', color: 'text-green-400',  bg: 'bg-green-500/10',  connected: false },
            ].map(({ name, icon, color, bg, connected }) => (
              <div
                key={name}
                className="glass-dark border border-white/10 rounded-[32px] p-8 text-center hover:border-white/20 transition-all"
              >
                <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                  <span className={`text-3xl font-black ${color}`}>{icon}</span>
                </div>
                <div className="font-bold text-lg mb-2 text-white">{name}</div>
                {connected ? (
                  <>
                    <div className="text-xs font-bold text-green-400 mb-6 flex justify-center items-center gap-1.5 bg-green-500/10 w-fit mx-auto px-3 py-1 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      Connected
                    </div>
                    <button className="w-full py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 font-bold transition-all">
                      Sync Now
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-bold text-white/40 mb-6 px-3 py-1">Not connected</div>
                    <button className="w-full py-3 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-all">
                      Connect
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}