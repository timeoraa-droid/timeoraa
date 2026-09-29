import React, { useEffect, useRef, useState } from 'react';
import { Device } from '@twilio/voice-sdk';
import { Headphones, Mic, MicOff, Phone, PhoneOff, X } from 'lucide-react';
import { API_BASE } from '../config/api';

const callStateLabels = {
  idle: 'Ready when you are',
  connecting: 'Connecting securely…',
  active: 'You are connected to TIMEORA AI',
  muted: 'Your microphone is muted',
  ended: 'Call ended',
};

const VoiceCallButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [callState, setCallState] = useState('idle');
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState('');
  const deviceRef = useRef(null);
  const callRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE}/voice/config`, { signal: AbortSignal.timeout(5000) })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Voice configuration unavailable')))
      .then(config => { if (mounted) setConfigured(config.configured === true); })
      .catch(() => { if (mounted) setConfigured(false); });

    const openSupport = () => setIsOpen(true);
    window.addEventListener('timeora:open-voice-support', openSupport);
    return () => {
      mounted = false;
      window.removeEventListener('timeora:open-voice-support', openSupport);
      callRef.current?.disconnect();
      deviceRef.current?.destroy();
    };
  }, []);

  const releaseCall = () => {
    callRef.current?.disconnect();
    deviceRef.current?.destroy();
    callRef.current = null;
    deviceRef.current = null;
  };

  const endCall = () => {
    releaseCall();
    setCallState('ended');
    setError('');
  };

  const startCall = async () => {
    if (!configured) {
      setError('Website calling is not configured yet. TIMEORA has not connected a call.');
      return;
    }

    setError('');
    setCallState('connecting');
    let permissionStream;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone access is not supported in this browser.');
      permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissionStream.getTracks().forEach(track => track.stop());

      const response = await fetch(`${API_BASE}/voice/token`, { method: 'POST' });
      const payload = await response.json();
      if (!response.ok || !payload.token) throw new Error(payload.message || 'Could not obtain secure voice credentials.');

      const device = new Device(payload.token, { codecPreferences: ['opus', 'pcmu'] });
      deviceRef.current = device;
      device.on('error', providerError => {
        setCallState('ended');
        setError(providerError.message || 'The voice provider ended the connection.');
        releaseCall();
      });

      const call = await device.connect({ params: { Source: 'website' } });
      callRef.current = call;
      call.on('accept', () => { setError(''); setCallState('active'); });
      call.on('disconnect', () => {
        setCallState('ended');
        setError('The call ended.');
        releaseCall();
      });
      call.on('cancel', () => { setCallState('ended'); setError('The call was cancelled.'); releaseCall(); });
      call.on('error', providerError => {
        setCallState('ended');
        setError(providerError.message || 'The voice provider could not connect this call.');
        releaseCall();
      });
      if (call.status?.() === 'open') setCallState('active');
    } catch (callError) {
      permissionStream?.getTracks().forEach(track => track.stop());
      releaseCall();
      setCallState('ended');
      if (callError.name === 'NotAllowedError' || callError.name === 'PermissionDeniedError') {
        setError('Microphone permission was denied. Allow microphone access in your browser settings and try again.');
      } else if (callError.name === 'NotFoundError' || callError.name === 'DevicesNotFoundError') {
        setError('No microphone was found on this device. Connect a microphone and try again.');
      } else {
        setError(callError.message || 'A network or provider error prevented the call from connecting.');
      }
    }
  };

  const toggleMute = () => {
    const call = callRef.current;
    if (!call) return;
    const muted = !call.isMuted();
    call.mute(muted);
    setCallState(muted ? 'muted' : 'active');
  };

  const closePanel = () => {
    if (callRef.current) endCall();
    setIsOpen(false);
    setError('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setIsOpen(true); setError(''); }}
        className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 border border-[#dac995] bg-[#c4ad74] px-4 text-sm font-semibold text-[#12140f] shadow-[0_12px_32px_rgba(0,0,0,.38)] transition hover:bg-[#d5c391] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Phone size={17} aria-hidden="true" />
        <span>Call TIMEORA AI</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={event => { if (event.target === event.currentTarget) closePanel(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="timeora-call-title" className="w-full max-w-md border border-white/15 bg-[#121612] p-5 text-gray-100 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[#d0bb80]"><Headphones size={17} /><span className="text-[10px] font-semibold uppercase tracking-[0.22em]">TIMEORA Concierge</span></div>
                <h2 id="timeora-call-title" className="font-['Cinzel'] text-xl font-semibold text-white">Voice support</h2>
              </div>
              <button type="button" onClick={closePanel} title="Close voice support" aria-label="Close voice support" className="grid size-9 place-items-center border border-white/15 text-gray-300 hover:border-white/40 hover:text-white"><X size={17} /></button>
            </div>

            <div className="py-5">
              <div className="flex items-center gap-3 border border-white/10 bg-black/20 p-4" role="status" aria-live="polite">
                <span className={`grid size-10 shrink-0 place-items-center ${callState === 'active' ? 'bg-emerald-400/15 text-emerald-300' : callState === 'connecting' ? 'bg-amber-300/15 text-amber-200' : 'bg-white/5 text-[#d0bb80]'}`}>
                  {callState === 'active' || callState === 'muted' ? <Headphones size={19} /> : <Phone size={18} />}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{callStateLabels[callState]}</p>
                  <p className="mt-1 text-xs text-gray-400">Gujarati · Hindi · English</p>
                </div>
              </div>

              {callState === 'idle' && configured && <p className="mt-4 text-sm leading-relaxed text-gray-400">Your browser will ask for microphone access before the call starts. TIMEORA AI should identify itself and respond in the language you speak.</p>}
              {!configured && <div className="mt-4 border-l-2 border-amber-300 px-3 py-2 text-xs leading-relaxed text-amber-100">Website calling is not configured. No call will be attempted. The store team must configure a persistent voice backend, Twilio Voice, and OpenAI credentials.</div>}
              {error && <p role="alert" className="mt-4 border-l-2 border-rose-400 px-3 py-2 text-xs leading-relaxed text-rose-100">{error}</p>}
              <a href="tel:+918469965711" className="mt-4 inline-flex items-center gap-2 text-xs text-gray-300 underline decoration-white/25 underline-offset-4 hover:text-[#d5c391]"><Phone size={13} />Call +91 8469965711</a>
              <p className="mt-1 text-[11px] text-gray-500">This dials the number; AI answering is not enabled on it unless the provider confirms configuration.</p>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
              {callState === 'active' || callState === 'muted' ? (
                <>
                  <button type="button" onClick={toggleMute} className="inline-flex min-h-10 items-center justify-center gap-2 border border-white/20 px-4 text-xs font-semibold text-white hover:border-[#d0bb80]">
                    {callState === 'muted' ? <Mic size={15} /> : <MicOff size={15} />}{callState === 'muted' ? 'Unmute' : 'Mute'}
                  </button>
                  <button type="button" onClick={endCall} className="inline-flex min-h-10 items-center justify-center gap-2 bg-rose-700 px-4 text-xs font-semibold text-white hover:bg-rose-600"><PhoneOff size={15} />End call</button>
                </>
              ) : callState === 'connecting' ? (
                <button type="button" disabled className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#c4ad74] px-4 text-xs font-semibold text-black opacity-70"><span className="size-3 animate-spin rounded-full border border-black/30 border-t-black" />Connecting</button>
              ) : (
                <button type="button" onClick={startCall} disabled={!configured} className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#c4ad74] px-4 text-xs font-semibold text-black hover:bg-[#d5c391] disabled:cursor-not-allowed disabled:opacity-50"><Mic size={15} />{callState === 'ended' ? 'Try again' : 'Allow microphone & call'}</button>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default VoiceCallButton;
