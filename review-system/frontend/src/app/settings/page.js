 'use client';
import AppLayout from '@/components/AppLayout';

const integrations = [
  {
    name: 'WhatsApp Business API',
    desc: 'Meta Cloud API - send review requests via WhatsApp',
    env: 'WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID',
    docs: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    bg: 'bg-green-50',
    icon: '💬',
  },
  {
    name: 'SendGrid Email',
    desc: 'Transactional email for review request messages',
    env: 'SENDGRID_API_KEY',
    docs: 'https://app.sendgrid.com/settings/api_keys',
    bg: 'bg-blue-50',
    icon: '📧',
  },
  {
    name: 'Twilio SMS',
    desc: 'SMS messaging via Twilio for review requests',
    env: 'TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER',
    docs: 'https://console.twilio.com',
    bg: 'bg-yellow-50',
    icon: '📱',
  },
  {
    name: 'Groq AI (LLaMA 3.3)',
    desc: 'Ultra-fast LLaMA 3.3 70B - free tier available',
    env: 'GROQ_API_KEY',
    docs: 'https://console.groq.com/keys',
    bg: 'bg-orange-50',
    icon: '✨',
  },
  {
    name: 'Google My Business',
    desc: 'Auto-generate Google review deep-link for your business',
    env: 'GOOGLE_API_KEY',
    docs: 'https://console.cloud.google.com/apis/credentials',
    bg: 'bg-red-50',
    icon: '🔴',
  },
];

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Integrations and Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure API keys in your backend{' '}
            <code className="text-blue-600 text-xs bg-blue-50 px-1.5 py-0.5 rounded">.env</code> file
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {integrations.map((item) => (
            <div key={item.name} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-gray-300 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                    <code className="text-[10px] bg-gray-100 text-blue-600 px-2 py-0.5 rounded mt-1.5 inline-block border border-gray-200">
                      {item.env}
                    </code>
                  </div>
                </div>
                <a
                  href={item.docs}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap mt-1"
                >
                  Get API Key
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4 text-gray-800">Google Review Link Generator</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Google Place ID
              </label>
              <input
                defaultValue="ChIJN1t_tDeuEmsRUsoyG83frY4"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
              <p className="text-xs text-gray-400 mt-1">
                Find yours at{' '}
                <a
                  href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Place ID Finder
                </a>
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Generated Review URL
              </label>
              <input
                readOnly
                value="https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-blue-600 focus:outline-none cursor-text"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
              Save to Business Profile
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}