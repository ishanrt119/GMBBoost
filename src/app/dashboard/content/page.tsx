"use client";
import { useState } from "react";
import { Wand2, RefreshCw, Copy, Check, Sparkles, FileText } from "lucide-react";

export default function GeneratorPage() {
  const [form, setForm] = useState({
    business_name: "",
    business_type: "",
    location: "",
    keywords: "",
    tone: "professional",
    content_type: "gmb_post",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [editableContent, setEditableContent] = useState("");
  const [copied, setCopied] = useState(false);

  const TONES = ["professional", "friendly", "casual", "authoritative", "enthusiastic"];
  const CONTENT_TYPES = [
    { value: "gmb_post", label: "GMB Post", desc: "Short update for Google Business" },
    { value: "seo_description", label: "SEO Description", desc: "Optimized business bio" },
    { value: "faq", label: "FAQ Section", desc: "Common questions & answers" },
    { value: "promotional", label: "Promotional", desc: "Highlight special offers" },
    { value: "educational", label: "Educational", desc: "Share expertise & tips" }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);
    try {
      // In a real scenario we'd use NextAuth user businessId, using a mock ID for now
      const payload = { ...form, keywords: form.keywords.split(",").map(k => k.trim()), businessId: "000000000000000000000000" };
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setEditableContent(data.data.content);
      } else {
        alert("Failed to generate content: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error generating content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent || result?.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-2">AI Content Generator</h1>
      <p className="text-white/60 mb-10">Create SEO-optimized content for your business instantly.</p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 shadow-md space-y-5">
            <div>
              <label className="block text-white/60 mb-2 text-sm">Business Name</label>
              <input type="text" value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} className="w-full border border-white/10 rounded-2xl p-3 outline-none focus:border-primary bg-black/20 text-white" placeholder="e.g. Joe's Coffee" />
            </div>
            <div>
              <label className="block text-white/60 mb-2 text-sm">Business Type</label>
              <input type="text" value={form.business_type} onChange={e => setForm({...form, business_type: e.target.value})} className="w-full border border-white/10 rounded-2xl p-3 outline-none focus:border-primary bg-black/20 text-white" placeholder="e.g. Coffee Shop" />
            </div>
            <div>
              <label className="block text-white/60 mb-2 text-sm">Location</label>
              <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full border border-white/10 rounded-2xl p-3 outline-none focus:border-primary bg-black/20 text-white" placeholder="e.g. Seattle, WA" />
            </div>
            <div>
              <label className="block text-white/60 mb-2 text-sm">Keywords (comma separated)</label>
              <input type="text" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} className="w-full border border-white/10 rounded-2xl p-3 outline-none focus:border-primary bg-black/20 text-white" placeholder="e.g. best espresso, free wifi" />
            </div>
            <div>
              <label className="block text-white/60 mb-2 text-sm">Tone</label>
              <select value={form.tone} onChange={e => setForm({...form, tone: e.target.value})} className="w-full border border-white/10 rounded-2xl p-3 outline-none focus:border-primary bg-black/20 text-white">
                {TONES.map(t => <option key={t} value={t} className="bg-slate-900">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/60 mb-2 text-sm">Content Type</label>
              <div className="space-y-2">
                {CONTENT_TYPES.map(ct => (
                  <button key={ct.value} onClick={() => setForm({...form, content_type: ct.value})} className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${form.content_type === ct.value ? 'bg-purple-600/20 border-purple-500/50 text-purple-200' : 'bg-black/20 border-white/10 text-white/60 hover:border-white/30'}`}>
                    <FileText className="w-4 h-4 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-white">{ct.label}</div>
                      <div className="text-xs">{ct.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100">
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-md h-full min-h-[500px] flex flex-col">
            {!result && !isGenerating && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                  <Sparkles className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Ready to generate</h3>
                <p className="text-white/50 max-w-sm">Fill in your business details and click Generate to create AI-powered content tailored for you.</p>
              </div>
            )}

            {isGenerating && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 animate-pulse">
                  <Wand2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Crafting your content...</h3>
                <p className="text-white/50">Applying local SEO magic and generating compelling text.</p>
              </div>
            )}

            {result && !isGenerating && (
              <div className="flex-1 flex flex-col space-y-6">
                <div className="flex justify-between items-start border-b border-white/10 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{result.title}</h2>
                    <p className="text-white/50 mt-1 capitalize">{result.contentType?.replace('_', ' ')} · {result.tone}</p>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                    SEO Score {result.seoScore}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-white/50 text-sm mb-2 uppercase tracking-wider">Content</label>
                    <textarea 
                      rows={10} 
                      value={editableContent} 
                      onChange={(e) => setEditableContent(e.target.value)}
                      className="w-full border border-white/10 rounded-2xl p-5 outline-none focus:border-primary bg-black/20 text-white leading-relaxed resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/50 text-sm mb-2 uppercase tracking-wider">Call To Action</label>
                    <div className="w-full border border-purple-500/30 rounded-xl p-4 bg-purple-500/10 text-purple-200 font-medium">
                      {result.cta}
                    </div>
                  </div>

                  {result.hashtags?.length > 0 && (
                    <div>
                      <label className="block text-white/50 text-sm mb-2 uppercase tracking-wider">Hashtags</label>
                      <div className="flex flex-wrap gap-2">
                        {result.hashtags.map((tag: string) => (
                          <span key={tag} className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <button onClick={handleCopy} className={`flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl font-semibold transition ${copied ? 'bg-emerald-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copied to Clipboard' : 'Copy Content'}
                  </button>
                  <button onClick={handleGenerate} className="px-6 py-4 rounded-2xl border border-white/20 text-white hover:bg-white/10 transition flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
