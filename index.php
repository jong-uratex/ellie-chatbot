<?php
/**
 * E.L.L.I.E. - Employee Link for Learning, Information & IT Essentials
 * Standalone PHP Demo and Web Interface
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E.L.L.I.E. - Employee Link for Learning, Information & IT Essentials</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="ding-widget.css">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        body { background-color: #f0f2f5; min-height: 100vh; display: flex; flex-direction: column; }
        header { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
        .brand { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 18px; color: #0f172a; }
        .brand-icon { width: 36px; height: 36px; background: #0084ff; color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .nav-links a { color: #0084ff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 8px 14px; border-radius: 6px; background: #e7f3ff; margin-left: 8px; transition: 0.2s; }
        .nav-links a:hover { background: #dbe7f2; }
        .main-content { flex: 1; display: flex; justify-content: center; align-items: center; padding: 24px; }
        .chat-container { width: 100%; max-width: 900px; height: 82vh; background: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0; }
        .chat-header { background: #ffffff; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .user-info { display: flex; align-items: center; gap: 12px; }
        .avatar { width: 44px; height: 44px; background: #0084ff; border-radius: 50%; color: #fff; display: flex; justify-content: center; align-items: center; font-size: 20px; position: relative; }
        .status-dot { width: 12px; height: 12px; background: #22c55e; border: 2px solid #fff; border-radius: 50%; position: absolute; bottom: 0; right: 0; }
        .details h3 { font-size: 16px; font-weight: 700; color: #0f172a; }
        .details p { font-size: 12px; color: #64748b; }
        .quick-actions { display: flex; gap: 8px; padding: 8px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; overflow-x: auto; }
        .chip { background: #e7f3ff; color: #0084ff; border: 1px solid rgba(0, 132, 255, 0.2); padding: 6px 12px; border-radius: 16px; font-size: 12.5px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: 0.15s; }
        .chip:hover { background: #0084ff; color: #fff; }
        .chat-body { flex: 1; padding: 20px; overflow-y: auto; background: #ffffff; display: flex; flex-direction: column; gap: 14px; }
        .message { display: flex; align-items: flex-end; gap: 10px; max-width: 75%; }
        .message.incoming { align-self: flex-start; }
        .message.outgoing { align-self: flex-end; flex-direction: row-reverse; }
        .msg-avatar { width: 30px; height: 30px; background: #0084ff; border-radius: 50%; color: #fff; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .bubble { padding: 12px 16px; border-radius: 18px; font-size: 14.5px; line-height: 1.5; word-wrap: break-word; white-space: pre-wrap; }
        .message.incoming .bubble { background: #f1f5f9; color: #0f172a; border-bottom-left-radius: 4px; }
        .message.outgoing .bubble { background: #0084ff; color: #ffffff; border-bottom-right-radius: 4px; }
        .typing { display: none; align-self: flex-start; background: #f1f5f9; padding: 10px 16px; border-radius: 18px; border-bottom-left-radius: 4px; }
        .dot { height: 7px; width: 7px; background-color: #94a3b8; border-radius: 50%; display: inline-block; animation: bounce 1.3s infinite ease-in-out; }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
        .chat-footer { padding: 14px 20px; background: #ffffff; border-top: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; }
        .chat-input { flex: 1; border: 1px solid #cbd5e1; background: #f8fafc; padding: 12px 18px; border-radius: 24px; font-size: 14.5px; outline: none; }
        .chat-input:focus { border-color: #0084ff; background: #fff; }
        .send-btn { background: #0084ff; border: none; color: #fff; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; transition: 0.2s; }
        .send-btn:hover { background: #006bce; }
        .clear-btn { background: none; border: 1px solid #e2e8f0; color: #64748b; padding: 8px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; transition: 0.2s; }
        .clear-btn:hover { background: #fee2e2; color: #ef4444; border-color: #fca5a5; }
    </style>
</head>
<body>

<header>
    <div class="brand">
        <img src="ellie.jpeg" alt="E.L.L.I.E." class="brand-icon" style="object-fit:cover;border-radius:8px;">
        <span>E.L.L.I.E. Chatbot Suite</span>
    </div>
    <div class="nav-links">
        <a href="prompt_manager.php"><i class="fa-solid fa-sliders"></i> Prompt Manager</a>
        <a href="api.php?action=directory" target="_blank"><i class="fa-solid fa-address-book"></i> IT Directory JSON</a>
    </div>
</header>

<div class="main-content">
    <div class="chat-container">
        <div class="chat-header">
            <div class="user-info">
                <div class="avatar"><img src="ellie.jpeg" alt="E.L.L.I.E." style="width:100%;height:100%;border-radius:50%;object-fit:cover;"><div class="status-dot"></div></div>
                <div class="details">
                    <h3>E.L.L.I.E.</h3>
                    <p>Employee Link for Learning, Information & IT Essentials • Connected via PHP API</p>
                </div>
            </div>
            <button class="clear-btn" onclick="clearCurrentSession()"><i class="fa-solid fa-rotate-right"></i> End & Reset Session</button>
        </div>

        <div class="chat-body" id="chatBody">
            <div class="message incoming">
                <div class="msg-avatar"><img src="ellie.jpeg" alt="E.L.L.I.E." style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>
                <div class="bubble">Hello! I'm E.L.L.I.E. (Employee Link for Learning, Information & IT Essentials), your Uratex IT Helpdesk Assistant. How can I help you resolve a tech issue or guide you today?</div>
            </div>
            <div class="typing" id="typingIndicator">
                <span class="dot"></span> <span class="dot"></span> <span class="dot"></span>
            </div>
        </div>

        <div class="chat-footer">
            <input type="text" id="userInput" class="chat-input" placeholder="Ask E.L.L.I.E. about passwords, M365, VPN, printers, SAP..." onkeydown="if(event.key==='Enter') sendMessage()">
            <button class="send-btn" onclick="sendMessage()"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
    </div>
</div>

<script>
let currentSessionId = localStorage.getItem('ding_php_sess_id');
if (!currentSessionId) {
    currentSessionId = 'php_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    localStorage.setItem('ding_php_sess_id', currentSessionId);
}

// Load persisted session on init
async function loadSessionHistory() {
    try {
        let res = await fetch('api.php?action=session&sessionId=' + encodeURIComponent(currentSessionId));
        if (!res.ok) {
            res = await fetch('/api/session?sessionId=' + encodeURIComponent(currentSessionId));
        }
        if (res.ok) {
            const data = await res.json();
            if (data.history && data.history.length > 0) {
                const chatBody = document.getElementById('chatBody');
                chatBody.innerHTML = '<div class="typing" id="typingIndicator"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div>';
                data.history.forEach(m => appendMessage(m.role, m.content));
            }
        }
    } catch (e) {
        console.error('Session load error', e);
    }
}

function appendMessage(role, text) {
    const chatBody = document.getElementById('chatBody');
    const typingIndicator = document.getElementById('typingIndicator');
    
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role === 'user' ? 'outgoing' : 'incoming');

    if (role === 'assistant') {
        const avatar = document.createElement('div');
        avatar.classList.add('msg-avatar');
        avatar.innerHTML = '<img src="ellie.jpeg" alt="E.L.L.I.E." style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
        msgDiv.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.textContent = text;
    msgDiv.appendChild(bubble);

    chatBody.insertBefore(msgDiv, typingIndicator);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function sendQuickMessage(text) {
    document.getElementById('userInput').value = text;
    sendMessage();
}

async function clearCurrentSession() {
    if (!confirm('Clear session history?')) return;
    try {
        await fetch('api.php?action=session&sessionId=' + encodeURIComponent(currentSessionId), { method: 'DELETE' });
    } catch (e) {}
    localStorage.removeItem('ding_php_sess_id');
    currentSessionId = 'php_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    localStorage.setItem('ding_php_sess_id', currentSessionId);
    location.reload();
}

async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const text = inputField.value.trim();
    if (!text) return;

    appendMessage('user', text);
    inputField.value = '';

    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'block';

    try {
        let response = await fetch('api.php?action=chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: currentSessionId,
                message: text
            })
        });

        // If api.php returns non-JSON or fails, try /api/chat
        let responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseErr) {
            // Fallback to /api/chat endpoint
            const fallbackRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: currentSessionId,
                    message: text
                })
            });
            data = await fallbackRes.json();
        }

        typingIndicator.style.display = 'none';

        if (data && data.reply) {
            appendMessage('assistant', data.reply);
        } else {
            appendMessage('assistant', "API Error: " + ((data && data.error) || "Unknown error occurred."));
        }
    } catch (err) {
        typingIndicator.style.display = 'none';
        appendMessage('assistant', "Network Error: " + err.message);
    }
}

window.addEventListener('DOMContentLoaded', loadSessionHistory);
</script>
</body>
</html>
