 'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Sparkles, Copy, Loader2, RefreshCw, Zap } from 'lucide-react';

export default function AIPage() {
  const [service,      setService]      = useState('');
  const [businessName, setBusinessName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [rating,       setRating]       = useState(5);
  const [suggestions,  setSuggestions]  = useState([]);
  const [message,      setMessage]      = useState('');
  const [model,        setModel]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [msgLoading,   setMsgLoading]   = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/suggestions', {
        service, businessName, customerName, rating
      });
      setSuggestions(data.suggestions);
      setModel(data.model);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed — check your GROQ_API_KEY in backend/.env');
    } finally { setLoading(false); }
  };

  const personalise = async () => {
    setMsgLoading(true);
    try {
      const { data } = await api.post('/ai/personalize-message', {
        customerName, service, businessName, channel: 'whatsapp'
      });
      setMessage(data.message);
      setModel(data.model);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setMsgLoading(false); }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-800">AI Review Suggestions</h1>
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full border border-orange-200">
            <Zap size={10} /> Groq LLaMA 3.3
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-5">
          Generate editable review drafts powered by Groq — ultra-fast LLaMA 3.3 70B
        </p>

        {model && (
          <p className="text-[11px] text-gray-400 mb-5">
            Last used model: <span className="text-orange-500 font-mono">{model}</span>
          </p>
        )}

        {/* Input form */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Glamour Salon & Spa"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Customer Name (optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Priya"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Service Received
              </label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Hair Cut, Relaxing Massage..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Target Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
              >
                <option value={5}>5 Stars ★★★★★</option>
                <option value={4}>4 Stars ★★★★</option>
                <option value={3}>3 Stars ★★★</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              Generate 3 Suggestions
            </button>
            <button
              onClick={personalise}
              disabled={msgLoading}
              className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {msgLoading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              Personalise Message
            </button>
          </div>
        </div>

        {/* Personalised message */}
        {message && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-800">AI-Personalised WhatsApp Message</h3>
              <button
                onClick={() => copy(message)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            {/* WhatsApp bubble style */}
            <div className="bg-[#dcf8c6] rounded-xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-mono border border-green-100">
              {message}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-3 text-gray-800">
              Review Drafts — share with your customer to copy & post
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm rounded-xl p-4 transition"
                >
                  <div className="text-yellow-500 text-base mb-2">{'★'.repeat(s.rating)}</div>
                  <p className="text-gray-600 text-sm leading-relaxed italic mb-4">"{s.text}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">{s.text.split(' ').length} words</span>
                    <button
                      onClick={() => copy(s.text)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 transition"
                    >
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!suggestions.length && !loading && (
          <div className="text-center py-14 text-gray-400">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100">
              <Zap size={28} className="text-orange-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Ready to generate</p>
            <p className="text-xs mt-1 text-gray-400">
              Fill the form above and click "Generate 3 Suggestions"
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}