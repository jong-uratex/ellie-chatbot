import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configurations
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://10.0.120.202:11434/v1/chat/completions';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || 'uratex_corp_it_jwt_token_auth_2026';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:1.5b';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Initialize Gemini if key is provided
let geminiClient: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI();
  } catch (e) {
    console.warn('Failed to initialize Gemini AI client:', e);
  }
}

// In-memory sessions store
const sessions = new Map<string, { sessionId: string; history: any[]; createdAt: number; updatedAt?: number }>();

// Security & CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Session-Id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static widget files and images
app.use(express.static(path.resolve(__dirname, 'public')));
app.get('/ellie.jpeg', (req, res) => {
  const p = path.resolve(__dirname, 'ellie.jpeg');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.sendStatus(404);
});

// Helpers
function loadPrompts(): { id: string; role: string; content: string; name: string }[] {
  try {
    const csvPath = path.resolve(__dirname, 'prompt.csv');
    if (!fs.existsSync(csvPath)) return [];
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    if (lines.length < 2) return [];

    const prompts: { id: string; role: string; content: string; name: string }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Match CSV columns
      const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (cols && cols.length >= 6) {
        const id = cols[0].replace(/^"|"$/g, '').trim();
        const role = cols[3].replace(/^"|"$/g, '').trim();
        const body = cols[4].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        const active = cols[5].replace(/^"|"$/g, '').trim();
        if (active === 'true' && body) {
          prompts.push({ id, role: role || 'system', content: body, name: cols[2] || id });
        }
      }
    }
    return prompts;
  } catch (e) {
    return [];
  }
}

function loadDirectory(): any[] {
  try {
    const dirPath = path.resolve(__dirname, 'directory.json');
    if (!fs.existsSync(dirPath)) return [];
    return JSON.parse(fs.readFileSync(dirPath, 'utf8'));
  } catch (e) {
    return [];
  }
}

function handleItKnowledge(message: string, ip: string): string | null {
  const lower = (message || '').toLowerCase().trim();

  // 1. IP check
  if (lower.includes("what's my ip") || lower.includes("what is my ip") || lower === "my ip" || lower.includes("my ip address")) {
    return `🌐 **Your Detected IP Address Information**:\n\n` +
           `• Client IP: \`${ip || '127.0.0.1'}\`\n` +
           `• Network: Uratex Corporate Intranet / Local Access\n` +
           `• Domain Controller: DC01-VAL (Active Directory)\n` +
           `• Gateway: Uratex Corporate Core Gateway\n\n` +
           `For static IP assignments or VLAN routing, please contact Tech Luzon Ext. 4401.`;
  }

  // 2. Keyboard & Mouse (Rule 7: Hardware)
  if (lower.includes("keyboard") || lower.includes("keys") || lower.includes("mouse") || lower.includes("typing") || lower.includes("numlock") || lower.includes("capslock")) {
    return `⌨️ **Keyboard & Peripheral Troubleshooting (Rule 7: Safe Hardware Check)**:\n\n` +
           `1. **Re-plug USB Connection**: Unplug your keyboard cable (or 2.4GHz wireless USB receiver) and firmly reconnect it into a different USB port directly on the PC/dock.\n` +
           `2. **Battery & Power Check**: If you use a wireless keyboard/mouse, ensure the bottom power switch is ON and replace the AA/AAA batteries.\n` +
           `3. **Key Lock Indicator**: Press \`Num Lock\` and \`Caps Lock\` to see if the status indicator LEDs light up. If pressing letters outputs numbers, press \`Fn + Num Lock\`.\n` +
           `4. **Reboot Test**: Save open files and restart your workstation (\`Win\` > Power > Restart).\n` +
           `5. **Device Manager Driver Refresh**: Right-click Start > **Device Manager** > expand *Keyboards* > right-click your keyboard > select *Uninstall device*, then click *Action > Scan for hardware changes*.\n\n` +
           `If physical liquid was spilled or keys are physically damaged, contact your local plant IT support or call **Ext. 4401** for an IT replacement ticket.`;
  }

  // 3. Ding quote
  if (lower.includes("ang bato") || lower.includes("bato") || lower === "ding") {
    const quotes = [
      `⚡ *"Ding, ang bato!"* — Transforming caffeine into bug-free code and 99.9% network uptime! Keep conquering the workday!`,
      `🛡️ *"Ding, ang bato!"* — To battle against printer jams, BSODs, and forgotten passwords! Stand firm, Tech Warrior!`,
      `🚀 *"Ding, ang bato!"* — No glitch is too big for the Uratex IT Ninjas! Have you rebooted before you panic? Power on!`,
      `🌟 *"Ding, ang bato!"* — Great software isn't just written, it is built with resilience and grit. Let's finish today strong!`
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // 4. Live tech support
  if (lower === "live tech support" || (lower.includes("tech support") && lower.length < 25)) {
    return `📞 **Uratex Live IT Tech Support Contacts**:\n\n` +
           `• **Help Desk Local Ext:** \`4401\`\n` +
           `• **Support Manager:** Eric Borromeo (\`0917-822-4595\` / \`eric.borromeo@uratex.com.ph\`)\n` +
           `• **Tech Luzon Specialists:** Joel Genaloc, Daniel Fabon, Aaron Bernardo\n` +
           `• **Tech VisMin Specialists:** Glecer Jay Pejana (Cebu), Joselito Cobaria (CDO), Glenn Fernandez (Davao)\n\n` +
           `Would you like me to look up contact info for someone specific?`;
  }

  // 5. Directory Search
  const dir = loadDirectory();
  const searchTerms = ['who is', 'contact for', 'email of', 'phone of', 'mobile of', 'dev', 'developer', 'bsa', 'manager', 'cebu', 'cdo', 'davao', 'plaridel', 'valenzuela'];
  const hasSearch = searchTerms.some(t => lower.includes(t));

  if (hasSearch && dir.length > 0) {
    const q = lower
      .replace(/who is|contact for|email of|phone of|mobile of|please|tell me about|in the|who are the members of the/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

    const matched = dir.filter(p => {
      const name = (p.name || '').toLowerCase();
      const role = (p.applicationRole || '').toLowerCase();
      const dept = (p.departmentName || p.department || '').toLowerCase();
      const plant = (p.plantLocation || '').toLowerCase();
      const email = (p.email || '').toLowerCase();

      const words = q.split(/\s+/).filter(w => w.length > 2);
      const matchesWords = words.length > 0 && words.some(w => name.includes(w) || role.includes(w) || dept.includes(w));

      return name.includes(q) || role.includes(q) || dept.includes(q) || plant.includes(q) || email.includes(q) || matchesWords;
    });

    if (matched.length > 0) {
      const count = Math.min(4, matched.length);
      let reply = `🔍 **Uratex IT Directory Search Results (${matched.length} found):**\n\n`;
      for (let i = 0; i < count; i++) {
        const item = matched[i];
        reply += `**${item.name}**\n` +
                 `• Role: ${item.applicationRole || 'IT Staff'}\n` +
                 `• Dept: ${item.departmentName || item.department}\n` +
                 `• Location: ${item.plantLocation}\n` +
                 `• Email: \`${item.email}\`\n` +
                 (item.mobile ? `• Mobile: \`${item.mobile}\`\n` : '') + `\n`;
      }
      if (matched.length > count) {
        reply += `_...and ${matched.length - count} more matching staff. You can filter by name, plant, or specialization._`;
      }
      return reply.trim();
    }
  }

  // 6. Order-to-Cash (O2C) Knowledge
  if (lower.includes('ellie') && (lower.includes('o2c') || lower.includes('order to cash') || lower.includes('va01') || lower.includes('vf01') || lower.includes('sales order'))) {
    return `📦 **E.L.L.I.E. • Uratex Order-to-Cash (O2C) Enterprise Assistant**:\n\n` +
           `• **Order-to-Cash (O2C) Lifecycle**:\n` +
           `   1. **Sales Order Creation**: Transaction \`VA01\` / \`VA02\` (Verify customer PO, sales area, pricing conditions).\n` +
           `   2. **Credit Limit Check**: Credit block management via \`VKM1\` / \`VKM3\` and Business Partner (\`BP\` / \`FD32\`).\n` +
           `   3. **Availability & Scheduling (ATP)**: Check plant stock and foam production availability (\`CO09\`).\n` +
           `   4. **Outbound Delivery**: Transaction \`VL01N\` / \`VL02N\` with picking, packing, & Post Goods Issue (\`PGI\`).\n` +
           `   5. **Billing & Invoicing**: Billing document generation via \`VF01\` / \`VF02\` & accounting interface (\`F-28\`).\n\n` +
           `• **Plant Locations**: Valenzuela HQ, Muntinlupa, Plaridel, Canlubang, Cebu, Davao.\n` +
           `• **Need Escalation?**: Contact our SAP Business System Analysts (BSA) or Help Desk Ext. 4401.`;
  }

  // 7. SAP inquiry
  if (lower.includes('sap') || lower.includes('s/4hana')) {
    return `📊 **SAP S/4HANA & App Support Team**:\n\n` +
           `• **Manager:** Eric Borromeo (\`eric.borromeo@uratex.com.ph\`)\n` +
           `• **Luzon SAP Support:** Myrna Reyes, Jezalin Mendoza, Meryl Narciso, Ghina Carla Alarcon, Carmina Creus-Munoz, Charissa Salinas, Lanie dela Cruz, Edmar Norona\n` +
           `• **VisMin SAP Support:** Lotchelle Briigoli (Cebu), Aiza Grace Ardon (CDO)\n\n` +
           `For urgent t-code locks or posting errors, please contact your plant SAP representative or Help Desk Ext. 4401.`;
  }

  // 8. VPN
  if (lower.includes('vpn') || lower.includes('cisco')) {
    return `🔐 **Cisco AnyConnect VPN Quick Troubleshooting**:\n\n` +
           `1. Verify internet connectivity is stable.\n` +
           `2. Server Gateway: \`vpn.uratex.com.ph\`\n` +
           `3. Username: Use your standard Active Directory username.\n` +
           `4. If receiving 'Login Failed', verify password has not expired on DC01-VAL domain.\n` +
           `Reach out to Tech Luzon Ext. 4401 if token reset is required.`;
  }

  // 9. Printer
  if (lower.includes('printer') || lower.includes('zebra') || lower.includes('barcode')) {
    return `🖨️ **Printer & Zebra Barcode Troubleshooting**:\n\n` +
           `1. Check power supply, network patch cable, and ribbon feed alignment.\n` +
           `2. For Zebra printers: Perform sensor calibration by pressing and holding Feed until the status LED flashes once.\n` +
           `3. Restart Windows Print Spooler service (\`Win + R\` -> \`services.msc\` -> Print Spooler -> Restart).\n` +
           `For physical hardware replacement, call your plant IT technician.`;
  }

  // 10. Uratex Email Signature Generator (Rule 12)
  if (lower.includes('signature') || lower.includes('email signature') || lower.includes('generator') || lower.includes('email-signature')) {
    return `✉️ **How to Use the Uratex Email Signature Generator (https://email-signature-4ti.pages.dev)**:\n\n` +
           `1. **Fill out User Information**: Enter your Full Name, Job Title, Department, Contact Number, and official Uratex email address in the form.\n` +
           `2. **Select Company Entity & Office Address**: Choose your affiliate (e.g., \`MULTIFLEX RNC PHILS., INC.\`) and official Plant / Office location from the dropdowns.\n` +
           `3. **Check Live Preview**: Confirm that your name, Uratex branding logo, and Data Privacy Act (NPC) disclaimer render properly in the preview.\n` +
           `4. **Click "COPY SIGNATURE"**: Click the green **Copy Signature** button above the preview box.\n` +
           `5. **Paste in Your Email Client**:\n` +
           `   • **Gmail / Google Workspace**: Go to Settings (⚙️) > *See all settings* > *General* > scroll down to *Signature* > paste (\`Ctrl + V\`) > Save Changes.\n` +
           `   • **Outlook Desktop / M365**: File > Options > Mail > *Signatures* > paste and set as default for new messages.\n\n` +
           `_Note: Please do not manually remove the official Data Privacy Act disclaimer from your signature._`;
  }

  return null;
}

// Unified API Handler (Handles both /api/* and /api.php?action=*)
async function handleApi(req: express.Request, res: express.Response) {
  const url = new URL(req.originalUrl, `http://${req.headers.host || 'localhost'}`);
  const action = (url.searchParams.get('action') || req.body?.action || req.path.replace(/^\/api\/?/, '') || 'ping').toLowerCase();
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  // 1. PING
  if (action === 'ping' || req.path === '/api/ping') {
    return res.json({
      status: 'online',
      service: 'E.L.L.I.E. Chatbot API & Full-Stack Engine',
      version: '3.1.0',
      timestamp: Date.now(),
      capabilities: ['session_persistence', 'directory_search', 'ollama_inference', 'gemini_fallback', 'rule_engine']
    });
  }

  // 2. DIAGNOSTICS & CONFIG VERIFICATION
  if (action === 'check_config' || action === 'diagnostics' || req.path === '/api/check-config') {
    let host = '';
    let port = 11434;
    let isPrivate = false;
    try {
      const u = new URL(OLLAMA_API_URL);
      host = u.hostname;
      port = parseInt(u.port, 10) || 11434;
      isPrivate = host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('172.') || host === 'localhost' || host === '127.0.0.1';
    } catch (e) {}

    // Probe Ollama with 1.8s timeout
    let reachable = false;
    let probeError: string | null = null;
    let httpStatus = 0;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      const testRes = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OLLAMA_API_KEY}`
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [{ role: 'user', content: 'ping' }],
          stream: false
        }),
        signal: controller.signal
      });
      clearTimeout(timer);
      httpStatus = testRes.status;
      if (testRes.ok || testRes.status === 200 || testRes.status === 400 || testRes.status === 404) {
        reachable = true;
      }
    } catch (err: any) {
      probeError = err.message || 'Connection timeout';
    }

    return res.json({
      success: true,
      timestamp: Date.now(),
      config: {
        OLLAMA_API_URL: OLLAMA_API_URL,
        OLLAMA_API_KEY: OLLAMA_API_KEY ? `${OLLAMA_API_KEY.substring(0, 10)}...${OLLAMA_API_KEY.substring(OLLAMA_API_KEY.length - 4)}` : 'not_set',
        OLLAMA_MODEL: OLLAMA_MODEL,
        targetHost: host,
        targetPort: port,
        isPrivateNetwork: isPrivate
      },
      diagnostics: {
        reachable,
        httpStatus,
        error: probeError,
        cloudFallback: !!geminiClient ? 'Gemini 3.8 Flash (Active)' : 'Intelligent Rule Engine (Active)',
        networkSummary: isPrivate 
          ? 'Host 10.0.120.202 is an internal Uratex private intranet IP. It connects automatically when inside the corporate LAN or VPN.' 
          : 'Public or reachable host.'
      },
      recommendation: {
        status: reachable ? 'connected' : (isPrivate ? 'intranet_ready' : 'check_endpoint'),
        explanation: reachable 
          ? 'Ollama endpoint is reachable and generating completions.'
          : 'When accessing from outside the Uratex internal network, E.L.L.I.E. automatically activates high-precision IT rule processing and cloud Gemini fallback so users always get instant, accurate help.'
      }
    });
  }

  // 3. MODELS
  if (action === 'models' || action === 'get_models' || req.path === '/api/models') {
    return res.json({
      success: true,
      currentModel: OLLAMA_MODEL,
      models: [
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
      ]
    });
  }

  // 4. SESSION (GET & DELETE)
  if (action === 'session' || action === 'get_session' || req.path === '/api/session') {
    const sid = (url.searchParams.get('sessionId') || req.headers['x-session-id'] || 'default') as string;
    if (req.method === 'DELETE' || action === 'clear_session') {
      sessions.delete(sid);
      return res.json({ success: true, message: 'Session cleared successfully', sessionId: sid });
    }
    const session = sessions.get(sid) || { sessionId: sid, history: [], createdAt: Date.now() };
    return res.json({
      success: true,
      sessionId: sid,
      history: session.history || [],
      restored: (session.history || []).length > 0,
      messageCount: (session.history || []).length,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt || Date.now()
    });
  }

  // 5. DIRECTORY
  if (action === 'directory' || req.path === '/api/directory') {
    const q = (url.searchParams.get('q') || url.searchParams.get('query') || '').toLowerCase().trim();
    const all = loadDirectory();
    const filtered = q ? all.filter(p => {
      return (p.name || '').toLowerCase().includes(q) ||
             (p.applicationRole || '').toLowerCase().includes(q) ||
             (p.departmentName || p.department || '').toLowerCase().includes(q) ||
             (p.plantLocation || '').toLowerCase().includes(q);
    }) : all;
    return res.json({ success: true, count: filtered.length, results: filtered });
  }

  // 6. PROMPTS
  if (action === 'prompts' || req.path === '/api/prompts') {
    try {
      const csvPath = path.resolve(__dirname, 'prompt.csv');
      const content = fs.existsSync(csvPath) ? fs.readFileSync(csvPath, 'utf8') : '';
      return res.json({ success: true, csv: content });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // 7. QUICK ACTIONS
  if (action === 'quick_actions' || action === 'quick-actions' || req.path === '/api/quick-actions') {
    return res.json({
      success: true,
      actions: [
        { id: 'support', label: 'Live Tech Support', icon: 'fa-headset', prompt: 'Live Tech Support' },
        { id: 'ip', label: "What's my IP Address", icon: 'fa-network-wired', prompt: "What's my IP Address" },
        { id: 'kb', label: 'Keyboard / Hardware Help', icon: 'fa-keyboard', prompt: 'Hi Ellie. I need help with my keyboard' },
        { id: 'sap', label: 'SAP S/4HANA Support', icon: 'fa-database', prompt: 'Who is the contact person for SAP Support?' },
        { id: 'o2c', label: 'Order-to-Cash (O2C)', icon: 'fa-box', prompt: 'What is the SAP Order-to-Cash process?' }
      ]
    });
  }

  // 8. FILES
  if (action === 'files' || req.path === '/api/files') {
    const fileName = ((url.searchParams.get('file') as string) || '').replace(/\.\.\//g, '');
    const allowed = [
      'api.php', 'index.php', 'prompt_manager.php', 'prompt.csv', 'directory.json', '.htaccess', 
      'public/ding-widget.js', 'public/ding-widget.css', 'public/_redirects', 'public/_headers',
      'wrangler.toml', 'functions/api.php.js', 'functions/api/[[path]].js', 'functions/_shared/data.js'
    ];
    if (allowed.includes(fileName)) {
      const targetPath = path.resolve(__dirname, fileName);
      if (fs.existsSync(targetPath)) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(fs.readFileSync(targetPath, 'utf8'));
      }
    }
    return res.status(404).json({ error: 'File not found' });
  }

  // 9. CHAT MESSAGE (POST)
  if (action === 'chat' || action === 'send_message' || req.path === '/api/chat' || req.path === '/api.php') {
    const message = (req.body?.message || '').trim();
    const sid = req.body?.sessionId || (req.headers['x-session-id'] as string) || ('ding_' + Date.now().toString(36));
    const model = req.body?.model || OLLAMA_MODEL;

    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    let session = sessions.get(sid);
    if (!session) {
      session = { sessionId: sid, history: [], createdAt: Date.now() };
      sessions.set(sid, session);
    }

    // Add user message to history
    const userMsg = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: message,
      timestamp: Math.floor(Date.now() / 1000)
    };
    session.history.push(userMsg);

    let replyText = '';

    // Step A: Fast path internal IT rules & directory
    const fastReply = handleItKnowledge(message, clientIp);
    if (fastReply) {
      replyText = fastReply;
    } else {
      // Step B: Attempt Ollama Server (Internal Uratex AI endpoint)
      try {
        const prompts = loadPrompts();
        const chatMessages = prompts.map(p => ({ role: p.role, content: p.content }));
        const historySlice = session.history.slice(-8);
        for (const h of historySlice) {
          chatMessages.push({ role: h.role, content: h.content });
        }

        const ollamaRes = await fetch(OLLAMA_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OLLAMA_API_KEY}`
          },
          body: JSON.stringify({
            model: model,
            messages: chatMessages,
            stream: false,
            temperature: 0.7
          }),
          signal: AbortSignal.timeout(1500)
        });

        if (ollamaRes.ok) {
          const data: any = await ollamaRes.json();
          if (data.choices && data.choices[0]?.message?.content) {
            replyText = data.choices[0].message.content.trim();
          } else if (data.message?.content) {
            replyText = data.message.content.trim();
          }
        }
      } catch (ollamaErr) {
        // Ollama is offline or unroutable (e.g. cloud preview outside intranet 10.0.120.202)
      }

      // Step C: Cloud Gemini AI Fallback (using Google GenAI SDK if available)
      if (!replyText && geminiClient) {
        const prompts = loadPrompts();
        const systemInstruction = prompts.map(p => p.content).join('\n\n');
        
        for (const modelCandidate of ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash']) {
          try {
            const geminiResponse = await geminiClient.models.generateContent({
              model: modelCandidate,
              contents: message,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7
              }
            });
            if (geminiResponse.text) {
              replyText = geminiResponse.text.trim();
              break;
            }
          } catch (geminiErr) {
            // Try next candidate or proceed to IT rule fallback
          }
        }
      }

      // Step D: Rule-based fallback if neither external AI responded
      if (!replyText) {
        const nonItWords = ['nba', 'basketball', 'movie', 'cooking', 'recipe', 'girlfriend', 'boyfriend', 'politics', 'sports', 'gossip'];
        if (nonItWords.some(w => message.toLowerCase().includes(w))) {
          replyText = `Hello po! I am E.L.L.I.E. (Employee Link for Learning, Information & IT Essentials), your Uratex IT Helpdesk Assistant. As company policy, I specialize in workplace IT support such as computers, passwords, accounts, M365, networks, VPN, printers, and SAP. How can I assist you with your tech issue today?`;
        } else {
          replyText = `Hello po! I am E.L.L.I.E., your Uratex IT Helpdesk Assistant. I received your inquiry: "${message}".\n\n` +
                      `For immediate technical support, you can reach out to our **Uratex IT Help Desk at Local Ext. 4401** or ask me to check our IT Directory for SAP Support, DEV Software Engineers, or Tech Luzon / VisMin specialists.\n\n` +
                      `How else may I help you with your workstation or system today?`;
        }
      }
    }

    const botMsg = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'assistant',
      content: replyText,
      timestamp: Math.floor(Date.now() / 1000)
    };
    session.history.push(botMsg);
    session.updatedAt = Date.now();

    return res.json({
      success: true,
      sessionId: sid,
      model: model,
      reply: replyText,
      message: botMsg,
      timestamp: botMsg.timestamp,
      quickReplies: []
    });
  }

  return res.status(404).json({ error: 'Endpoint or action not found' });
}

// Bind API routes
app.all('/api.php', handleApi);
app.all('/api/*', handleApi);
app.all('/api', handleApi);

// Handle dev vs prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`E.L.L.I.E. server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server start error:', err);
});
