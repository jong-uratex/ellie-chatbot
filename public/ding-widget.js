/**
 * D.I.N.G. (Digital IT Ninja Guide) - Embeddable Chatbot Widget
 * 
 * Ultralight, standalone JavaScript widget for instant deployment via a single <script> tag.
 * Zero external dependencies (no jQuery, no FontAwesome, no React required).
 * Includes automatic style injection, inline SVGs, and server-backed session persistence.
 */
(function (window, document) {
  'use strict';

  // Prevent multiple instantiations
  if (window.DingChat && window.DingChat.__initialized) {
    return;
  }

  // Identify script element and read data-* attributes reliably (handles async, defer, and third-party platforms like Shopify)
  const currentScript = document.currentScript || 
    document.querySelector('script[src*="ding-widget"]') || 
    (function () {
      const scripts = document.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && scripts[i].src.indexOf('ding-widget') !== -1) {
          return scripts[i];
        }
      }
      return scripts[scripts.length - 1];
    })();

  const dataset = (currentScript && currentScript.dataset) || {};
  const scriptSrc = (currentScript && currentScript.src) ? currentScript.src : window.location.href;

  // Resolve base directory of script host (e.g. "https://dev.uratex.com.ph/jong/ai-chat")
  const scriptDir = (function () {
    try {
      const u = new URL(scriptSrc, window.location.href);
      let p = u.pathname;
      const lastSlash = p.lastIndexOf('/');
      let dir = lastSlash !== -1 ? p.substring(0, lastSlash) : '';
      if (dir.endsWith('/public')) {
        dir = dir.substring(0, dir.length - 7);
      }
      return u.origin + dir;
    } catch (e) {
      return '';
    }
  })();

  // Resolve API Endpoint
  let defaultApi = dataset.api || '/api';
  if (!defaultApi.startsWith('http://') && !defaultApi.startsWith('https://')) {
    if (scriptDir && scriptDir !== window.location.origin) {
      const cleanApi = defaultApi.replace(/^\//, '');
      defaultApi = scriptDir + '/' + cleanApi;
    }
  }

  // Resolve Ellie Chat Icon
  let defaultIcon = dataset.icon || 'ellie.jpeg';
  if (!defaultIcon.startsWith('http://') && !defaultIcon.startsWith('https://') && !defaultIcon.startsWith('data:')) {
    if (scriptDir && scriptDir !== window.location.origin) {
      const cleanIcon = defaultIcon.replace(/^\//, '');
      defaultIcon = scriptDir + '/' + cleanIcon;
    } else if (!defaultIcon.startsWith('/')) {
      defaultIcon = '/' + defaultIcon;
    }
  }

  const config = {
    apiEndpoint: defaultApi,
    icon: defaultIcon,
    model: dataset.model || 'qwen2.5-coder:1.5b',
    title: dataset.title || 'E.L.L.I.E.',
    subtitle: dataset.subtitle || 'Employee Link for Learning, Info & IT Essentials',
    primaryColor: dataset.primaryColor || '#0084ff',
    theme: dataset.theme || 'light', // 'light' | 'dark' | 'auto'
    position: dataset.position || 'bottom-right', // 'bottom-right' | 'bottom-left'
    greeting: dataset.greeting || "Hello! I'm E.L.L.I.E. (Employee Link for Learning, Information & IT Essentials), your Uratex IT Helpdesk Assistant. How can I help you resolve a tech issue or guide you today?",
    placeholder: dataset.placeholder || 'Ask E.L.L.I.E. about passwords, M365, VPN, printers, SAP...',
    sound: dataset.sound !== 'false',
    persistSession: dataset.persistSession !== 'false',
    autoOpen: dataset.autoOpen === 'true',
    quickActions: false
  };

  // State
  let isOpen = false;
  let isSending = false;
  let sessionId = '';
  let idleTimer = null;
  let audioCtx = null;

  // Embedded SVG Icons (Lightweight & zero external font dependency)
  const ICONS = {
    ellie: '<svg viewBox="0 0 36 36" width="26" height="26" fill="none"><circle cx="18" cy="18" r="18" fill="#0084ff"/><path d="M18 9c-3.3 0-6 2.7-6 6v3c0 3.3 2.7 6 6 6s6-2.7 6-6v-3c0-3.3-2.7-6-6-6z" fill="#ffffff"/><circle cx="15.5" cy="16" r="1.5" fill="#0084ff"/><circle cx="20.5" cy="16" r="1.5" fill="#0084ff"/><path d="M16 19.5c.6.8 1.2 1 2 1s1.4-.2 2-1" stroke="#0084ff" stroke-width="1.3" stroke-linecap="round"/><path d="M11 16c-1.2 0-2 .8-2 2v2c0 1.2.8 2 2 2" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M25 16c1.2 0 2 .8 2 2v2c0 1.2-.8 2-2 2" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M11 17c0-4 3-7 7-7s7 3 7 7" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>',
    ellieSmall: '<svg viewBox="0 0 36 36" width="18" height="18" fill="none"><circle cx="18" cy="18" r="18" fill="#0084ff"/><path d="M18 9c-3.3 0-6 2.7-6 6v3c0 3.3 2.7 6 6 6s6-2.7 6-6v-3c0-3.3-2.7-6-6-6z" fill="#ffffff"/><circle cx="15.5" cy="16" r="1.5" fill="#0084ff"/><circle cx="20.5" cy="16" r="1.5" fill="#0084ff"/><path d="M16 19.5c.6.8 1.2 1 2 1s1.4-.2 2-1" stroke="#0084ff" stroke-width="1.3" stroke-linecap="round"/><path d="M11 16c-1.2 0-2 .8-2 2v2c0 1.2.8 2 2 2" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M25 16c1.2 0 2 .8 2 2v2c0 1.2-.8 2-2 2" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M11 17c0-4 3-7 7-7s7 3 7 7" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>',
    ninja: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="4"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="17"/><line x1="16" y1="15" x2="16" y2="17"/></svg>',
    ninjaSmall: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="4"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="17"/><line x1="16" y1="15" x2="16" y2="17"/></svg>',
    key: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 3-9.5 9.5"/><path d="m15.5 7.5 3 3"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    reset: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    network: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
    headset: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>'
  };

  // Secure Cryptographic Session ID Generator
  function generateSecureSessionId() {
    if (window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint8Array(16);
      window.crypto.getRandomValues(arr);
      return 'ding_' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    }
    return 'ding_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
  }

  function getOrInitSessionId() {
    if (!config.persistSession) {
      return generateSecureSessionId();
    }
    let sid = localStorage.getItem('ding_session_id');
    // Validate session ID format to prevent security issues
    if (!sid || !/^[a-zA-Z0-9_\-]{16,64}$/.test(sid)) {
      sid = generateSecureSessionId();
      try {
        localStorage.setItem('ding_session_id', sid);
      } catch (e) {}
    }
    return sid;
  }

  sessionId = getOrInitSessionId();

  // Subtle audio notification using Web Audio API (Zero audio file downloads)
  function playNotificationChime() {
    if (!config.sound) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.26);
    } catch (e) {}
  }

  // Markdown parsing (bold, italic, inline code, line breaks)
  function formatMarkdown(text) {
    if (!text) return '';
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
    escaped = escaped.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06);padding:2px 5px;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:90%;">$1</code>');
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
  }

  // Reset idle timer (Rule 5 compliance)
  function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (isOpen && !isSending) {
        appendMessage('assistant', "Kumusta po! Are you still there? If you are all set with your IT concerns, kindly click the End Chat button so we can close your session. Salamat po!");
      }
    }, 180000);
  }

  // Inject Embedded Self-Contained Stylesheet into <head>
  function injectStyles() {
    if (document.getElementById('ding-widget-injected-styles')) return;

    const style = document.createElement('style');
    style.id = 'ding-widget-injected-styles';
    style.textContent = `
      :root {
        --ding-primary: ${config.primaryColor};
        --ding-primary-hover: ${config.primaryColor}dd;
        --ding-primary-light: #e7f3ff;
        --ding-bg: #ffffff;
        --ding-header-bg: #ffffff;
        --ding-header-text: #0f172a;
        --ding-body-bg: #f8fafc;
        --ding-user-bubble: ${config.primaryColor};
        --ding-user-text: #ffffff;
        --ding-bot-bubble: #f1f5f9;
        --ding-bot-text: #0f172a;
        --ding-border: #e2e8f0;
        --ding-radius: 16px;
        --ding-shadow: 0 12px 36px rgba(0, 0, 0, 0.16);
        --ding-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        --ding-zindex: 2147483647;
      }

      [data-ding-theme="dark"] {
        --ding-primary-light: #1e293b;
        --ding-bg: #0f172a;
        --ding-header-bg: #1e293b;
        --ding-header-text: #f8fafc;
        --ding-body-bg: #0f172a;
        --ding-user-bubble: #2563eb;
        --ding-bot-bubble: #1e293b;
        --ding-bot-text: #e2e8f0;
        --ding-border: #334155;
        --ding-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
      }

      .ding-launcher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background: var(--ding-primary);
        color: #ffffff;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0, 132, 255, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--ding-zindex);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }

      .ding-launcher:hover {
        transform: scale(1.08);
        box-shadow: 0 12px 28px rgba(0, 132, 255, 0.45);
      }

      .ding-launcher.ding-pos-left {
        right: auto;
        left: 24px;
      }

      .ding-launcher-badge {
        position: absolute;
        top: -1px;
        right: -1px;
        width: 13px;
        height: 13px;
        background: #22c55e;
        border: 2px solid #ffffff;
        border-radius: 50%;
      }

      .ding-launcher-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        display: block;
      }

      .ding-avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        display: block;
      }

      .ding-msg-avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        display: block;
      }

      .ding-container {
        position: fixed;
        bottom: 94px;
        right: 24px;
        width: 390px;
        max-width: calc(100vw - 32px);
        height: 580px;
        max-height: calc(100vh - 110px);
        background: var(--ding-bg);
        border-radius: var(--ding-radius);
        box-shadow: var(--ding-shadow);
        border: 1px solid var(--ding-border);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: var(--ding-zindex);
        font-family: var(--ding-font);
        opacity: 0;
        visibility: hidden;
        transform: translateY(16px) scale(0.97);
        transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.22s;
      }

      .ding-container.ding-pos-left {
        right: auto;
        left: 24px;
      }

      .ding-container.ding-open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      .ding-header {
        background: var(--ding-header-bg);
        padding: 13px 16px;
        border-bottom: 1px solid var(--ding-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .ding-user-info {
        display: flex;
        align-items: center;
        gap: 11px;
        min-width: 0;
      }

      .ding-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--ding-primary);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
      }

      .ding-status-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        background: #22c55e;
        border: 2px solid #fff;
        border-radius: 50%;
      }

      .ding-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--ding-header-text);
        margin: 0;
        line-height: 1.2;
      }

      .ding-subtitle {
        font-size: 11.5px;
        color: #64748b;
        margin: 2px 0 0 0;
      }

      .ding-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .ding-action-btn {
        background: transparent;
        border: none;
        color: #64748b;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, color 0.15s;
      }

      .ding-action-btn:hover {
        background: var(--ding-primary-light);
        color: var(--ding-primary);
      }

      .ding-quick-bar {
        display: flex;
        gap: 6px;
        padding: 7px 12px;
        background: var(--ding-bg);
        border-bottom: 1px solid var(--ding-border);
        overflow-x: auto;
        white-space: nowrap;
      }

      .ding-chip {
        background: var(--ding-primary-light);
        color: var(--ding-primary);
        border: 1px solid rgba(0, 132, 255, 0.15);
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        transition: background 0.15s, color 0.15s;
      }

      .ding-chip:hover {
        background: var(--ding-primary);
        color: #ffffff;
      }

      .ding-body {
        flex: 1;
        padding: 14px;
        overflow-y: auto;
        background: var(--ding-body-bg);
        display: flex;
        flex-direction: column;
        gap: 11px;
      }

      .ding-session-divider {
        align-self: center;
        font-size: 10.5px;
        font-weight: 600;
        color: #94a3b8;
        background: rgba(0, 0, 0, 0.04);
        padding: 3px 10px;
        border-radius: 10px;
        margin: 4px 0;
        text-align: center;
      }

      .ding-message {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        max-width: 82%;
      }

      .ding-message.ding-incoming {
        align-self: flex-start;
      }

      .ding-message.ding-outgoing {
        align-self: flex-end;
        flex-direction: row-reverse;
      }

      .ding-msg-avatar {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: var(--ding-primary);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .ding-bubble {
        padding: 9px 13px;
        border-radius: 15px;
        font-size: 13.5px;
        line-height: 1.45;
        word-break: break-word;
        white-space: pre-wrap;
      }

      .ding-incoming .ding-bubble {
        background: var(--ding-bot-bubble);
        color: var(--ding-bot-text);
        border-bottom-left-radius: 3px;
      }

      .ding-outgoing .ding-bubble {
        background: var(--ding-user-bubble);
        color: var(--ding-user-text);
        border-bottom-right-radius: 3px;
      }

      .ding-time {
        font-size: 10px;
        color: #94a3b8;
        margin-top: 3px;
        text-align: right;
      }

      .ding-typing {
        display: none;
        align-self: flex-start;
        background: var(--ding-bot-bubble);
        padding: 8px 14px;
        border-radius: 15px;
        border-bottom-left-radius: 3px;
      }

      .ding-dot {
        height: 6px;
        width: 6px;
        background-color: #94a3b8;
        border-radius: 50%;
        display: inline-block;
        margin: 0 2px;
        animation: ding-bounce 1.3s infinite ease-in-out;
      }
      .ding-dot:nth-child(1) { animation-delay: 0s; }
      .ding-dot:nth-child(2) { animation-delay: 0.2s; }
      .ding-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes ding-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1.0); }
      }

      .ding-footer {
        padding: 10px 12px;
        background: var(--ding-bg);
        border-top: 1px solid var(--ding-border);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .ding-input {
        flex: 1;
        border: 1px solid var(--ding-border);
        background: var(--ding-body-bg);
        color: var(--ding-header-text);
        padding: 9px 14px;
        border-radius: 20px;
        font-size: 13.5px;
        outline: none;
        font-family: inherit;
      }

      .ding-input:focus {
        border-color: var(--ding-primary);
      }

      .ding-send-btn {
        background: var(--ding-primary);
        border: none;
        color: #ffffff;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: transform 0.15s;
      }

      .ding-send-btn:hover {
        transform: scale(1.06);
      }

      .ding-brand {
        font-size: 10px;
        color: #94a3b8;
        text-align: center;
        padding: 3px 0 6px;
        background: var(--ding-bg);
      }
    `;
    document.head.appendChild(style);
  }

  // DOM Elements
  let launcherBtn = null;
  let chatContainer = null;
  let chatBody = null;
  let userInput = null;
  let typingIndicator = null;
  let quickActionsBar = null;

  function createWidgetDOM() {
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidgetDOM);
      } else {
        setTimeout(createWidgetDOM, 40);
      }
      return;
    }

    if (document.getElementById('ding-chatbot-container')) {
      return;
    }

    injectStyles();

    // Helper for launcher icon with fallback
    function getLauncherIconHTML() {
      return `<img src="${config.icon}" alt="${config.title}" class="ding-launcher-img" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block';" /><span class="ding-fallback-icon" style="display:none;">${ICONS.ellie}</span><span class="ding-launcher-badge"></span>`;
    }

    // Launcher button
    launcherBtn = document.createElement('button');
    launcherBtn.id = 'ding-chatbot-launcher';
    launcherBtn.className = 'ding-launcher' + (config.position === 'bottom-left' ? ' ding-pos-left' : '');
    launcherBtn.setAttribute('aria-label', 'Open IT Support Chat');
    launcherBtn.innerHTML = getLauncherIconHTML();

    // Container
    chatContainer = document.createElement('div');
    chatContainer.id = 'ding-chatbot-container';
    chatContainer.className = 'ding-container' + (config.position === 'bottom-left' ? ' ding-pos-left' : '');
    chatContainer.style.setProperty('--ding-primary', config.primaryColor);

    if (config.theme === 'dark' || (config.theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      chatContainer.setAttribute('data-ding-theme', 'dark');
    }

    chatContainer.innerHTML = `
      <div class="ding-header">
        <div class="ding-user-info">
          <div class="ding-avatar">
            <img src="${config.icon}" alt="${config.title}" class="ding-avatar-img" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block';" />
            <span class="ding-fallback-icon" style="display:none;">${ICONS.ellie}</span>
            <div class="ding-status-dot"></div>
          </div>
          <div>
            <h3 class="ding-title">${config.title}</h3>
            <p class="ding-subtitle">${config.subtitle}</p>
          </div>
        </div>
        <div class="ding-header-actions">
          <button class="ding-action-btn" id="ding-btn-clear" title="End Chat & Clear Session">
            ${ICONS.reset}
          </button>
          <button class="ding-action-btn" id="ding-btn-close" title="Close Chat">
            ${ICONS.close}
          </button>
        </div>
      </div>

      <div class="ding-body" id="ding-chat-body">
        <div class="ding-typing" id="ding-typing">
          <span class="ding-dot"></span>
          <span class="ding-dot"></span>
          <span class="ding-dot"></span>
        </div>
      </div>

      <div class="ding-footer">
        <input type="text" class="ding-input" id="ding-input" placeholder="${config.placeholder}" />
        <button class="ding-send-btn" id="ding-send" aria-label="Send Message">
          ${ICONS.send}
        </button>
      </div>
      <div class="ding-brand">
        Powered by E.L.L.I.E. • Employee Link for Learning, Information & IT Essentials
      </div>
    `;

    document.body.appendChild(launcherBtn);
    document.body.appendChild(chatContainer);

    chatBody = chatContainer.querySelector('#ding-chat-body');
    userInput = chatContainer.querySelector('#ding-input');
    typingIndicator = chatContainer.querySelector('#ding-typing');

    // Event handlers
    launcherBtn.addEventListener('click', toggleChat);
    chatContainer.querySelector('#ding-btn-close').addEventListener('click', closeChat);
    chatContainer.querySelector('#ding-btn-clear').addEventListener('click', confirmClearSession);
    chatContainer.querySelector('#ding-send').addEventListener('click', function () { sendMessage(); });

    userInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });

    // Load server-persisted session data
    restoreServerSession();

    if (config.autoOpen) {
      setTimeout(openChat, 800);
    }
  }

  function appendMessage(role, text, timeStr) {
    if (!chatBody) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'ding-message ' + (role === 'user' ? 'ding-outgoing' : 'ding-incoming');

    if (role === 'assistant') {
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'ding-msg-avatar';
      avatarDiv.innerHTML = `<img src="${config.icon}" alt="E.L.L.I.E." class="ding-msg-avatar-img" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block';" /><span class="ding-fallback-icon" style="display:none;">${ICONS.ellieSmall}</span>`;
      msgDiv.appendChild(avatarDiv);
    }

    const bubble = document.createElement('div');
    bubble.className = 'ding-bubble';
    bubble.innerHTML = formatMarkdown(text);

    const now = new Date();
    const timeDisplay = timeStr || (now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));
    const timeDiv = document.createElement('div');
    timeDiv.className = 'ding-time';
    timeDiv.textContent = timeDisplay;
    bubble.appendChild(timeDiv);

    msgDiv.appendChild(bubble);
    chatBody.insertBefore(msgDiv, typingIndicator);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function toggleChat() {
    if (isOpen) closeChat();
    else openChat();
  }

  function openChat() {
    isOpen = true;
    chatContainer.classList.add('ding-open');
    launcherBtn.innerHTML = ICONS.chevronDown;
    if (userInput) userInput.focus();
    chatBody.scrollTop = chatBody.scrollHeight;
    resetIdleTimer();
  }

  function closeChat() {
    isOpen = false;
    chatContainer.classList.remove('ding-open');
    launcherBtn.innerHTML = `<img src="${config.icon}" alt="${config.title}" class="ding-launcher-img" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block';" /><span class="ding-fallback-icon" style="display:none;">${ICONS.ellie}</span><span class="ding-launcher-badge"></span>`;
    if (idleTimer) clearTimeout(idleTimer);
  }

  // Restore session from server-side storage
  async function restoreServerSession() {
    let hasMessages = false;
    try {
      const url = config.apiEndpoint.includes('.php')
        ? `${config.apiEndpoint}?action=session&sessionId=${encodeURIComponent(sessionId)}`
        : `${config.apiEndpoint}/session?sessionId=${encodeURIComponent(sessionId)}`;

      const res = await fetch(url, {
        headers: { 'X-Session-Id': sessionId }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.history && data.history.length > 0) {
          hasMessages = true;
          // Add restoration badge
          const divider = document.createElement('div');
          divider.className = 'ding-session-divider';
          divider.textContent = 'Previous conversation restored';
          chatBody.insertBefore(divider, typingIndicator);

          data.history.forEach(function (msg) {
            const timeStr = msg.timestamp ? new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;
            appendMessage(msg.role, msg.content, timeStr);
          });
        }
      }
    } catch (e) {
      // Fallback
    }

    if (!hasMessages && config.greeting) {
      appendMessage('assistant', config.greeting);
    }
  }

  // Clear session on server & client
  async function confirmClearSession() {
    if (!confirm('End current chat and start a fresh session?')) return;

    try {
      const url = config.apiEndpoint.includes('.php')
        ? `${config.apiEndpoint}?action=clear_session&sessionId=${encodeURIComponent(sessionId)}`
        : `${config.apiEndpoint}/session?sessionId=${encodeURIComponent(sessionId)}`;

      await fetch(url, { 
        method: 'DELETE',
        headers: { 'X-Session-Id': sessionId }
      });
    } catch (e) {}

    try {
      localStorage.removeItem('ding_session_id');
    } catch (e) {}

    sessionId = getOrInitSessionId();

    const messages = chatBody.querySelectorAll('.ding-message, .ding-session-divider');
    messages.forEach(function (m) { m.remove(); });

    if (config.greeting) {
      appendMessage('assistant', config.greeting);
    }
  }

  // Send message to backend
  async function sendMessage(presetText) {
    if (isSending) return;
    const text = (presetText || (userInput ? userInput.value : '')).trim();
    if (!text) return;

    if (!presetText && userInput) userInput.value = '';

    appendMessage('user', text);
    resetIdleTimer();

    isSending = true;
    if (typingIndicator) typingIndicator.style.display = 'inline-block';
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const url = config.apiEndpoint.includes('.php')
        ? `${config.apiEndpoint}?action=chat`
        : `${config.apiEndpoint}/chat`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId
        },
        body: JSON.stringify({
          sessionId: sessionId,
          message: text,
          model: config.model || 'qwen2.5-coder:1.5b'
        })
      });

      const contentType = response.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResp = await response.text();
        const trimmed = textResp.trim();
        if (trimmed.startsWith('<?php')) {
          throw new Error('Static host does not execute PHP. Please point data-api to an active backend API.');
        } else if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
          throw new Error('Endpoint returned HTML page instead of JSON API response.');
        } else {
          throw new Error(response.ok ? 'Server returned non-JSON response' : 'Server returned HTTP ' + response.status);
        }
      }
      if (typingIndicator) typingIndicator.style.display = 'none';

      if (data.reply) {
        appendMessage('assistant', data.reply);
        playNotificationChime();
      } else {
        appendMessage('assistant', 'Pasensya na po: ' + (data.error || 'No response returned from server.'));
      }
    } catch (err) {
      if (typingIndicator) typingIndicator.style.display = 'none';
      appendMessage('assistant', '⚠️ Error contacting E.L.L.I.E.: ' + err.message + '. Please verify network or API URL.');
    } finally {
      isSending = false;
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  // Public DingChat & EllieChat API
  const PublicApi = {
    __initialized: true,
    init: function (options) {
      Object.assign(config, options || {});
      if (chatContainer) {
        chatContainer.style.setProperty('--ding-primary', config.primaryColor);
      }
    },
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    sendMessage: sendMessage,
    clearSession: confirmClearSession,
    getSessionId: function () { return sessionId; },
    getConfig: function () { return Object.assign({}, config); },
    setModel: function (m) { config.model = m; },
    getModel: function () { return config.model; }
  };

  window.DingChat = PublicApi;
  window.EllieChat = PublicApi;

  // Safe DOM Initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidgetDOM);
  } else {
    createWidgetDOM();
  }

})(window, document);
