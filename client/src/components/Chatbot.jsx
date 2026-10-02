import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bot, Check, ChevronDown, LoaderCircle, MessageCircle, Phone, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE, API_ORIGIN } from '../config/api';
import { BRAND_CONFIG } from '../config/brandConfig';
import './Chatbot.css';

const copy = {
  en: {
    title: 'TIMEORA Concierge',
    welcome: 'Welcome to TIMEORA. What kind of watch are you looking for? I can help with style, budget, color, orders, and store information.',
    placeholder: 'Ask about watches, orders, or store policies…',
    send: 'Send message',
    quick: ['Show Men’s Watches', 'Show Women’s Watches', 'Watches Under ₹3000', 'Track My Order', 'Talk to Support'],
    trackPrompt: 'Please enter your TIMEORA order ID. For your privacy, order tracking is available after you sign in.',
    signIn: 'Sign in to track',
    support: 'Call Support',
    inStock: 'In stock',
    view: 'View Product',
    unknown: 'I’m not sure about that. Please contact TIMEORA support and our team can help.',
    thinking: 'TIMEORA is thinking…',
  },
  hi: {
    title: 'TIMEORA सहायता',
    welcome: 'TIMEORA में आपका स्वागत है। आप किस तरह की घड़ी ढूंढ रहे हैं? मैं स्टाइल, बजट, रंग, ऑर्डर और स्टोर की जानकारी में मदद कर सकता हूँ।',
    placeholder: 'घड़ियों, ऑर्डर या नीतियों के बारे में पूछें…',
    send: 'संदेश भेजें',
    quick: ['पुरुषों की घड़ियाँ', 'महिलाओं की घड़ियाँ', '₹3000 से कम', 'मेरा ऑर्डर ट्रैक करें', 'सहायता से बात करें'],
    trackPrompt: 'कृपया अपना TIMEORA ऑर्डर ID दर्ज करें। आपकी गोपनीयता के लिए, साइन इन करने के बाद ही ट्रैकिंग उपलब्ध है।',
    signIn: 'ट्रैक करने के लिए साइन इन करें',
    support: 'सहायता को कॉल करें',
    inStock: 'स्टॉक में',
    view: 'उत्पाद देखें',
    unknown: 'मुझे इस बारे में पक्की जानकारी नहीं है। कृपया TIMEORA सहायता से संपर्क करें।',
    thinking: 'TIMEORA सोच रहा है…',
  },
  gu: {
    title: 'TIMEORA સહાય',
    welcome: 'TIMEORA માં આપનું સ્વાગત છે. તમે કેવા પ્રકારની ઘડિયાળ શોધી રહ્યા છો? હું સ્ટાઇલ, બજેટ, રંગ, ઓર્ડર અને સ્ટોરની માહિતીમાં મદદ કરી શકું છું.',
    placeholder: 'ઘડિયાળ, ઓર્ડર અથવા નીતિ વિશે પૂછો…',
    send: 'સંદેશ મોકલો',
    quick: ['પુરુષોની ઘડિયાળો', 'મહિલાઓની ઘડિયાળો', '₹3000થી ઓછી', 'મારો ઓર્ડર ટ્રૅક કરો', 'સહાય સાથે વાત કરો'],
    trackPrompt: 'કૃપા કરીને તમારો TIMEORA ઓર્ડર ID દાખલ કરો. તમારી ગોપનીયતા માટે, સાઇન ઇન કર્યા પછી જ ટ્રૅકિંગ ઉપલબ્ધ છે.',
    signIn: 'ટ્રૅક કરવા સાઇન ઇન કરો',
    support: 'સહાયને કૉલ કરો',
    inStock: 'સ્ટોકમાં ઉપલબ્ધ',
    view: 'ઉત્પાદન જુઓ',
    unknown: 'મને આ વિશે ખાતરીપૂર્વકની માહિતી નથી. કૃપા કરીને TIMEORA સહાયનો સંપર્ક કરો.',
    thinking: 'TIMEORA જવાબ તૈયાર કરી રહ્યું છે…',
  },
};

const quickAction = (label, language) => {
  if (language === 'en') {
    if (label.includes('Men')) return 'Show available men’s watches';
    if (label.includes('Women')) return 'Show available women’s watches';
    if (label.includes('Under')) return 'Show available watches under ₹3000';
    if (label.includes('Track')) return 'Track my order';
    if (label.includes('Support')) return 'Talk to support';
  } else if (language === 'hi') {
    if (label.includes('पुरुष')) return 'पुरुषों की उपलब्ध घड़ियाँ दिखाएँ';
    if (label.includes('महिलाओं')) return 'महिलाओं की उपलब्ध घड़ियाँ दिखाएँ';
    if (label.includes('कम')) return '₹3000 से कम की घड़ियाँ दिखाएँ';
    if (label.includes('ट्रैक')) return 'मेरा ऑर्डर ट्रैक करें';
    if (label.includes('सहायता')) return 'सहायता से बात करें';
  } else {
    if (label.includes('પુરુષો')) return 'પુરુષોની ઉપલબ્ધ ઘડિયાળો બતાવો';
    if (label.includes('મહિલાઓ')) return 'મહિલાઓની ઉપલબ્ધ ઘડિયાળો બતાવો';
    if (label.includes('ઓછી')) return '₹3000થી ઓછી ઘડિયાળો બતાવો';
    if (label.includes('ટ્રૅક')) return 'મારો ઓર્ડર ટ્રૅક કરો';
    if (label.includes('સહાય')) return 'સહાય સાથે વાત કરો';
  }
  return label;
};

const imageUrl = (source) => {
  if (!source) return '';
  if (source.startsWith('/uploads/')) return `${API_ORIGIN}${source}`;
  return source;
};

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

const Chatbot = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingOrderId, setAwaitingOrderId] = useState(false);
  const [messages, setMessages] = useState([]);
  const messageSequence = useRef(0);
  const endOfMessages = useRef(null);
  const strings = copy[language];

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  if (location.pathname.startsWith('/admin')) return null;

  const nextMessageId = () => {
    messageSequence.current += 1;
    return `chat-${messageSequence.current}`;
  };

  const addAssistantMessage = (text, details = {}) => {
    const id = nextMessageId();
    setMessages((previous) => [...previous, {
      id,
      role: 'assistant',
      text,
      ...details,
    }]);
  };

  const trackOrder = async (orderId) => {
    if (!isAuthenticated) {
      addAssistantMessage(strings.trackPrompt, { signIn: true });
      return;
    }
    try {
      const token = localStorage.getItem('timeora_token');
      const response = await axios.post(`${API_BASE}/chatbot/track`, { orderId }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      addAssistantMessage('', { order: response.data.order });
    } catch (error) {
      addAssistantMessage(error.response?.data?.message || strings.unknown);
    }
  };

  const send = async (rawText) => {
    const text = rawText.trim();
    if (!text || loading) return;
    const userMessage = {
      id: nextMessageId(),
      role: 'user',
      text,
      private: awaitingOrderId || /TM-ORD-\d{6}/i.test(text),
    };
    setInput('');
    setMessages((previous) => [...previous, userMessage]);

    const normalized = text.toLowerCase();
    const supportIntent = /talk to support|speak to support|contact support|सहायता से बात|સહાય સાથે વાત/.test(normalized);
    if (supportIntent) {
      setAwaitingOrderId(false);
      addAssistantMessage(
        language === 'en' ? 'Our team is happy to help. Call TIMEORA during support hours.' :
          language === 'hi' ? 'हमारी टीम आपकी मदद के लिए उपलब्ध है। सहायता समय में TIMEORA को कॉल करें।' :
            'અમારી ટીમ મદદ માટે ઉપલબ્ધ છે. સહાયના સમયમાં TIMEORA ને કૉલ કરો.',
        { callSupport: true },
      );
      return;
    }

    if (awaitingOrderId) {
      setAwaitingOrderId(false);
      setLoading(true);
      await trackOrder(text);
      setLoading(false);
      return;
    }

    const trackIntent = /track (my )?order|order status|tm-ord-\d{6}|મારો ઓર્ડર ટ્રૅક|ઓર્ડર ટ્રૅક|मेरा ऑर्डर ट्रैक|ऑर्डर की स्थिति/.test(normalized);
    if (trackIntent) {
      if (!isAuthenticated) {
        setAwaitingOrderId(false);
        addAssistantMessage(strings.trackPrompt, { signIn: true });
      } else if (/TM-ORD-\d{6}/i.test(text)) {
        setAwaitingOrderId(false);
        setLoading(true);
        await trackOrder(text.match(/TM-ORD-\d{6}/i)[0]);
        setLoading(false);
      } else {
        setAwaitingOrderId(true);
        addAssistantMessage(language === 'en' ? 'Please enter your order ID (for example, TM-ORD-123456).' :
          language === 'hi' ? 'कृपया अपना ऑर्डर ID दर्ज करें (उदाहरण: TM-ORD-123456)।' :
            'કૃપા કરીને તમારો ઓર્ડર ID દાખલ કરો (ઉદાહરણ: TM-ORD-123456).');
      }
      return;
    }

    setLoading(true);
    const conversation = [...messages, userMessage]
      .filter((message) => ['user', 'assistant'].includes(message.role) && message.text && !message.private)
      .slice(-10)
      .map(({ role, text: content }) => ({ role, content }));
    try {
      const response = await axios.post(`${API_BASE}/chatbot/message`, { messages: conversation, language });
      addAssistantMessage(response.data.reply, { products: response.data.products || [] });
    } catch (error) {
      addAssistantMessage(error.response?.data?.message || strings.unknown, { callSupport: true });
    } finally {
      setLoading(false);
    }
  };

  const chooseQuickReply = (label) => {
    const action = quickAction(label, language);
    if (/support|સહાય|सहायता/.test(action.toLowerCase())) {
      send(action);
      return;
    }
    if (/track|ટ્રૅક|ट्रैक/.test(action.toLowerCase())) {
      send(action);
      return;
    }
    send(action);
  };

  return (
    <div className="timeora-chatbot">
      {isOpen && (
        <section className="timeora-chat-window" role="dialog" aria-modal="false" aria-labelledby="timeora-chat-title">
          <header className="timeora-chat-header">
            <div className="timeora-chat-avatar"><Bot size={20} aria-hidden="true" /></div>
            <div className="min-w-0 flex-1">
              <h2 id="timeora-chat-title">{strings.title}</h2>
              <p><span className="timeora-chat-online" /> Online concierge · ગુજરાતી · हिंदी · English</p>
            </div>
            <label className="timeora-language-select">
              <span className="sr-only">Chat language</span>
              <select
                value={language}
                onChange={(event) => {
                  const nextLanguage = event.target.value;
                  setLanguage(nextLanguage);
                  if (messages.length === 1 && messages[0].id === 'welcome') {
                    setMessages([{ id: 'welcome', role: 'assistant', text: copy[nextLanguage].welcome }]);
                  }
                }}
                aria-label="Chat language"
              >
                <option value="en">EN</option>
                <option value="hi">हिंदी</option>
                <option value="gu">ગુજરાતી</option>
              </select>
              <ChevronDown size={13} aria-hidden="true" />
            </label>
            <button type="button" className="timeora-chat-close" aria-label="Close chat" onClick={() => setIsOpen(false)}><X size={19} /></button>
          </header>

          <div className="timeora-chat-messages" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`timeora-message-row ${message.role === 'user' ? 'is-user' : ''}`}>
                {message.role === 'assistant' && <span className="timeora-message-avatar"><Bot size={15} /></span>}
                <div className={`timeora-message ${message.role === 'user' ? 'user-message' : ''}`}>
                  {message.text && <p>{message.text}</p>}
                  {message.signIn && <button type="button" className="timeora-chat-action" onClick={() => navigate('/login')}>{strings.signIn}</button>}
                  {message.callSupport && <a className="timeora-chat-action" href={`tel:${BRAND_CONFIG.contact.phoneE164}`}><Phone size={14} />{strings.support} · {BRAND_CONFIG.contact.phone}</a>}
                  {message.order && (
                    <div className="timeora-order-summary">
                      <strong>{message.order.orderId}</strong>
                      <span>Status: {message.order.status.replaceAll('_', ' ')}</span>
                      <span>Placed: {new Date(message.order.createdAt).toLocaleDateString()}</span>
                      <span>{message.order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</span>
                      {message.order.tracking?.trackingUrl && <a href={message.order.tracking.trackingUrl} target="_blank" rel="noreferrer">Track shipment{message.order.tracking.carrier ? ` · ${message.order.tracking.carrier}` : ''}</a>}
                    </div>
                  )}
                  {message.products?.length > 0 && (
                    <div className="timeora-product-results">
                      {message.products.map((product) => (
                        <article className="timeora-product" key={product.id}>
                          {product.images?.[0] && <img src={imageUrl(product.images[0])} alt={product.name} loading="lazy" />}
                          <div className="timeora-product-info">
                            <strong>{product.name}</strong>
                            <span className="timeora-product-price">{formatPrice(product.effectivePrice)}</span>
                            {product.discountPrice && <del>{formatPrice(product.price)}</del>}
                            <span className="timeora-stock"><Check size={12} />{strings.inStock}</span>
                            <p>{product.description}</p>
                            <Link to={`/product/${product.id}`} className="timeora-product-link" onClick={() => setIsOpen(false)}>{strings.view}</Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="timeora-typing"><LoaderCircle size={15} className="animate-spin" /> {strings.thinking}</div>}
            <div ref={endOfMessages} />
          </div>

          <div className="timeora-chat-quick-replies" aria-label="Quick questions">
            {strings.quick.map((reply) => (
              <button key={reply} type="button" disabled={loading} onClick={() => chooseQuickReply(reply)}>{reply}</button>
            ))}
          </div>

          <form className="timeora-chat-compose" onSubmit={(event) => { event.preventDefault(); send(input); }}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={strings.placeholder}
              maxLength={1000}
              aria-label={strings.placeholder}
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading} aria-label={strings.send}><Send size={17} /></button>
          </form>
          <p className="timeora-chat-footnote">Answers are based on TIMEORA store data. <a href={`tel:${BRAND_CONFIG.contact.phoneE164}`}>Call support</a></p>
        </section>
      )}

      <button
        type="button"
        className={`timeora-chat-launcher ${isOpen ? 'is-open' : ''}`}
        onClick={() => {
          if (!isOpen && messages.length === 0) {
            setMessages([{ id: 'welcome', role: 'assistant', text: strings.welcome }]);
          }
          setIsOpen((open) => !open);
        }}
        aria-label={isOpen ? 'Close TIMEORA chat' : 'Chat with TIMEORA'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} /> : <><MessageCircle size={22} /><span>Chat with us</span></>}
      </button>
    </div>
  );
};

export default Chatbot;
