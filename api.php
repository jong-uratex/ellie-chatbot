<?php
/**
 * E.L.L.I.E. (Employee Link for Learning, Information & IT Essentials) - Chatbot API
 * Clean, lightweight, and secure PHP backend for message handling and session persistence.
 */

// Strict error reporting for debugging, but hide in production
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Security & CORS Headers
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Session-Id');

// Handle preflight CORS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Constants & Configuration
define('STORAGE_DIR', __DIR__ . '/sessions');
define('PROMPT_FILE', __DIR__ . '/prompt.csv');
define('DIRECTORY_FILE', __DIR__ . '/directory.json');
define('MAX_MESSAGE_LENGTH', 2000);
define('MAX_HISTORY_PER_SESSION', 50);

// Default AI Configurations (Can be overridden via environment variables or define)
if (!defined('OLLAMA_API_URL')) {
    define('OLLAMA_API_URL', getenv('OLLAMA_API_URL') ?: 'http://10.0.120.202:11434/v1/chat/completions');
}
if (!defined('OLLAMA_API_KEY')) {
    define('OLLAMA_API_KEY', getenv('OLLAMA_API_KEY') ?: 'uratex_corp_it_jwt_token_auth_2026');
}
if (!defined('OLLAMA_MODEL')) {
    define('OLLAMA_MODEL', getenv('OLLAMA_MODEL') ?: 'qwen2.5-coder:1.5b');
}

$ollamaUrl = OLLAMA_API_URL;
$ollamaKey = OLLAMA_API_KEY;
$ollamaModel = OLLAMA_MODEL;
$geminiKey = getenv('GEMINI_API_KEY') ?: '';

$supportedModels = [
    [
        'id' => 'qwen2.5-coder:1.5b',
        'name' => 'qwen2.5-coder:1.5b',
        'label' => 'Qwen 2.5 Coder (1.5B)',
        'category' => 'SAP / Enterprise ERP',
        'badge' => 'Order-to-Cash',
        'description' => 'Specialized lightweight model for SAP Order-to-Cash (O2C), SD billing, sales orders & IT automation',
        'recommended' => true
    ],
    [
        'id' => 'qwen2.5vl:3b',
        'name' => 'qwen2.5vl:3b',
        'label' => 'Qwen 2.5 VL (3B)',
        'category' => 'Visual Diagnostics',
        'badge' => 'Vision & OCR',
        'description' => 'Vision-language model for troubleshooting error screenshots, hardware photos, and barcode labels'
    ],
    [
        'id' => 'nemotron-mini:4b',
        'name' => 'nemotron-mini:4b',
        'label' => 'Nemotron-Mini (4B)',
        'category' => 'General Corporate IT',
        'badge' => 'Enterprise Helpdesk',
        'description' => 'NVIDIA-optimized fast enterprise helpdesk model for workstations, accounts, and networks'
    ],
    [
        'id' => 'deepseek-r1:8b',
        'name' => 'deepseek-r1:8b',
        'label' => 'DeepSeek-R1 (8B)',
        'category' => 'Complex IT Problem Solving',
        'badge' => 'Reasoning (CoT)',
        'description' => 'High-reasoning model for complex network diagnostics, root-cause investigation, and log analysis'
    ],
    [
        'id' => 'deepseek-coder-v2:16b',
        'name' => 'deepseek-coder-v2:16b',
        'label' => 'DeepSeek Coder v2 (16B)',
        'category' => 'Software & Systems',
        'badge' => 'Deep IT & Architecture',
        'description' => 'Heavyweight 16B parameter model for enterprise systems administration and database debugging'
    ],
    [
        'id' => 'codestral:latest',
        'name' => 'codestral:latest',
        'label' => 'Codestral (Mistral)',
        'category' => 'Automation & Scripting',
        'badge' => 'Mistral Code AI',
        'description' => 'Mistral AI high-performance code model for IT shell scripts, automation pipelines, and API integrations'
    ],
    [
        'id' => 'moondream:latest',
        'name' => 'moondream:latest',
        'label' => 'Moondream',
        'category' => 'Hardware Inspection',
        'badge' => 'Edge Vision',
        'description' => 'Lightweight visual inspection model for verifying patch cables, port connections, and LED indicators'
    ]
];

// Ensure sessions directory exists and is protected
if (!is_dir(STORAGE_DIR)) {
    @mkdir(STORAGE_DIR, 0755, true);
    if (!file_exists(STORAGE_DIR . '/.htaccess')) {
        @file_put_contents(STORAGE_DIR . '/.htaccess', "Deny from all\n");
    }
}

/**
 * Sanitize session ID to prevent path traversal
 */
function sanitize_session_id($id) {
    if (!$id || !is_string($id)) {
        return 'ding_sess_' . bin2hex(random_bytes(8));
    }
    $clean = preg_replace('/[^a-zA-Z0-9_\-]/', '', $id);
    if (empty($clean) || strlen($clean) > 64) {
        return 'ding_sess_' . bin2hex(random_bytes(8));
    }
    return $clean;
}

/**
 * Load session from JSON storage securely
 */
function get_session_data($sessionId) {
    $filePath = STORAGE_DIR . '/' . $sessionId . '.json';
    if (file_exists($filePath) && is_readable($filePath)) {
        $content = @file_get_contents($filePath);
        $data = json_decode($content, true);
        if (is_array($data)) {
            return $data;
        }
    }
    return [
        'sessionId' => $sessionId,
        'createdAt' => time(),
        'updatedAt' => time(),
        'visitor' => [
            'lastSeen' => time(),
            'messageCount' => 0
        ],
        'history' => []
    ];
}

/**
 * Save session data atomically to prevent corruption
 */
function save_session_data($sessionId, $data, $clientIp = '', $userAgent = '') {
    $data['updatedAt'] = time();
    if (!isset($data['visitor'])) {
        $data['visitor'] = [];
    }
    $data['visitor']['lastSeen'] = time();
    $data['visitor']['messageCount'] = count($data['history'] ?? []);
    if ($clientIp) {
        $data['visitor']['ipHash'] = hash('sha256', $clientIp . 'uratex_ding_salt_2026');
    }
    if ($userAgent) {
        $data['visitor']['userAgent'] = substr($userAgent, 0, 150);
    }

    // Trim history to prevent unbounded growth
    if (isset($data['history']) && count($data['history']) > MAX_HISTORY_PER_SESSION) {
        $data['history'] = array_slice($data['history'], -MAX_HISTORY_PER_SESSION);
    }

    $filePath = STORAGE_DIR . '/' . $sessionId . '.json';
    $tmpPath = $filePath . '.' . bin2hex(random_bytes(4)) . '.tmp';
    
    // Write to temp file then rename for atomic safety
    $written = @file_put_contents($tmpPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
    if ($written !== false) {
        @rename($tmpPath, $filePath);
        return true;
    }
    return @file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX) !== false;
}

/**
 * Clean up expired sessions (older than 30 days)
 */
function gc_sessions() {
    if (rand(1, 50) === 1 && is_dir(STORAGE_DIR)) {
        $files = glob(STORAGE_DIR . '/*.json');
        $expiry = time() - (30 * 86400);
        foreach ($files as $f) {
            if (filemtime($f) < $expiry) {
                @unlink($f);
            }
        }
    }
}

/**
 * Load system prompts from prompt.csv
 */
function get_active_prompts() {
    $prompts = [];
    if (!file_exists(PROMPT_FILE) || !is_readable(PROMPT_FILE)) {
        return $prompts;
    }
    if (($handle = fopen(PROMPT_FILE, "r")) !== false) {
        $header = fgetcsv($handle, 2000, ",");
        if ($header !== false) {
            while (($data = fgetcsv($handle, 2000, ",")) !== false) {
                if (count($header) === count($data)) {
                    $row = array_combine($header, $data);
                    $isActive = isset($row['is_active']) && (strcasecmp(trim($row['is_active']), 'true') === 0 || trim($row['is_active']) === '1');
                    if ($isActive && !empty($row['content'])) {
                        $prompts[] = [
                            'id' => $row['id'] ?? '',
                            'role' => !empty($row['role']) ? trim($row['role']) : 'system',
                            'content' => trim($row['content']),
                            'name' => $row['name'] ?? '',
                            'category' => $row['category'] ?? ''
                        ];
                    }
                }
            }
        }
        fclose($handle);
    }
    return $prompts;
}

/**
 * Search the IT Directory
 */
function search_directory($query) {
    if (!file_exists(DIRECTORY_FILE)) return [];
    $raw = @file_get_contents(DIRECTORY_FILE);
    $dir = json_decode($raw, true);
    if (!is_array($dir)) return [];

    $q = trim(strtolower($query));
    if (empty($q)) return array_slice($dir, 0, 15);

    $results = [];
    foreach ($dir as $person) {
        $name = strtolower($person['name'] ?? '');
        $role = strtolower($person['applicationRole'] ?? '');
        $dept = strtolower($person['departmentName'] ?? ($person['department'] ?? ''));
        $plant = strtolower($person['plantLocation'] ?? '');
        $email = strtolower($person['email'] ?? '');

        if (strpos($name, $q) !== false || 
            strpos($role, $q) !== false || 
            strpos($dept, $q) !== false || 
            strpos($plant, $q) !== false ||
            strpos($email, $q) !== false) {
            $results[] = $person;
        }
    }
    return $results;
}

/**
 * Intelligent IT Fallback / Rule-based Responder
 */
function handle_internal_it_rules($message, $userIp) {
    $lower = strtolower(trim($message));

    // What's my IP
    if ($lower === "what's my ip address" || $lower === "what is my ip" || $lower === "my ip" || strpos($lower, "my ip address") !== false) {
        return "🌐 **Your Detected IP Address Information**:\n\n" .
               "• Client IP: `{$userIp}`\n" .
               "• Network Environment: Uratex Corporate Intranet / External Access\n" .
               "• DNS Primary: `10.0.1.10` (DC01-VAL Active Directory)\n" .
               "• Subnet Gateway: Uratex Core Gateway\n\n" .
               "If you are experiencing connection drops or need static IP allocation, please contact Tech Luzon Ext. 4401.";
    }

    // Model Status Check
    if (strpos($lower, "is qwen live") !== false || strpos($lower, "is ollama live") !== false || strpos($lower, "check ai") !== false) {
        return "⚡ **E.L.L.I.E. Model Connectivity Status**:\n\n" .
               "• **Target Model**: `qwen2.5-coder:1.5b` (Uratex SAP O2C)\n" .
               "• **Configured Server**: `http://10.0.120.202:11434`\n" .
               "• **Network Notice**: `10.0.120.202` is a private intranet IP. Public cloud hosts like Cloudflare Pages cannot route directly into private `10.x.x.x` LANs without a Cloudflare Tunnel (`cloudflared`) or public reverse proxy.";
    }

    // Ding! Ang Bato!
    if (strpos($lower, "ang bato") !== false || strpos($lower, "ding! ang bato") !== false || $lower === "ding") {
        $quotes = [
            "⚡ *\"Ding, ang bato!\"* — Transforming caffeine into bug-free code and 99.9% network uptime! Keep conquering the workday!",
            "🛡️ *\"Ding, ang bato!\"* — To battle against printer jams, BSODs, and forgotten passwords! Stand firm, Tech Warrior!",
            "🚀 *\"Ding, ang bato!\"* — No glitch is too big for the Uratex IT Ninjas! Have you rebooted before you panic? Power on!",
            "🌟 *\"Ding, ang bato!\"* — Great software isn't just written, it is built with resilience and grit. Let's finish today strong!"
        ];
        return $quotes[array_rand($quotes)];
    }

    // Live Tech Support Hotline
    if ($lower === "live tech support" || strpos($lower, "tech support") !== false && strlen($lower) < 25) {
        return "📞 **Uratex Live IT Tech Support Contacts**:\n\n" .
               "• **Help Desk Local Ext:** `4401`\n" .
               "• **Support Manager:** Eric Borromeo (`0917-822-4595` / `eric.borromeo@uratex.com.ph`)\n" .
               "• **Tech Luzon Team:** Joel Genaloc, Daniel Fabon, Aaron Bernardo\n" .
               "• **Tech VisMin Team:** Glecer Jay Pejana (Cebu), Joselito Cobaria (CDO), Glenn Fernandez (Davao)\n\n" .
               "Would you like me to look up a specific team member or create a ticket inquiry?";
    }

    // ELLIE / Order-to-Cash (O2C) Knowledge
    if (preg_match('/(ellie|o2c|order to cash|order-to-cash|sales order|va01|va02|billing doc|vl01n|vf01|credit block)/i', $lower)) {
        return "📦 **ellie • Uratex Order-to-Cash (O2C) Assistant**:\n\n" .
               "• **Core Flow**: Inquiry ➔ Quotation ➔ Sales Order (`VA01`/`VA02`) ➔ Credit Check (`BP`/`FD32`) ➔ Outbound Delivery (`VL01N`) ➔ Picking & PGI ➔ Billing Document (`VF01`/`VF02`) ➔ Accounting Receipt (`F-28`).\n" .
               "• **Common Issues**:\n" .
               "   1. **Credit Limit Hold**: Check credit analyst approval via `VKM1` / `VKM3`.\n" .
               "   2. **Delivery Block**: Check shipping point and stock ATP availability (`CO09`).\n" .
               "   3. **Billing Block**: Review sales order header billing block or pricing condition errors (`V/06`).\n" .
               "• **SAP SD Specialist Contacts**: Check IT Directory for SAP Business System Analysts (BSA) or call Help Desk Local Ext. 4401.";
    }

    // Check if user is asking about specific IT Directory personnel or roles
    if (preg_match('/(who is|contact for|email of|phone of|number of|sap support|dev team|developer|bsa|infrastructure)/i', $lower)) {
        // Extract query terms and strip punctuation
        $cleaned = preg_replace('/(who is|contact for|email of|phone of|number of|please|tell me about)/i', '', $lower);
        $cleaned = trim(preg_replace('/[^a-zA-Z0-9\s]/', '', $cleaned));
        $matches = search_directory($cleaned);
        if (!empty($matches)) {
            $count = min(4, count($matches));
            $reply = "🔍 Found " . count($matches) . " matching contact(s) in Uratex IT Directory:\n\n";
            for ($i = 0; $i < $count; $i++) {
                $p = $matches[$i];
                $reply .= "**" . ($p['name'] ?? 'Unknown') . "**\n" .
                          "• Role: " . ($p['applicationRole'] ?? 'N/A') . "\n" .
                          "• Dept: " . ($p['departmentName'] ?? ($p['department'] ?? 'IT')) . "\n" .
                          "• Plant / Office: " . ($p['plantLocation'] ?? 'HQ') . "\n" .
                          "• Email: " . ($p['email'] ?? 'N/A') . "\n" .
                          (!empty($p['mobile']) ? ("• Mobile: " . $p['mobile'] . "\n") : "") . "\n";
            }
            if (count($matches) > $count) {
                $reply .= "_...and " . (count($matches) - $count) . " more contacts available. Ask for specific names or departments!_";
            }
            return trim($reply);
        }
    }

    // SAP or VPN quick troubleshooting
    if (strpos($lower, "vpn") !== false || strpos($lower, "cisco") !== false) {
        return "🔐 **Cisco AnyConnect VPN Quick Troubleshooting**:\n\n" .
               "1. Verify your internet connection is active.\n" .
               "2. Server address: `vpn.uratex.com.ph`\n" .
               "3. Username: Use your Active Directory username (without @uratex.com.ph).\n" .
               "4. If receiving 'Login Failed' or 'Certificate Invalid', disconnect, restart Cisco AnyConnect, and re-enter your AD credentials.\n" .
               "Need direct assistance? Dial Ext. 4401 for Tech Luzon support.";
    }

    // Keyboard / Mouse / Peripheral Troubleshooting (Rule 7: Hardware)
    if (strpos($lower, "keyboard") !== false || strpos($lower, "keys") !== false || strpos($lower, "mouse") !== false) {
        return "⌨️ **Keyboard & Peripheral Troubleshooting (Rule 7: Safe Hardware Check)**:\n\n" .
               "1. **Re-plug USB Connection**: Unplug your keyboard cable (or 2.4GHz wireless USB receiver) and firmly reconnect it into a different USB port directly on the PC/dock.\n" .
               "2. **Battery Check**: If you are using a wireless keyboard/mouse, check if the power switch is ON and replace the AA/AAA batteries.\n" .
               "3. **Sticky Keys / Lock Check**: Press the `Num Lock` and `Caps Lock` keys to verify if the status LEDs respond. If some keys are typing numbers instead of letters, press `Fn + Num Lock`.\n" .
               "4. **Reboot Test**: Save your work and restart your workstation (`Win` > Power > Restart).\n" .
               "5. **Device Manager Driver Refresh**: Right-click Start > **Device Manager** > expand *Keyboards* > right-click your keyboard > select *Uninstall device*, then click *Action > Scan for hardware changes*.\n\n" .
               "If physical liquid was spilled or keys are physically broken, contact your local plant IT support or call **Ext. 4401** for an IT replacement ticket.";
    }

    if (strpos($lower, "printer") !== false || strpos($lower, "zebra") !== false) {
        return "🖨️ **Printer & Zebra Barcode Troubleshooting**:\n\n" .
               "1. Check printer power & paper/ribbon feed status LED.\n" .
               "2. Ensure network cable or USB connection is secure.\n" .
               "3. For Zebra printers: Perform sensor calibration by holding the Feed button until it flashes once.\n" .
               "4. Restart the Windows Print Spooler service (`services.msc` -> Print Spooler -> Restart).\n" .
               "If hardware failure persists, contact your plant Tech Luzon / VisMin specialist.";
    // Uratex Email Signature Generator (Rule 12)
    if (strpos($lower, "signature") !== false || strpos($lower, "generator") !== false || strpos($lower, "email-signature") !== false || strpos($lower, "email signature") !== false) {
        return "✉️ **How to Use the Uratex Email Signature Generator (https://email-signature-4ti.pages.dev)**:\n\n" .
               "1. **Fill out User Information**: Enter your Full Name, Job Title, Department, Contact Number, and official Uratex email address in the left form.\n" .
               "2. **Select Company Entity & Office Address**: Choose your affiliate (e.g., `MULTIFLEX RNC PHILS., INC.`) and official Plant / Office location from the dropdowns.\n" .
               "3. **Check Live Preview**: Confirm that your name, Uratex branding logo, and Data Privacy Act (NPC) disclaimer render properly in the preview.\n" .
               "4. **Click \"COPY SIGNATURE\"**: Click the green **Copy Signature** button above the preview box.\n" .
               "5. **Paste in Your Email Client**:\n" .
               "   • **Gmail / Google Workspace**: Go to Settings (⚙️) > *See all settings* > *General* > scroll down to *Signature* > paste (`Ctrl + V`) > Save Changes.\n" .
               "   • **Outlook Desktop / M365**: File > Options > Mail > *Signatures* > paste and set as default for new messages.\n\n" .
               "_Note: Please do not manually remove the official Data Privacy Act disclaimer from your signature._";
    }

    return null;
}

// -------------------------------------------------------------
// ROUTER & ACTION DISPATCHER
// -------------------------------------------------------------
$action = $_GET['action'] ?? ($_POST['action'] ?? 'ping');
$clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
if (strpos($clientIp, ',') !== false) {
    $clientIp = trim(explode(',', $clientIp)[0]);
}

// 1. PING / STATUS
if ($action === 'ping') {
    echo json_encode([
        'status' => 'online',
        'service' => 'E.L.L.I.E. Chatbot API',
        'version' => '3.0.0',
        'timestamp' => time(),
        'capabilities' => ['session_persistence', 'directory_search', 'prompt_manager', 'script_widget']
    ]);
    exit;
}

// 1.1 GET AVAILABLE AI MODELS
if ($action === 'models' || $action === 'get_models') {
    echo json_encode([
        'success' => true,
        'currentModel' => $ollamaModel,
        'models' => $supportedModels
    ]);
    exit;
}

// 1.2 DIAGNOSTICS & CONFIG VERIFICATION
if ($action === 'check_config' || $action === 'diagnostics') {
    $parsedUrl = parse_url($ollamaUrl);
    $host = $parsedUrl['host'] ?? '';
    $port = $parsedUrl['port'] ?? 11434;
    $isPrivateIp = filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;

    // Quick connectivity probe with 2.0s timeout
    $reachable = false;
    $errorMsg = null;
    $ch = curl_init($ollamaUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if (!$curlErr && ($httpCode === 200 || $httpCode === 405 || $httpCode === 404)) {
        $reachable = true;
    } else {
        $errorMsg = $curlErr ?: ("HTTP " . $httpCode);
    }

    echo json_encode([
        'success' => true,
        'timestamp' => time(),
        'config' => [
            'OLLAMA_API_URL' => $ollamaUrl,
            'OLLAMA_API_KEY' => !empty($ollamaKey) ? (substr($ollamaKey, 0, 8) . '...' . substr($ollamaKey, -4)) : 'not_set',
            'OLLAMA_MODEL' => $ollamaModel,
            'isPrivateNetwork' => $isPrivateIp,
            'targetHost' => $host,
            'targetPort' => $port,
        ],
        'network' => [
            'reachable' => $reachable,
            'httpCode' => $httpCode,
            'error' => $errorMsg,
            'note' => $isPrivateIp ? 'IP 10.0.120.202 is an internal Uratex intranet address. Requires Uratex LAN / VPN to reach.' : 'Public route'
        ],
        'recommendation' => [
            'status' => $reachable ? 'connected' : ($isPrivateIp ? 'intranet_only' : 'offline'),
            'message' => $reachable ? 'Ollama endpoint is reachable and ready.' : 'Ollama endpoint 10.0.120.202 is inside Uratex corporate intranet. The system will use intelligent IT rule-based answers and cloud fallback when outside the company network.'
        ]
    ]);
    exit;
}

// 2. GET SESSION HISTORY
if ($action === 'session' || $action === 'get_session') {
    gc_sessions();
    $sessionId = sanitize_session_id($_GET['sessionId'] ?? ($_SERVER['HTTP_X_SESSION_ID'] ?? ''));
    $session = get_session_data($sessionId);
    $history = $session['history'] ?? [];
    echo json_encode([
        'success' => true,
        'sessionId' => $sessionId,
        'history' => $history,
        'restored' => !empty($history),
        'messageCount' => count($history),
        'createdAt' => $session['createdAt'] ?? time(),
        'updatedAt' => $session['updatedAt'] ?? time()
    ]);
    exit;
}

// 3. CLEAR SESSION
if (($action === 'clear_session' || $action === 'session') && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $sessionId = sanitize_session_id($_GET['sessionId'] ?? ($_SERVER['HTTP_X_SESSION_ID'] ?? ''));
    $filePath = STORAGE_DIR . '/' . $sessionId . '.json';
    if (file_exists($filePath)) {
        @unlink($filePath);
    }
    echo json_encode([
        'success' => true,
        'message' => 'Session cleared successfully',
        'sessionId' => $sessionId
    ]);
    exit;
}

// 4. DIRECTORY SEARCH
if ($action === 'directory') {
    $query = $_GET['q'] ?? ($_GET['query'] ?? '');
    $results = search_directory($query);
    echo json_encode([
        'success' => true,
        'count' => count($results),
        'results' => $results
    ]);
    exit;
}

// 5. GET PROMPTS
if ($action === 'prompts' || $action === 'get_prompts') {
    $prompts = get_active_prompts();
    echo json_encode([
        'success' => true,
        'prompts' => $prompts
    ]);
    exit;
}

// 6. QUICK ACTIONS LIST
if ($action === 'quick_actions') {
    echo json_encode([
        'success' => true,
        'actions' => [
            ['id' => 'support', 'label' => 'Live Tech Support', 'icon' => 'fa-headset', 'prompt' => 'Live Tech Support'],
            ['id' => 'ip', 'label' => "What's my IP Address", 'icon' => 'fa-network-wired', 'prompt' => "What's my IP Address"],
            ['id' => 'bato', 'label' => 'Ding! Ang Bato!', 'icon' => 'fa-bolt', 'prompt' => 'Ding! Ang Bato!'],
            ['id' => 'sap', 'label' => 'SAP S/4HANA Support', 'icon' => 'fa-database', 'prompt' => 'Who is the contact person for SAP Support?'],
            ['id' => 'dev', 'label' => 'Software DEV Team', 'icon' => 'fa-code', 'prompt' => 'Who are the members of the Software Developer DEV team?']
        ]
    ]);
    exit;
}

// 7. SEND MESSAGE / CHAT (POST)
if ($action === 'chat' || $action === 'send_message') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (!$input || empty($input['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Message is required']);
        exit;
    }

    $userMessage = trim(substr($input['message'], 0, MAX_MESSAGE_LENGTH));
    $sessionId = sanitize_session_id($input['sessionId'] ?? ($_GET['sessionId'] ?? ($_SERVER['HTTP_X_SESSION_ID'] ?? '')));
    $requestedModel = trim($input['model'] ?? ($_GET['model'] ?? $ollamaModel));
    if (empty($requestedModel)) {
        $requestedModel = $ollamaModel;
    }

    // Retrieve or create session
    $session = get_session_data($sessionId);

    // Append user message
    $now = time();
    $userMsgObj = [
        'id' => 'msg_' . bin2hex(random_bytes(6)),
        'role' => 'user',
        'content' => $userMessage,
        'timestamp' => $now
    ];
    $session['history'][] = $userMsgObj;

    // Check fast-path internal IT rules & directory first
    $instantReply = handle_internal_it_rules($userMessage, $clientIp);
    $replyText = '';

    if ($instantReply !== null) {
        $replyText = $instantReply;
    } else {
        // Attempt AI Server (Ollama / OpenAI-compatible endpoint)
        $systemPrompts = get_active_prompts();
        $chatMessages = [];

        // Build messages array
        foreach ($systemPrompts as $p) {
            $chatMessages[] = [
                'role' => $p['role'],
                'content' => $p['content']
            ];
        }

        // Add history (last 10 messages for context)
        $historySlice = array_slice($session['history'], -10);
        foreach ($historySlice as $h) {
            $chatMessages[] = [
                'role' => $h['role'],
                'content' => $h['content']
            ];
        }

        $payload = [
            'model' => $requestedModel,
            'messages' => $chatMessages,
            'stream' => false,
            'temperature' => 0.7
        ];

        $ch = curl_init($ollamaUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $ollamaKey
        ]);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_TIMEOUT, 8);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if (!$curlError && $httpCode === 200) {
            $responseData = json_decode($response, true);
            // 1. OpenAI-compatible format (/v1/chat/completions)
            if (!empty($responseData['choices'][0]['message']['content'])) {
                $replyText = trim($responseData['choices'][0]['message']['content']);
            } 
            // 2. Ollama native format (/api/chat)
            elseif (!empty($responseData['message']['content'])) {
                $replyText = trim($responseData['message']['content']);
            }
        }

        // If external AI is offline/unreachable, use D.I.N.G. Fallback Intelligence
        if (empty($replyText)) {
            // Check if query is non-IT
            $nonItWords = ['sports', 'basketball', 'nba', 'cooking', 'recipe', 'politics', 'girlfriend', 'boyfriend', 'movie', 'song'];
            $isNonIt = false;
            foreach ($nonItWords as $w) {
                if (stripos($userMessage, $w) !== false) {
                    $isNonIt = true;
                    break;
                }
            }

            if ($isNonIt) {
                $replyText = "Hello po! I am E.L.L.I.E. (Employee Link for Learning, Information & IT Essentials), your Uratex IT Helpdesk Assistant. As company policy, I specialize in workplace IT support such as computers, passwords, accounts, M365, networks, VPN, printers, and SAP. How can I assist you with your tech issue today?";
            } else {
                $replyText = "Hello po! I am E.L.L.I.E. I received your inquiry: \"{$userMessage}\".\n\n" .
                             "For immediate resolution, you can also dial our **Uratex IT Help Desk at Local Ext. 4401** or ask me to check our IT Directory for SAP Support, DEV Software Engineers, or Tech Luzon / VisMin specialists.\n\n" .
                             "How else may I help you with your workstation or system today?";
            }
        }
    }

    // Append assistant response to session
    $botMsgObj = [
        'id' => 'msg_' . bin2hex(random_bytes(6)),
        'role' => 'assistant',
        'content' => $replyText,
        'timestamp' => time()
    ];
    $session['history'][] = $botMsgObj;

    // Save session with visitor security metadata
    save_session_data($sessionId, $session, $clientIp, $_SERVER['HTTP_USER_AGENT'] ?? '');

    // Return response
    echo json_encode([
        'success' => true,
        'sessionId' => $sessionId,
        'model' => $requestedModel,
        'reply' => $replyText,
        'message' => $botMsgObj,
        'timestamp' => $botMsgObj['timestamp'],
        'quickReplies' => []
    ]);
    exit;
}

// 404 For unknown action
http_response_code(404);
echo json_encode(['error' => 'Unknown action or endpoint']);
exit;
