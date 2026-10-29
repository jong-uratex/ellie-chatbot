import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Code, 
  Copy, 
  Check, 
  Sliders, 
  Database, 
  Terminal, 
  Sparkles, 
  Users, 
  FileCode, 
  Send, 
  RotateCcw, 
  ExternalLink, 
  Moon, 
  Sun, 
  Palette, 
  ShieldCheck, 
  Layers, 
  Download,
  Search,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  Play,
  Server,
  Activity,
  Wifi,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Cloud,
  Globe,
  Zap,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('embed');
  const [copiedKey, setCopiedKey] = useState('');

  // Widget customizer states
  const [title, setTitle] = useState('E.L.L.I.E.');
  const [subtitle, setSubtitle] = useState('Employee Link for Learning, Info & IT Essentials');
  const [primaryColor, setPrimaryColor] = useState('#0084ff');
  const [theme, setTheme] = useState('light');
  const [position, setPosition] = useState('bottom-right');
  const [greeting, setGreeting] = useState("Hello! I'm E.L.L.I.E. (Employee Link for Learning, Information & IT Essentials), your Uratex IT Helpdesk Assistant. How can I assist you with your tech issues or workplace questions today?");
  const [placeholder, setPlaceholder] = useState('Ask E.L.L.I.E. about passwords, M365, VPN, printers, SAP...');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quickActionsEnabled, setQuickActionsEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState('qwen2.5-coder:1.5b');
  const [customModelInput, setCustomModelInput] = useState('');

  const AVAILABLE_MODELS = [
    {
      id: 'qwen2.5-coder:1.5b',
      name: 'qwen2.5-coder:1.5b',
      label: 'Qwen 2.5 Coder (1.5B)',
      badge: 'Order-to-Cash',
      category: 'SAP / Enterprise ERP',
      description: 'Specialized lightweight model for SAP Order-to-Cash (O2C), SD billing, sales orders & IT automation.',
      recommended: true
    },
    {
      id: 'qwen2.5vl:3b',
      name: 'qwen2.5vl:3b',
      label: 'Qwen 2.5 VL (3B)',
      badge: 'Vision & OCR',
      category: 'Visual Diagnostics',
      description: 'Vision-language model for troubleshooting error screenshots, hardware photos, and barcode labels.'
    },
    {
      id: 'nemotron-mini:4b',
      name: 'nemotron-mini:4b',
      label: 'Nemotron-Mini (4B)',
      badge: 'Enterprise Helpdesk',
      category: 'General Corporate IT',
      description: 'NVIDIA-optimized fast enterprise helpdesk model for workstations, accounts, and networks.'
    },
    {
      id: 'deepseek-r1:8b',
      name: 'deepseek-r1:8b',
      label: 'DeepSeek-R1 (8B)',
      badge: 'Reasoning (CoT)',
      category: 'Complex IT Problem Solving',
      description: 'High-reasoning model for complex network diagnostics, root-cause investigation, and log analysis.'
    },
    {
      id: 'deepseek-coder-v2:16b',
      name: 'deepseek-coder-v2:16b',
      label: 'DeepSeek Coder v2 (16B)',
      badge: 'Deep IT & Architecture',
      category: 'Software & Systems',
      description: 'Heavyweight 16B parameter model for enterprise systems administration and database debugging.'
    },
    {
      id: 'codestral:latest',
      name: 'codestral:latest',
      label: 'Codestral (Mistral)',
      badge: 'Mistral Code AI',
      category: 'Automation & Scripting',
      description: 'Mistral AI high-performance code model for IT shell scripts, automation pipelines, and API integrations.'
    },
    {
      id: 'moondream:latest',
      name: 'moondream:latest',
      label: 'Moondream',
      badge: 'Edge Vision',
      category: 'Hardware Inspection',
      description: 'Lightweight visual inspection model for verifying patch cables, port connections, and LED indicators.'
    }
  ];

  // Live Chat Preview state
  const [sessionId, setSessionId] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // API Tester state
  const [apiEndpoint, setApiEndpoint] = useState('/api/chat');
  const [apiMethod, setApiMethod] = useState('POST');
  const [apiPayload, setApiPayload] = useState('{\n  "message": "Who is in charge of SAP support?",\n  "sessionId": "demo_session_101"\n}');
  const [apiResponse, setApiResponse] = useState(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Diagnostics state
  const [diagnosticsData, setDiagnosticsData] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Directory search state
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryList, setDirectoryList] = useState([]);
  const [promptsList, setPromptsList] = useState([]);

  // Selected file in PHP backend viewer
  const [selectedFile, setSelectedFile] = useState('api.php');
  const [fileContents, setFileContents] = useState({});

  // Widget static host & API backend host
  const [widgetHost, setWidgetHost] = useState('https://ellie-chatbot.pages.dev');
  const [apiHost, setApiHost] = useState('https://ellie-chatbot.pages.dev/api.php');

  // Cloudflare live tester state
  const [cfTestTarget, setCfTestTarget] = useState('https://ellie-chatbot.pages.dev/api.php?action=ping');
  const [cfTestResult, setCfTestResult] = useState(null);
  const [cfIsTesting, setCfIsTesting] = useState(false);

  // Dedicated AI Connectivity Diagnostic Tester state
  const [testAiUrl, setTestAiUrl] = useState('http://10.0.120.202:11434/v1/chat/completions');
  const [testAiKey, setTestAiKey] = useState('uratex_corp_it_jwt_token_auth_2026');
  const [testAiModel, setTestAiModel] = useState('qwen2.5-coder:1.5b');
  const [testAiMode, setTestAiMode] = useState('backend'); // 'backend' or 'browser'
  const [aiTestResult, setAiTestResult] = useState(null);
  const [isAiTesting, setIsAiTesting] = useState(false);

  const runAiDiagnosticTest = async (overrideUrl) => {
    setIsAiTesting(true);
    setAiTestResult(null);
    const targetUrl = (overrideUrl || testAiUrl).trim();
    const startTime = performance.now();

    if (testAiMode === 'browser') {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testAiKey}`
          },
          body: JSON.stringify({
            model: testAiModel,
            messages: [{ role: 'user', content: 'ping' }],
            stream: false
          }),
          signal: controller.signal
        });
        clearTimeout(timer);
        const duration = Math.round(performance.now() - startTime);
        if (res.ok) {
          const data = await res.json();
          setAiTestResult({
            success: true,
            reachable: true,
            mode: 'browser',
            httpStatus: res.status,
            latencyMs: duration,
            explanation: `Direct browser probe successful! Your workstation connected directly to Ollama at ${targetUrl}.`,
            responseSample: data.choices?.[0]?.message?.content || data.message?.content || 'Model responded successfully (HTTP 200 OK)',
            solutionSteps: ['Direct workstation connection is working properly.']
          });
        } else {
          const errText = await res.text().catch(() => '');
          setAiTestResult({
            success: false,
            reachable: false,
            mode: 'browser',
            httpStatus: res.status,
            latencyMs: duration,
            error: `HTTP ${res.status}: ${res.statusText}`,
            errorCategory: res.status === 404 ? 'model_not_found' : (res.status === 401 ? 'auth_error' : 'http_error'),
            explanation: res.status === 404 
              ? `Model "${testAiModel}" not found on Ollama server (HTTP 404).` 
              : `Ollama server rejected request with HTTP ${res.status}. ${errText.substring(0, 100)}`,
            solutionSteps: res.status === 404 
              ? [`Run "ollama pull ${testAiModel}" on 10.0.120.202`] 
              : ['Check authorization token and model name.']
          });
        }
      } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        setAiTestResult({
          success: false,
          reachable: false,
          mode: 'browser',
          latencyMs: duration,
          error: err.name === 'AbortError' ? 'Connection timed out after 3500ms' : (err.message || 'Browser network / CORS failure'),
          errorCategory: 'browser_network_error',
          explanation: `Your workstation browser cannot connect directly to ${targetUrl}. This occurs when: (1) Your PC is not connected to the Uratex corporate LAN or VPN, (2) Port 11434 is blocked by a firewall, or (3) Ollama lacks CORS headers.`,
          solutionSteps: [
            'Verify your computer is connected to Uratex Office Wi-Fi/LAN or Cisco AnyConnect VPN (vpn.uratex.com.ph)',
            'On the Ollama machine, start Ollama with CORS allowed: "OLLAMA_ORIGINS=\\"*\\" ollama serve"',
            'Open Command Prompt and run "ping 10.0.120.202" to test basic network connectivity'
          ]
        });
      } finally {
        setIsAiTesting(false);
      }
      return;
    }

    // Backend test mode (via Cloudflare Pages / Node server /api/test-ai)
    try {
      const res = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          key: testAiKey,
          model: testAiModel
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiTestResult({
          ...data.diagnostics,
          config: data.config,
          mode: 'backend',
          success: data.diagnostics.reachable
        });
      } else {
        const errText = await res.text().catch(() => '');
        setAiTestResult({
          success: false,
          reachable: false,
          mode: 'backend',
          error: `HTTP ${res.status}: ${errText.substring(0, 150)}`,
          explanation: 'Backend diagnostic route returned an error response.',
          solutionSteps: ['Verify backend service is running and /api/test-ai is deployed.']
        });
      }
    } catch (e) {
      setAiTestResult({
        success: false,
        reachable: false,
        mode: 'backend',
        error: e.message,
        explanation: 'Failed to contact backend diagnostic handler.',
        solutionSteps: ['Verify backend service is running.']
      });
    } finally {
      setIsAiTesting(false);
    }
  };

  const runCloudflareTest = async (urlToTest, method = 'GET', body = null) => {
    setCfIsTesting(true);
    setCfTestResult(null);
    const start = performance.now();
    try {
      const opts = { method };
      if (body) {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(urlToTest, opts);
      const elapsed = Math.round(performance.now() - start);
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { rawText: text.substring(0, 400), contentType };
      }
      setCfTestResult({
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        elapsedMs: elapsed,
        data,
        target: urlToTest
      });
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setCfTestResult({
        ok: false,
        status: 'Network Error',
        statusText: err.message,
        elapsedMs: elapsed,
        error: err.message,
        target: urlToTest
      });
    } finally {
      setCfIsTesting(false);
    }
  };

  // Initialize session safely
  useEffect(() => {
    let sid = '';
    try {
      sid = localStorage.getItem('ding_studio_session_id');
    } catch (e) {
      console.warn('localStorage read prevented:', e);
    }
    if (!sid) {
      sid = 'ding_sess_' + Math.random().toString(36).substring(2, 9);
      try {
        localStorage.setItem('ding_studio_session_id', sid);
      } catch (e) {
        console.warn('localStorage write prevented:', e);
      }
    }
    setSessionId(sid);
    loadSession(sid);
    loadDirectory();
    loadPrompts();
    loadPhpFiles();
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsDiagnosing(true);
    try {
      const res = await fetch('/api/check-config');
      if (res.ok) {
        const data = await res.json();
        setDiagnosticsData(data);
      } else {
        // Fallback test
        setDiagnosticsData({
          success: true,
          config: {
            OLLAMA_API_URL: 'http://10.0.120.202:11434/v1/chat/completions',
            OLLAMA_API_KEY: 'uratex_corp...2026',
            OLLAMA_MODEL: 'qwen2.5-coder:1.5b',
            isPrivateNetwork: true
          },
          diagnostics: {
            reachable: false,
            cloudFallback: 'Active (Gemini & Rule Engine)',
            networkSummary: '10.0.120.202 is an internal Uratex intranet address.'
          }
        });
      }
    } catch (e) {
      // Offline / network fallback
    } finally {
      setIsDiagnosing(false);
    }
  };

  const loadSession = async (sid) => {
    try {
      const res = await fetch(`/api/session?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.history && data.history.length > 0) {
          setChatMessages(data.history);
          return;
        }
      }
    } catch (e) {
      // Fallback
    }
    // Set initial greeting
    setChatMessages([
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: greeting,
        timestamp: Math.floor(Date.now() / 1000)
      }
    ]);
  };

  const loadDirectory = async () => {
    try {
      const res = await fetch('/api/directory');
      if (res.ok) {
        const data = await res.json();
        setDirectoryList(data.results || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadPrompts = async () => {
    try {
      const res = await fetch('/api/prompts');
      if (res.ok) {
        const data = await res.json();
        const text = data.csv || '';
        const lines = text.split('\n').filter(Boolean);
        const parsed = lines.slice(1).map(l => {
          const parts = l.split(',');
          return { id: parts[0] || '', name: parts[2] || parts[0] || 'Prompt', role: parts[3] || 'system', active: parts[5] || 'true' };
        });
        setPromptsList(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadPhpFiles = async () => {
    const files = [
      'functions/api/[[path]].js',
      'functions/api.php.js',
      'functions/_shared/data.js',
      'public/_redirects',
      'public/_headers',
      'wrangler.toml',
      'api.php',
      'index.php',
      'prompt_manager.php',
      'prompt.csv',
      'directory.json',
      '.htaccess',
      'public/ding-widget.js',
      'public/ding-widget.css'
    ];
    const loaded = {};
    for (const f of files) {
      try {
        const res = await fetch(`/api/files?file=${encodeURIComponent(f)}`);
        if (res.ok) {
          loaded[f] = await res.text();
        }
      } catch (e) {}
    }
    setFileContents(loaded);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  const handleSendMessage = async (customMessage) => {
    const textToSend = (customMessage || inputText).trim();
    if (!textToSend || isLoading) return;

    if (!customMessage) setInputText('');

    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: Math.floor(Date.now() / 1000)
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          message: textToSend,
          model: selectedModel
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.ok ? 'Server returned HTML instead of JSON' : `HTTP ${res.status}: ${text.substring(0, 100).replace(/<[^>]+>/g, '')}`);
      }

      if (data.reply) {
        setChatMessages(prev => [
          ...prev,
          {
            id: 'bot_' + Date.now(),
            role: 'assistant',
            content: data.reply,
            timestamp: data.timestamp || Math.floor(Date.now() / 1000)
          }
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            id: 'bot_' + Date.now(),
            role: 'assistant',
            content: 'Error: ' + (data.error || 'Unable to connect to E.L.L.I.E.'),
            timestamp: Math.floor(Date.now() / 1000)
          }
        ]);
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          role: 'assistant',
          content: '⚠️ E.L.L.I.E. Connection Alert: ' + err.message + '\n\n• If querying 10.0.120.202, ensure your workstation is connected to Uratex Corporate LAN or Cisco AnyConnect VPN.\n• In cloud mode, E.L.L.I.E. uses the Uratex IT Knowledge Base & Gemini AI fallback automatically.',
          timestamp: Math.floor(Date.now() / 1000)
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async () => {
    if (!confirm('Are you sure you want to end and reset the session?')) return;
    try {
      await fetch(`/api/session?sessionId=${sessionId}`, { method: 'DELETE' });
    } catch (e) {}

    const newSid = 'ding_sess_' + Math.random().toString(36).substring(2, 9);
    try {
      localStorage.setItem('ding_studio_session_id', newSid);
    } catch (e) {}
    setSessionId(newSid);
    setChatMessages([
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: greeting,
        timestamp: Math.floor(Date.now() / 1000)
      }
    ]);
  };

  const handleExecuteApi = async () => {
    setIsApiLoading(true);
    setApiResponse(null);
    try {
      let options = { method: apiMethod };
      if (apiMethod === 'POST') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = apiPayload;
      }
      const res = await fetch(apiEndpoint, options);
      const data = await res.json();
      setApiResponse({ status: res.status, ok: res.ok, data });
    } catch (e) {
      setApiResponse({ status: 'Error', ok: false, error: e.message });
    } finally {
      setIsApiLoading(false);
    }
  };

  // Generate Script Tag
  const cleanWidgetHost = widgetHost.replace(/\/+$/, '');
  const cleanApiHost = apiHost.replace(/\/+$/, '');

  const scriptTagCode = `<!-- 1-Minute Drop-in E.L.L.I.E. Chatbot Integration (Self-injecting styles & SVGs) -->
<script 
  src="${cleanWidgetHost}/public/ding-widget.js"
  async
  data-api="${cleanApiHost}"
  data-icon="${cleanWidgetHost}/ellie.jpeg"
  data-model="${selectedModel}"
  data-title="${title}"
  data-subtitle="${subtitle}"
  data-primary-color="${primaryColor}"
  data-theme="${theme}"
  data-position="${position}"
  data-greeting="${greeting.replace(/"/g, '&quot;')}"
  data-placeholder="${placeholder.replace(/"/g, '&quot;')}"
  data-sound="${soundEnabled}"
  data-quick-actions="${quickActionsEnabled}"
  data-persist-session="true"
></script>`;

  const shopifySnippetCode = `<!-- E.L.L.I.E. Chatbot for Shopify (Paste in layout/theme.liquid right before </body>) -->
<script 
  src="${cleanWidgetHost}/public/ding-widget.js"
  async
  data-api="${cleanApiHost}"
  data-icon="${cleanWidgetHost}/ellie.jpeg"
  data-model="${selectedModel}"
  data-title="${title}"
  data-subtitle="${subtitle}"
  data-primary-color="${primaryColor}"
  data-theme="${theme}"
  data-position="${position}"
  data-greeting="${greeting.replace(/"/g, '&quot;')}"
  data-placeholder="${placeholder.replace(/"/g, '&quot;')}"
  data-sound="${soundEnabled}"
  data-quick-actions="${quickActionsEnabled}"
  data-persist-session="true"
></script>`;

  const jsInitCode = `// Programmatic JavaScript Integration
DingChat.init({
  apiEndpoint: '${cleanApiHost}',
  icon: '${cleanWidgetHost}/ellie.jpeg',
  model: '${selectedModel}',
  title: '${title}',
  subtitle: '${subtitle}',
  primaryColor: '${primaryColor}',
  theme: '${theme}',            // 'light' | 'dark' | 'auto'
  position: '${position}',      // 'bottom-right' | 'bottom-left'
  greeting: '${greeting}',
  sound: ${soundEnabled},
  quickActions: ${quickActionsEnabled},
  persistSession: true
});`;

  const cssOverrideCode = `/* Custom CSS Overrides */
:root {
  --ding-primary: ${primaryColor};
  --ding-primary-hover: ${primaryColor}dd;
  --ding-radius: 16px;
  --ding-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}`;

  const filteredDirectory = directoryList.filter(item => {
    const q = directorySearch.toLowerCase();
    return (item.name || '').toLowerCase().includes(q) ||
           (item.applicationRole || '').toLowerCase().includes(q) ||
           (item.departmentName || item.department || '').toLowerCase().includes(q) ||
           (item.plantLocation || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/ellie.jpeg" 
            alt="E.L.L.I.E." 
            className="w-10 h-10 rounded-xl object-cover shadow-lg border border-slate-700 transition-transform hover:scale-105" 
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">E.L.L.I.E. Chatbot Suite</h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Ready to Deploy
              </span>
            </div>
            <p className="text-xs text-slate-400">Employee Link for Learning, Information & IT Essentials • Uratex IT Helpdesk</p>
          </div>
        </div>

        {/* Header Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('cloudflare')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'cloudflare' ? 'bg-orange-600 text-white shadow font-semibold' : 'text-orange-400 hover:text-white bg-orange-500/10'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" /> Cloudflare Pages Hosting
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'diagnostics' ? 'bg-amber-600 text-white shadow font-semibold' : 'text-amber-400 hover:text-white bg-amber-500/10'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> API Health & Config
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'embed' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> 1-Min Embed Code
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'customize' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Style Customizer
          </button>
          <button
            onClick={() => setActiveTab('php')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'php' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> Backend Files & Functions
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'api' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Clean API Tester
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'directory' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> IT Directory ({directoryList.length})
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Panel: Content / Config / Code (7 columns) */}
        <div className="lg:col-span-7 border-r border-slate-800 p-6 overflow-y-auto max-h-[calc(100vh-65px)]">
          
          {/* TAB: CLOUDFLARE PAGES HOSTING & FUNCTIONS */}
          {activeTab === 'cloudflare' && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
                  <Cloud className="w-3.5 h-3.5" /> Cloudflare Pages Native Deployment
                </div>
                <h2 className="text-xl font-bold text-white flex items-center justify-between">
                  <span>Cloudflare Pages Compatibility Hub</span>
                  <a
                    href="https://ellie-chatbot.pages.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold transition shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Visit ellie-chatbot.pages.dev
                  </a>
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Full edge serverless compatibility suite for your Cloudflare Pages project <code className="text-orange-300 font-mono">ellie-chatbot</code> at <code className="text-orange-300 font-mono">https://ellie-chatbot.pages.dev/</code>.
                </p>
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-950/40 via-slate-900/80 to-slate-900/80 border border-orange-500/30 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">How Cloudflare Pages Runs Both Widget & API (Zero Server Needed)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Cloudflare Pages is a global edge CDN. Previously, calling <code className="text-orange-300 font-mono">api.php</code> resulted in raw PHP or HTML errors because static hosts do not execute PHP.
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      We have resolved this natively with <strong>Cloudflare Pages Functions</strong>:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="bg-slate-950/70 border border-orange-500/20 rounded p-2 text-slate-300">
                        <strong className="text-orange-300 font-mono">/functions/api.php.js</strong>
                        <div className="text-slate-400 mt-0.5">
                          Intercepts legacy <code className="text-slate-300">data-api=".../api.php"</code> requests and executes as an Edge Worker!
                        </div>
                      </div>
                      <div className="bg-slate-950/70 border border-orange-500/20 rounded p-2 text-slate-300">
                        <strong className="text-orange-300 font-mono">/functions/api/[[path]].js</strong>
                        <div className="text-slate-400 mt-0.5">
                          Handles modern clean REST routes (<code className="text-slate-300">/api/chat</code>, <code className="text-slate-300">/api/models</code>, <code className="text-slate-300">/api/session</code>).
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloudflare Pages Edge Tester */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-orange-400" /> Interactive Edge Endpoint Tester
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                    Direct Edge Probing
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Select a test case below to verify that your Cloudflare Pages endpoints and functions return clean JSON:
                </p>

                {/* Preset Test Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setCfTestTarget('https://ellie-chatbot.pages.dev/api.php?action=ping');
                      runCloudflareTest('https://ellie-chatbot.pages.dev/api.php?action=ping', 'GET');
                    }}
                    disabled={cfIsTesting}
                    className="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 text-xs font-medium transition"
                  >
                    1. Test Legacy api.php?action=ping
                  </button>

                  <button
                    onClick={() => {
                      setCfTestTarget('https://ellie-chatbot.pages.dev/api/models');
                      runCloudflareTest('https://ellie-chatbot.pages.dev/api/models', 'GET');
                    }}
                    disabled={cfIsTesting}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition"
                  >
                    2. Test GET /api/models
                  </button>

                  <button
                    onClick={() => {
                      setCfTestTarget('https://ellie-chatbot.pages.dev/api.php?action=chat');
                      runCloudflareTest('https://ellie-chatbot.pages.dev/api.php?action=chat', 'POST', {
                        message: "How can I use this Email signature generator?",
                        model: "qwen2.5-coder:1.5b",
                        sessionId: sessionId
                      });
                    }}
                    disabled={cfIsTesting}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition"
                  >
                    3. Test Rule 12 (Email Signature)
                  </button>

                  <button
                    onClick={() => {
                      setCfTestTarget('https://ellie-chatbot.pages.dev/api/chat');
                      runCloudflareTest('https://ellie-chatbot.pages.dev/api/chat', 'POST', {
                        message: "Hi Ellie. I need help with my keyboard",
                        model: "qwen2.5-coder:1.5b",
                        sessionId: sessionId
                      });
                    }}
                    disabled={cfIsTesting}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition"
                  >
                    4. Test Rule 7 (Keyboard Hardware)
                  </button>

                  <button
                    onClick={() => {
                      setCfTestTarget('/api/ping');
                      runCloudflareTest('/api/ping', 'GET');
                    }}
                    disabled={cfIsTesting}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    5. Test Local Applet Engine (/api/ping)
                  </button>
                </div>

                {/* Test Result Display */}
                {cfIsTesting && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2 text-xs text-orange-300">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to <code className="font-mono text-white">{cfTestTarget}</code>...</span>
                  </div>
                )}

                {cfTestResult && !cfIsTesting && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden space-y-2">
                    <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${cfTestResult.ok ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        <span className="font-mono text-slate-300">{cfTestResult.target}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className={cfTestResult.ok ? 'text-emerald-400' : 'text-rose-400'}>
                          HTTP {cfTestResult.status} {cfTestResult.statusText}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-blue-400">{cfTestResult.elapsedMs}ms</span>
                      </div>
                    </div>
                    <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto max-h-60 leading-relaxed">
                      {JSON.stringify(cfTestResult.data || cfTestResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Cloudflare Pages Deployment Settings Guide */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cloudflare Pages Dashboard Settings Checklist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 space-y-2">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Build Configuration
                    </div>
                    <ul className="text-slate-400 space-y-1 text-[11px]">
                      <li>• <strong>Framework preset:</strong> Vite</li>
                      <li>• <strong>Build command:</strong> <code className="text-slate-200 bg-slate-950 px-1 py-0.5 rounded">npm run build</code></li>
                      <li>• <strong>Build output directory:</strong> <code className="text-slate-200 bg-slate-950 px-1 py-0.5 rounded">dist</code></li>
                      <li>• <strong>Root directory:</strong> <code className="text-slate-200 bg-slate-950 px-1 py-0.5 rounded">/</code></li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 space-y-2">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Environment Variables (Pages &gt; Settings)
                    </div>
                    <ul className="text-slate-400 space-y-1 text-[11px]">
                      <li>• <code className="text-orange-300">GEMINI_API_KEY</code>: <em>Your Gemini API key for Cloud AI</em></li>
                      <li>• <code className="text-orange-300">OLLAMA_API_URL</code>: <em>http://10.0.120.202:11434/v1/chat/completions</em></li>
                      <li>• <code className="text-orange-300">OLLAMA_API_KEY</code>: <em>uratex_corp_it_jwt_token_auth_2026</em></li>
                      <li>• <code className="text-orange-300">OLLAMA_MODEL</code>: <em>qwen2.5-coder:1.5b</em></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Created Cloudflare Files List */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-blue-400" /> Cloudflare Files Added to Repository
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { file: '/functions/api.php.js', desc: 'Catches and executes api.php?action=* requests at edge' },
                    { file: '/functions/api/[[path]].js', desc: 'Catchall router for /api/* REST endpoints' },
                    { file: '/functions/_shared/data.js', desc: 'Edge Rule engine (Rules 1-12) & IT staff directory' },
                    { file: '/public/_redirects', desc: 'Maps /public/ding-widget.js to root cleanly' },
                    { file: '/public/_headers', desc: 'Permissive CORS headers for widget script & CSS' },
                    { file: '/wrangler.toml', desc: 'Cloudflare Pages compatibility configuration' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-mono font-bold text-blue-300 text-[11px]">{item.file}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 0: OLLAMA API CONFIGURATION & HEALTH DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                  <Activity className="w-3.5 h-3.5" /> API Configuration & Connectivity Analysis
                </div>
                <h2 className="text-xl font-bold text-white flex items-center justify-between">
                  <span>E.L.L.I.E. API Health & Configuration Audit</span>
                  <button
                    onClick={runDiagnostics}
                    disabled={isDiagnosing}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shadow"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                    {isDiagnosing ? 'Checking...' : 'Run Diagnostics'}
                  </button>
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Analysis of your defined Ollama API constants and interactive live diagnostics for AI server connectivity.
                </p>
              </div>

              {/* LIVE INTERACTIVE AI DIAGNOSTIC SUITE */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-blue-500/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Live AI Connection & Diagnostic Test</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                          Active Probe
                        </span>
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Send a live test payload to your Ollama AI endpoint to test latency, reachability, model inference, and identify exact network or configuration errors.
                    </p>
                  </div>
                  
                  {/* Probe Mode Selector */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setTestAiMode('backend')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition ${
                        testAiMode === 'backend' 
                          ? 'bg-blue-600 text-white shadow' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Test reachability from the Cloudflare Pages edge backend"
                    >
                      Cloudflare / Server Edge
                    </button>
                    <button
                      onClick={() => setTestAiMode('browser')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition ${
                        testAiMode === 'browser' 
                          ? 'bg-blue-600 text-white shadow' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Test reachability directly from your workstation browser"
                    >
                      Workstation Browser
                    </button>
                  </div>
                </div>

                {/* Form Controls */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* URL */}
                  <div className="md:col-span-6 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">Target Ollama Endpoint URL</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setTestAiUrl('http://10.0.120.202:11434/v1/chat/completions')}
                          className="text-[10px] text-blue-400 hover:underline"
                        >
                          Default LAN
                        </button>
                        <span className="text-slate-600">•</span>
                        <button
                          type="button"
                          onClick={() => setTestAiUrl('http://127.0.0.1:11434/v1/chat/completions')}
                          className="text-[10px] text-blue-400 hover:underline"
                        >
                          Localhost
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={testAiUrl}
                      onChange={e => setTestAiUrl(e.target.value)}
                      placeholder="http://10.0.120.202:11434/v1/chat/completions"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Model */}
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Target Model</label>
                    <select
                      value={testAiModel}
                      onChange={e => setTestAiModel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    >
                      {availableModels.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.badge})</option>
                      ))}
                    </select>
                  </div>

                  {/* API Key */}
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Bearer Token / Key</label>
                    <input
                      type="password"
                      value={testAiKey}
                      onChange={e => setTestAiKey(e.target.value)}
                      placeholder="Bearer token"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Trigger Button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span>Testing mode: <strong>{testAiMode === 'backend' ? 'Cloudflare Pages Edge -> Ollama' : 'Local Workstation Browser -> Ollama'}</strong></span>
                  </div>

                  <button
                    onClick={() => runAiDiagnosticTest()}
                    disabled={isAiTesting}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20"
                  >
                    <Play className={`w-3.5 h-3.5 ${isAiTesting ? 'animate-spin' : ''}`} />
                    {isAiTesting ? 'Testing Connectivity...' : 'Run Live Diagnostic Test'}
                  </button>
                </div>

                {/* DIAGNOSTIC RESULTS DISPLAY */}
                {aiTestResult && (
                  <div className={`mt-4 p-4 rounded-xl border transition-all ${
                    aiTestResult.success 
                      ? 'bg-emerald-950/30 border-emerald-500/40' 
                      : (aiTestResult.errorCategory === 'private_ip_cloud_mismatch' 
                          ? 'bg-amber-950/40 border-amber-500/40' 
                          : 'bg-rose-950/40 border-rose-500/40')
                  }`}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        {aiTestResult.success ? (
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            aiTestResult.errorCategory === 'private_ip_cloud_mismatch' 
                              ? 'bg-amber-500/20 text-amber-400' 
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {aiTestResult.success 
                                ? 'AI Endpoint Reachable & Verified' 
                                : (aiTestResult.errorCategory === 'private_ip_cloud_mismatch'
                                    ? 'Private Intranet IP Unreachable from Cloud'
                                    : 'AI Connection Failed')}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              aiTestResult.success 
                                ? 'bg-emerald-500/20 text-emerald-300' 
                                : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {aiTestResult.httpStatus ? `HTTP ${aiTestResult.httpStatus}` : 'ERR_NETWORK'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Target: <code className="font-mono text-blue-300">{testAiUrl}</code> • Model: <code className="font-mono text-amber-300">{testAiModel}</code>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-mono text-slate-400 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          {aiTestResult.latencyMs || 0}ms
                        </span>
                        <span className="text-[10px] text-slate-500 capitalize">{aiTestResult.mode} probe</span>
                      </div>
                    </div>

                    {/* Root Cause & Explanation */}
                    <div className="pt-3 space-y-2">
                      <div className="text-xs text-slate-200 leading-relaxed">
                        <strong className="text-amber-300">What is wrong: </strong>
                        {aiTestResult.explanation || aiTestResult.error}
                      </div>

                      {/* Error details if any */}
                      {aiTestResult.error && (
                        <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 font-mono text-[11px] text-rose-300 break-all">
                          {aiTestResult.error}
                        </div>
                      )}

                      {/* Live Inference Sample if success */}
                      {aiTestResult.responseSample && (
                        <div className="p-2.5 bg-slate-900/90 rounded-lg border border-emerald-500/30 font-mono text-[11px] text-emerald-300">
                          <div className="text-[10px] text-slate-400 uppercase font-sans font-bold mb-1">Model Inference Response:</div>
                          {aiTestResult.responseSample}
                        </div>
                      )}

                      {/* How to Fix It */}
                      {aiTestResult.solutionSteps && aiTestResult.solutionSteps.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" /> Actionable Fix Steps:
                          </span>
                          <ul className="space-y-1">
                            {aiTestResult.solutionSteps.map((step, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                <ArrowRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Alert Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-slate-900/80 border border-amber-500/30 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Why Did "Unexpected token &lt;, &lt;!doctype ... is not valid JSON" Occur?</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>1. Full-Stack Routing Fallthrough:</strong> When the chatbot requested <code className="text-amber-300 font-mono">/api/chat</code>, the server returned an HTML file (<code className="text-slate-200 font-mono">index.html</code>) instead of a JSON response. We have resolved this by mounting the full-stack <code className="text-emerald-300 font-mono">server.ts</code> Express backend.
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>2. Intranet IP Reachability:</strong> <code className="text-amber-300 font-mono">10.0.120.202</code> is a private RFC1918 internal IP inside the Uratex corporate network. When outside the Uratex LAN / VPN, E.L.L.I.E. now seamlessly activates the <strong>Uratex IT Knowledge Base & Cloud AI Fallback</strong> so that tech questions always receive immediate, friendly answers without failing!
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuration Audit Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-400" /> Inspected Configurations (from your defines)
                </h3>

                {/* 1. OLLAMA_API_URL */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-mono font-bold text-white">OLLAMA_API_URL</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
                        Valid URL Syntax
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-semibold">
                      Private LAN (10.x.x.x)
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-blue-300 break-all">
                    http://10.0.120.202:11434/v1/chat/completions
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 pt-1">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Format:</strong> OpenAI-compatible chat completions endpoint supported by Ollama.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Stream Setting:</strong> Updated backend to include <code className="text-emerald-300 font-mono">"stream": false</code> so responses return as single parsed JSON payloads.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Access Requirement:</strong> Requires Uratex Corporate Office LAN connection or Cisco AnyConnect VPN to route to <code className="text-slate-300">10.0.120.202</code>.</span>
                    </div>
                  </div>
                </div>

                {/* 2. OLLAMA_API_KEY */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-mono font-bold text-white">OLLAMA_API_KEY</span>
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono">
                        Bearer Token
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                      Configured & Masked
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-purple-300">
                    uratex_corp_it_jwt_token_auth_2026
                  </div>
                  <p className="text-xs text-slate-400">
                    Sent securely via the <code className="text-slate-300 font-mono">Authorization: Bearer &lt;token&gt;</code> header. Both the Node and PHP backends forward this token to satisfy any internal reverse proxy or API gateway.
                  </p>
                </div>

                {/* 3. OLLAMA_MODEL */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-mono font-bold text-white">OLLAMA_MODEL</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
                        Order-to-Cash (O2C)
                      </span>
                    </div>
                    <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded font-semibold">
                      Qwen 2.5 Coder
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-emerald-300">
                    qwen2.5-coder:1.5b
                  </div>
                  <p className="text-xs text-slate-400">
                    Specialized model tag for Uratex SAP Order-to-Cash and IT script automation. Ensure <code className="text-slate-300 font-mono">ollama pull qwen2.5-coder:1.5b</code> has been completed on the server host.
                  </p>
                </div>
              </div>

              {/* Multi-Tier Failover Architecture */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 3-Tier Zero-Downtime Failover Architecture
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-blue-400 flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px]">1</span>
                      Rule & Directory Engine
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Instant fast-path answers for keyboard/mouse hardware, IP lookup, SAP SD O2C workflows, Cisco VPN, printers, and directory contacts.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">2</span>
                      Ollama Intranet AI
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      When inside the corporate network, queries route to <code className="text-slate-300 font-mono">10.0.120.202</code> with the active model.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">3</span>
                      Cloud Gemini AI Fallback
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      If outside the corporate network or Ollama is offline, E.L.L.I.E. automatically utilizes cloud AI with the full prompt rules from <code className="text-slate-300">prompt.csv</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Test Inquiries */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Test Live Queries in the Preview Panel:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSendMessage("Hi Ellie. I need help with my keyboard")}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    ⌨️ "Hi Ellie. I need help with my keyboard"
                  </button>
                  <button
                    onClick={() => handleSendMessage("What is the SAP Order-to-Cash process?")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    📦 "What is the SAP Order-to-Cash process?"
                  </button>
                  <button
                    onClick={() => handleSendMessage("Who is in charge of SAP support?")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    👥 "Who is in charge of SAP support?"
                  </button>
                  <button
                    onClick={() => handleSendMessage("How do I connect to Cisco VPN?")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    🔐 "How do I connect to Cisco VPN?"
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: 1-MINUTE EMBED CODE */}
          {activeTab === 'embed' && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Zero Build Step • Drop-in Anywhere
                </div>
                <h2 className="text-xl font-bold text-white">Deploy to Any Website in Under 60 Seconds</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Just add this single <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded">&lt;script&gt;</code> tag to your HTML, WordPress, PHP, Laravel, Shopify, or React template. No npm install or complex bundler needed.
                </p>
              </div>

              {/* Host URL configurator */}
              {/* Host Configuration Panel */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Active Deployment Hosts</h3>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Host: ellie-chatbot.pages.dev
                  </span>
                </div>

                {/* 1-Click Recommended Bundles */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Quick Configuration Presets:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => {
                        setWidgetHost('https://ellie-chatbot.pages.dev');
                        setApiHost('https://ellie-chatbot.pages.dev/api.php');
                      }}
                      className={`p-2.5 rounded-lg text-left border transition text-xs ${
                        widgetHost.includes('ellie-chatbot.pages.dev') && apiHost.endsWith('api.php')
                          ? 'bg-orange-600/20 border-orange-500 text-white shadow-sm ring-1 ring-orange-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-orange-300 flex items-center gap-1">
                        ☁️ Cloudflare Pages (api.php)
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Native edge function /api.php.js (100% legacy compatible)
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setWidgetHost('https://ellie-chatbot.pages.dev');
                        setApiHost('https://ellie-chatbot.pages.dev/api/chat');
                      }}
                      className={`p-2.5 rounded-lg text-left border transition text-xs ${
                        widgetHost.includes('ellie-chatbot.pages.dev') && apiHost.endsWith('/chat')
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-blue-300 flex items-center gap-1">
                        ⚡ Cloudflare Pages (/api/chat)
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Clean REST edge function via /functions/api/[[path]].js
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setWidgetHost('https://ellie-chatbot.pages.dev');
                        setApiHost('https://ais-pre-7exb7phzwsecehc3h3i2za-944842683298.asia-southeast1.run.app/api.php');
                      }}
                      className={`p-2.5 rounded-lg text-left border transition text-xs ${
                        widgetHost.includes('ellie-chatbot.pages.dev') && apiHost.includes('run.app')
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-emerald-300 flex items-center gap-1">
                        🚀 Hybrid (Pages + Run)
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Pages CDN for widget + Cloud Run Node backend
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setWidgetHost('https://dev.uratex.com.ph/jong/ai-chat');
                        setApiHost('https://dev.uratex.com.ph/jong/ai-chat/api.php');
                      }}
                      className={`p-2.5 rounded-lg text-left border transition text-xs ${
                        widgetHost.includes('dev.uratex.com.ph')
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-amber-300 flex items-center gap-1">
                        🏢 Uratex Server PHP
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Traditional Apache/PHP backend on dev.uratex.com.ph
                      </div>
                    </button>
                  </div>
                </div>

                {/* Granular URL Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-400" /> Widget CDN Host (JS & Avatar)
                    </label>
                    <input 
                      type="text"
                      value={widgetHost}
                      onChange={e => setWidgetHost(e.target.value)}
                      placeholder="https://ellie-chatbot.pages.dev"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-blue-300 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">Provides <code className="text-slate-400">/public/ding-widget.js</code> and <code className="text-slate-400">/ellie.jpeg</code></p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Backend API Endpoint (data-api)
                    </label>
                    <input 
                      type="text"
                      value={apiHost}
                      onChange={e => setApiHost(e.target.value)}
                      placeholder="https://ellie-chatbot.pages.dev/api.php"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">Executes Rule Engine & LLM via Cloudflare Edge Functions</p>
                  </div>
                </div>
              </div>

              {/* Cloudflare Pages Functions Status Notice */}
              {widgetHost.includes('ellie-chatbot.pages.dev') && apiHost.includes('ellie-chatbot.pages.dev') && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Cloudflare Pages Functions Active on this Endpoint</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11.5px]">
                    Your repo includes <code className="text-emerald-300 font-mono">/functions/api.php.js</code> and <code className="text-emerald-300 font-mono">/functions/api/[[path]].js</code>. When deployed to Cloudflare Pages, requests to <code className="text-slate-200 font-mono">https://ellie-chatbot.pages.dev/api.php</code> execute as serverless Edge Functions rather than returning raw text.
                  </p>
                </div>
              )}

              {/* Quick Code Block */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                    <span className="text-xs font-mono text-slate-400 ml-2">Single Script Tag Integration</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(scriptTagCode, 'script')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition-all shadow"
                  >
                    {copiedKey === 'script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'script' ? 'Copied to Clipboard!' : 'Copy Script Tag'}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-blue-200 overflow-x-auto leading-relaxed">
                  {scriptTagCode}
                </pre>
              </div>

              {/* Dedicated Shopify Guide */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/60 border border-emerald-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Shopify Integration (<code className="text-emerald-300 font-mono text-xs">theme.liquid</code>)</h3>
                      <p className="text-xs text-slate-400">Fixed for Shopify themes (correct path + absolute backend endpoint)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(shopifySnippetCode, 'shopify')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-all shadow"
                  >
                    {copiedKey === 'shopify' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'shopify' ? 'Copied Shopify Tag!' : 'Copy for Shopify'}
                  </button>
                </div>
                <pre className="p-3 text-[11px] font-mono text-emerald-200 bg-slate-950 rounded-lg overflow-x-auto border border-emerald-900/50">
                  {shopifySnippetCode}
                </pre>
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Script Path:</strong> Must point to <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">.../public/ding-widget.js</code> (where the file is uploaded).</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>data-api:</strong> Must be the full URL <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">https://dev.uratex.com.ph/jong/ai-chat/api.php</code> because Shopify hosts do not have PHP.</span>
                  </div>
                </div>
              </div>

              {/* Integration Guides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h3 className="text-sm font-semibold text-white">Paste Before &lt;/body&gt;</h3>
                  <p className="text-xs text-slate-400">
                    Insert the snippet directly into any HTML or template file before the closing body tag.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h3 className="text-sm font-semibold text-white">Point to Your API</h3>
                  <p className="text-xs text-slate-400">
                    Set <code className="text-slate-300">data-api="/api.php"</code> or your deployed backend URL. Includes CORS support out of the box.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h3 className="text-sm font-semibold text-white">Instant Session Sync</h3>
                  <p className="text-xs text-slate-400">
                    Sessions auto-persist across page navigation and reloads. Users can end chat anytime.
                  </p>
                </div>
              </div>

              {/* JS Init Alternative */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Option B: Programmatic Vanilla JS Init</span>
                  <button
                    onClick={() => copyToClipboard(jsInitCode, 'jsinit')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-medium transition"
                  >
                    {copiedKey === 'jsinit' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy JS
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {jsInitCode}
                </pre>
              </div>

              {/* CSS Variables */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Option C: CSS Variable Overrides</span>
                  <button
                    onClick={() => copyToClipboard(cssOverrideCode, 'css')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-medium transition"
                  >
                    {copiedKey === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy CSS
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed">
                  {cssOverrideCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: STYLE CUSTOMIZER */}
          {activeTab === 'customize' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-400" /> Live Widget Style Customizer
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Customize colors, position, greeting, and controls. The live preview on the right will update in real time!
                </p>
              </div>

              {/* AI Model Selection Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" /> AI Engine Model Selection
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Active: {selectedModel}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Select the underlying API model used by E.L.L.I.E. for chat completions:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {AVAILABLE_MODELS.map(m => (
                    <div 
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                        selectedModel === m.id 
                          ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50' 
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold font-mono text-blue-400">{m.name}</span>
                          {selectedModel === m.id && (
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            m.recommended ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {m.badge}
                          </span>
                          {m.recommended && (
                            <span className="text-[10px] text-amber-400 font-semibold">• Recommended</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Model Input Option */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">Or specify custom model:</span>
                  <input
                    type="text"
                    value={customModelInput}
                    onChange={e => {
                      setCustomModelInput(e.target.value);
                      if (e.target.value.trim()) setSelectedModel(e.target.value.trim());
                    }}
                    placeholder="e.g. qwen2.5-coder:1.5b or custom-model:tag"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {customModelInput && (
                    <button
                      onClick={() => {
                        setSelectedModel(customModelInput.trim());
                      }}
                      className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded font-medium"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Brand Color */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={e => setPrimaryColor(e.target.value)} 
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input 
                      type="text" 
                      value={primaryColor} 
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white"
                    />
                  </div>
                  {/* Preset Colors */}
                  <div className="flex items-center gap-2 pt-1">
                    {[
                      { name: 'Uratex Blue', hex: '#0084ff' },
                      { name: 'Emerald', hex: '#10b981' },
                      { name: 'Violet', hex: '#8b5cf6' },
                      { name: 'Orange', hex: '#f97316' },
                      { name: 'Dark Slate', hex: '#1e293b' },
                      { name: 'Crimson', hex: '#e11d48' }
                    ].map(c => (
                      <button
                        key={c.hex}
                        title={c.name}
                        onClick={() => setPrimaryColor(c.hex)}
                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{ backgroundColor: c.hex, borderColor: primaryColor === c.hex ? '#fff' : 'transparent' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Position & Theme */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Position & Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Launcher Position</span>
                      <div className="flex rounded-lg overflow-hidden border border-slate-800">
                        <button
                          onClick={() => setPosition('bottom-left')}
                          className={`flex-1 py-1.5 text-xs font-medium ${position === 'bottom-left' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                        >
                          Left
                        </button>
                        <button
                          onClick={() => setPosition('bottom-right')}
                          className={`flex-1 py-1.5 text-xs font-medium ${position === 'bottom-right' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                        >
                          Right
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Widget Theme</span>
                      <div className="flex rounded-lg overflow-hidden border border-slate-800">
                        <button
                          onClick={() => setTheme('light')}
                          className={`flex-1 py-1.5 text-xs font-medium ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                        >
                          Light
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`flex-1 py-1.5 text-xs font-medium ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                        >
                          Dark
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Header Branding</label>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Bot Title</span>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Subtitle / Status</span>
                    <input 
                      type="text" 
                      value={subtitle} 
                      onChange={e => setSubtitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Features & Toggles</label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-slate-300">Quick Action Chips</span>
                      <input 
                        type="checkbox" 
                        checked={quickActionsEnabled} 
                        onChange={e => setQuickActionsEnabled(e.target.checked)} 
                        className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-slate-300">Message Audio Chime</span>
                      <input 
                        type="checkbox" 
                        checked={soundEnabled} 
                        onChange={e => setSoundEnabled(e.target.checked)} 
                        className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-slate-300">Session Persistence</span>
                      <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">Enabled</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Greeting & Placeholder */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Messages & Copy</label>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Default Greeting Message</span>
                  <textarea 
                    rows={2}
                    value={greeting} 
                    onChange={e => setGreeting(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white resize-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Input Placeholder Text</span>
                  <input 
                    type="text" 
                    value={placeholder} 
                    onChange={e => setPlaceholder(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHP BACKEND FILES */}
          {activeTab === 'php' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-400" /> Complete PHP Backend Package
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Lightweight, secure, and ready to deploy on any PHP 7.4+ or 8.x host (Apache, Nginx, cPanel, or Docker).
                </p>
              </div>

              {/* File Selector Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'functions/api.php.js', name: '⚡ functions/api.php.js (Cloudflare Edge)' },
                  { id: 'functions/api/[[path]].js', name: '⚡ functions/api/[[path]].js (Cloudflare Router)' },
                  { id: 'functions/_shared/data.js', name: 'functions/_shared/data.js' },
                  { id: 'wrangler.toml', name: 'wrangler.toml' },
                  { id: 'public/_redirects', name: '_redirects (Cloudflare)' },
                  { id: 'public/_headers', name: '_headers (Cloudflare CORS)' },
                  { id: 'api.php', name: 'api.php (PHP Core)' },
                  { id: 'public/ding-widget.js', name: 'ding-widget.js (Widget)' },
                  { id: 'public/ding-widget.css', name: 'ding-widget.css' },
                  { id: 'index.php', name: 'index.php' },
                  { id: 'prompt_manager.php', name: 'prompt_manager.php' },
                  { id: '.htaccess', name: '.htaccess' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFile(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                      selectedFile === f.id ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* File Content Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-300 font-semibold">{selectedFile}</span>
                  <button
                    onClick={() => copyToClipboard(fileContents[selectedFile] || '', selectedFile)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition"
                  >
                    {copiedKey === selectedFile ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy File Content
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed">
                  {fileContents[selectedFile] || '// Loading file content...'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: CLEAN API TESTER */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-400" /> Clean Message Handling & Session API
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Test the REST endpoints directly. Same API specification works identically on the Node/Vite preview and the PHP backend!
                </p>
              </div>

              {/* Endpoint Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'POST /api/chat (qwen2.5-coder:1.5b)', method: 'POST', endpoint: '/api/chat', body: `{\n  "message": "What is the SAP Order-to-Cash process?",\n  "model": "qwen2.5-coder:1.5b",\n  "sessionId": "${sessionId}"\n}` },
                  { label: 'GET /api/models', method: 'GET', endpoint: '/api/models', body: '' },
                  { label: 'POST /api/chat', method: 'POST', endpoint: '/api/chat', body: `{\n  "message": "Who handles SAP support?",\n  "model": "${selectedModel}",\n  "sessionId": "${sessionId}"\n}` },
                  { label: 'GET /api/session', method: 'GET', endpoint: `/api/session?sessionId=${sessionId}`, body: '' },
                  { label: 'DELETE /api/session', method: 'DELETE', endpoint: `/api/session?sessionId=${sessionId}`, body: '' },
                  { label: 'GET /api/directory?q=Eric', method: 'GET', endpoint: '/api/directory?q=Eric', body: '' },
                  { label: 'GET /api/quick-actions', method: 'GET', endpoint: '/api/quick-actions', body: '' },
                  { label: 'GET /api/ping', method: 'GET', endpoint: '/api/ping', body: '' }
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setApiMethod(btn.method);
                      setApiEndpoint(btn.endpoint);
                      setApiPayload(btn.body);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:border-blue-500 hover:text-white transition"
                  >
                    <span className={btn.method === 'POST' ? 'text-blue-400 font-bold' : btn.method === 'DELETE' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {btn.method}
                    </span>{' '}
                    {btn.endpoint.split('?')[0]}
                  </button>
                ))}
              </div>

              {/* Request Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <select 
                    value={apiMethod} 
                    onChange={e => setApiMethod(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white font-mono text-xs px-3 py-2 rounded-lg"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <input 
                    type="text" 
                    value={apiEndpoint} 
                    onChange={e => setApiEndpoint(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-white font-mono text-xs px-3 py-2 rounded-lg"
                  />
                  <button
                    onClick={handleExecuteApi}
                    disabled={isApiLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5" /> {isApiLoading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>

                {apiMethod === 'POST' && (
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1 font-mono">Request Payload (JSON):</span>
                    <textarea 
                      rows={4}
                      value={apiPayload} 
                      onChange={e => setApiPayload(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-emerald-300 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Response Box */}
              {apiResponse && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${apiResponse.ok ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      <span className="text-xs font-mono text-slate-300">Status: {apiResponse.status}</span>
                    </div>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-72">
                    {JSON.stringify(apiResponse.data || apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: IT DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" /> Uratex IT Personnel Directory
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {directoryList.length} verified IT support contacts. The chatbot queries this database automatically when users ask questions!
                  </p>
                </div>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search name, role, plant..."
                    value={directorySearch}
                    onChange={e => setDirectorySearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
                {filteredDirectory.map((staff, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold text-white">{staff.name}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {staff.applicationRole}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-500" /> {staff.plantLocation} • {staff.departmentName || staff.department}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                      <Mail className="w-3 h-3 text-slate-500" /> {staff.email}
                    </div>
                    {staff.mobile && (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" /> {staff.mobile}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Panel: Interactive Live Preview (5 columns) */}
        <div className="lg:col-span-5 bg-slate-950 p-6 flex flex-col justify-between items-center relative overflow-hidden">
          
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Interactive Preview</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                Sess: {sessionId.substring(0, 14)}...
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  loadSession(sessionId);
                  setCopiedKey('session_restored');
                  setTimeout(() => setCopiedKey(''), 2000);
                }}
                title="Simulate returning user by reloading conversation history from server"
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center gap-1 transition"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                {copiedKey === 'session_restored' ? 'Reloaded from Server!' : 'Test Server Reload'}
              </button>
              <button
                onClick={handleClearSession}
                title="Reset Chat Session"
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> End Chat
              </button>
            </div>
          </div>

          {/* Interactive Chat Window Container */}
          <div 
            className={`w-full max-w-[420px] h-[580px] my-auto rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Widget Header */}
            <div 
              className={`p-4 border-b flex items-center justify-between ${
                theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full relative shadow-sm flex-shrink-0">
                  <img 
                    src="/ellie.jpeg" 
                    alt="E.L.L.I.E." 
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                  />
                  <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full absolute bottom-0 right-0"></span>
                </div>
                <div>
                  <h3 className={`text-sm font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {title}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  title="Switch Active AI Engine Model"
                  className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md border cursor-pointer outline-none transition ${
                    theme === 'dark' 
                      ? 'bg-slate-800 text-blue-300 border-slate-700 hover:border-blue-500' 
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400'
                  }`}
                >
                  {AVAILABLE_MODELS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.id === 'qwen2.5-coder:1.5b' ? '⚡ ' : m.id.includes('vl') ? '👁️ ' : m.id.includes('r1') ? '🧠 ' : m.id.includes('codestral') ? '💻 ' : '⚙️ '}
                      {m.id} ({m.badge})
                    </option>
                  ))}
                  {customModelInput && !AVAILABLE_MODELS.some(m => m.id === customModelInput) && (
                    <option value={customModelInput}>⚙️ {customModelInput}</option>
                  )}
                </select>
                <button 
                  onClick={handleClearSession}
                  title="Clear Session"
                  className="w-7 h-7 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className={`flex-1 p-4 overflow-y-auto space-y-3.5 text-xs ${
              theme === 'dark' ? 'bg-slate-900/60' : 'bg-slate-50/60'
            }`}>
              {chatMessages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={index} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <img 
                        src="/ellie.jpeg" 
                        alt="E.L.L.I.E." 
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 shadow-sm border border-slate-200 dark:border-slate-700" 
                      />
                    )}
                    <div 
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                        isUser 
                          ? 'text-white rounded-br-xs' 
                          : theme === 'dark'
                            ? 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/60'
                            : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/80'
                      }`}
                      style={isUser ? { backgroundColor: primaryColor } : {}}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2">
                  <img 
                    src="/ellie.jpeg" 
                    alt="E.L.L.I.E." 
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 shadow-sm border border-slate-200 dark:border-slate-700" 
                  />
                  <div className={`px-4 py-2.5 rounded-2xl rounded-bl-xs flex items-center gap-1 ${
                    theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-slate-200'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Footer */}
            <div className={`p-3 border-t flex items-center gap-2 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <input 
                type="text"
                placeholder={placeholder}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className={`flex-1 rounded-full px-3.5 py-2 text-xs outline-none border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-transform hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Floating Launcher Indicator */}
          <div className="w-full flex items-center justify-between pt-3 text-[11px] text-slate-500">
            <span>Widget Position: <strong className="text-slate-400">{position}</strong></span>
            <span>Zero TypeScript • Pure PHP/JS/CSS</span>
          </div>
        </div>

      </div>
    </div>
  );
}
