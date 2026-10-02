import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Headphones, RefreshCw, Save } from 'lucide-react';
import { API_BASE } from '../config/api';
const languageLabels = { en: 'English', hi: 'Hindi', gu: 'Gujarati' };

const AdminVoicePanel = () => {
  const [calls, setCalls] = useState([]);
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState({ greeting: '', supportedLanguages: ['en', 'hi', 'gu'] });
  const [configured, setConfigured] = useState(false);
  const [phoneConfigured, setPhoneConfigured] = useState(false);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState('');

  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setBusy(true);
      setNotice('');
    }
    const token = localStorage.getItem('timeora_token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [callResult, orderResult, configResult, publicConfig] = await Promise.all([
        axios.get(`${API_BASE}/voice/admin/calls`, { headers }),
        axios.get(`${API_BASE}/voice/admin/orders`, { headers }),
        axios.get(`${API_BASE}/voice/admin/config`, { headers }),
        axios.get(`${API_BASE}/voice/config`),
      ]);
      setCalls(callResult.data.calls || []);
      setOrders(orderResult.data.orders || []);
      setConfig(configResult.data.config);
      setConfigured(Boolean(publicConfig.data.configured));
      setPhoneConfigured(Boolean(publicConfig.data.phoneConfigured));
    } catch (error) {
      setNotice(error.response?.data?.message || 'Voice operations data could not be loaded.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('timeora_token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API_BASE}/voice/admin/calls`, { headers }),
      axios.get(`${API_BASE}/voice/admin/orders`, { headers }),
      axios.get(`${API_BASE}/voice/admin/config`, { headers }),
      axios.get(`${API_BASE}/voice/config`),
    ]).then(([callResult, orderResult, configResult, publicConfig]) => {
      if (!mounted) return;
      setCalls(callResult.data.calls || []);
      setOrders(orderResult.data.orders || []);
      setConfig(configResult.data.config);
      setConfigured(Boolean(publicConfig.data.configured));
      setPhoneConfigured(Boolean(publicConfig.data.phoneConfigured));
    }).catch((error) => {
      if (mounted) setNotice(error.response?.data?.message || 'Voice operations data could not be loaded.');
    }).finally(() => {
      if (mounted) setBusy(false);
    });

    return () => { mounted = false; };
  }, []);

  const saveConfig = async (event) => {
    event.preventDefault();
    setNotice('');
    try {
      const token = localStorage.getItem('timeora_token');
      await axios.put(`${API_BASE}/voice/admin/config`, config, { headers: { Authorization: `Bearer ${token}` } });
      setNotice('Voice assistant settings saved.');
    } catch (error) {
      setNotice(error.response?.data?.message || 'Settings could not be saved.');
    }
  };

  const toggleLanguage = (language) => {
    const current = config.supportedLanguages || [];
    const next = current.includes(language)
      ? current.filter((entry) => entry !== language)
      : [...current, language];
    setConfig({ ...config, supportedLanguages: next });
  };

  return (
    <section className="mb-8 border border-[#1e3048] bg-[#111827] p-5 sm:p-6" aria-labelledby="voice-admin-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#263449] pb-4">
        <div className="flex items-center gap-3">
          <Headphones size={19} className="text-[#2dd4bf]" />
          <div>
            <h2 id="voice-admin-heading" className="text-lg font-semibold text-white">AI Voice Operations</h2>
            <p className="text-xs text-gray-400">Call records and follow-up outcomes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${configured ? 'text-emerald-300' : 'text-amber-300'}`}>{configured ? 'Website calls ready' : 'Website calls not configured'}</span>
          <button type="button" title="Refresh voice data" aria-label="Refresh voice data" onClick={loadData} disabled={busy} className="grid size-9 place-items-center border border-white/15 text-gray-200 hover:bg-white/10 disabled:opacity-50"><RefreshCw size={15} className={busy ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      {!configured && <p className="mt-4 border-l-2 border-amber-400 px-3 py-2 text-xs text-amber-100">Website calls need Twilio and OpenAI credentials, a public HTTPS webhook URL, a public WSS stream server, and a Twilio Voice application. Vercel deployment settings and function duration must support the WebSocket session.</p>}
      {configured && (
        <p className={`mt-4 border-l-2 px-3 py-2 text-xs ${phoneConfigured ? 'border-emerald-400 text-emerald-100' : 'border-amber-400 text-amber-100'}`}>
          {phoneConfigured
            ? 'Twilio confirms inbound voice capability and the configured webhook on +91 8469965711.'
            : 'Phone answering is not enabled: Twilio must provision +91 8469965711 for voice and point its POST voice URL to this TIMEORA webhook.'}
        </p>
      )}
      {notice && <p role="status" className="mt-3 text-xs text-gray-200">{notice}</p>}

      <form onSubmit={saveConfig} className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
        <label className="block text-xs text-gray-300">AI greeting
          <textarea value={config.greeting || ''} maxLength={500} onChange={(event) => setConfig({ ...config, greeting: event.target.value })} className="mt-1 min-h-20 w-full border border-[#344155] bg-[#0b1220] p-3 text-sm text-white focus:border-[#2dd4bf] focus:outline-none" />
        </label>
        <div className="flex flex-col justify-between gap-4">
          <fieldset>
            <legend className="mb-2 text-xs text-gray-300">Supported languages</legend>
            <div className="flex flex-wrap gap-3">
              {Object.entries(languageLabels).map(([code, label]) => (
                <label key={code} className="flex items-center gap-2 text-xs text-gray-200">
                  <input type="checkbox" checked={(config.supportedLanguages || []).includes(code)} onChange={() => toggleLanguage(code)} className="accent-[#2dd4bf]" />{label}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#2dd4bf] px-4 text-xs font-bold uppercase text-[#07110f] hover:bg-[#5eead4]"><Save size={15} />Save settings</button>
        </div>
      </form>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-white">Recent calls</h3>
          <div className="max-h-80 overflow-auto border border-[#263449]">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="sticky top-0 bg-[#0d1523] text-gray-400"><tr><th className="p-2">Started</th><th className="p-2">Duration</th><th className="p-2">Status</th><th className="p-2">Language</th><th className="p-2">Outcome</th><th className="p-2">Caller</th></tr></thead>
              <tbody className="divide-y divide-[#263449] text-gray-200">
                {calls.length ? calls.map((call) => <tr key={call._id}><td className="p-2">{call.startedAt ? new Date(call.startedAt).toLocaleString() : new Date(call.createdAt).toLocaleString()}</td><td className="p-2">{Number(call.durationSeconds || 0)}s</td><td className="p-2">{call.status}</td><td className="p-2">{languageLabels[call.language] || call.language}</td><td className="p-2">{call.outcome}{call.handoffReason ? `: ${call.handoffReason}` : ''}</td><td className="p-2">{call.customer?.phone || 'Not captured'}</td></tr>) : <tr><td colSpan={6} className="p-4 text-center text-gray-400">No calls recorded.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-white">Orders created from calls</h3>
          <div className="max-h-80 overflow-auto border border-[#263449]">
            <table className="w-full min-w-[500px] text-left text-xs">
              <thead className="sticky top-0 bg-[#0d1523] text-gray-400"><tr><th className="p-2">Order</th><th className="p-2">Customer</th><th className="p-2">Items</th><th className="p-2">Total</th><th className="p-2">Status</th></tr></thead>
              <tbody className="divide-y divide-[#263449] text-gray-200">
                {orders.length ? orders.map((order) => <tr key={order._id}><td className="p-2">{order.orderId}</td><td className="p-2">{[order.shippingInfo?.firstName, order.shippingInfo?.lastName].filter(Boolean).join(' ') || order.shippingInfo?.email}</td><td className="p-2">{order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</td><td className="p-2">{order.total}</td><td className="p-2">{order.status}</td></tr>) : <tr><td colSpan={5} className="p-4 text-center text-gray-400">No AI-created orders.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminVoicePanel;
