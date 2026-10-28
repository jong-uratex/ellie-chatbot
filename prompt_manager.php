<?php
/**
 * E.L.L.I.E. - System Prompt & Configuration Manager (PHP)
 * Lightweight management tool for IT support system instructions and quick prompts.
 */

define('CSV_FILE', __DIR__ . '/prompt.csv');
define('STORAGE_DIR', __DIR__ . '/sessions');
define('DIRECTORY_FILE', __DIR__ . '/directory.json');

// Helper to Read CSV
function read_csv() {
    if (!file_exists(CSV_FILE)) return [];
    $rows = [];
    if (($handle = fopen(CSV_FILE, "r")) !== FALSE) {
        $header = fgetcsv($handle, 2000, ",");
        while (($data = fgetcsv($handle, 2000, ",")) !== FALSE) {
            if (count($header) === count($data)) {
                $rows[] = array_combine($header, $data);
            }
        }
        fclose($handle);
    }
    return $rows;
}

// Helper to Save CSV safely
function write_csv($rows) {
    if (empty($rows)) return;
    $handle = fopen(CSV_FILE, "w");
    $headers = array_keys($rows[0]);
    fputcsv($handle, $headers);
    foreach ($rows as $row) {
        fputcsv($handle, $row);
    }
    fclose($handle);
}

// Helper to list active sessions
function list_sessions() {
    if (!is_dir(STORAGE_DIR)) return [];
    $files = glob(STORAGE_DIR . '/*.json');
    $sessions = [];
    foreach ($files as $f) {
        $data = json_decode(@file_get_contents($f), true);
        if ($data) {
            $sessions[] = [
                'file' => basename($f),
                'sessionId' => $data['sessionId'] ?? basename($f, '.json'),
                'messages' => count($data['history'] ?? []),
                'updatedAt' => date('Y-m-d H:i:s', $data['updatedAt'] ?? filemtime($f))
            ];
        }
    }
    return $sessions;
}

// Handle Add / Edit / Delete
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rows = read_csv();

    if ($action === 'add') {
        $newRow = [
            'id' => trim($_POST['id']),
            'category' => trim($_POST['category']),
            'name' => trim($_POST['name']),
            'role' => trim($_POST['role']),
            'content' => trim($_POST['content']),
            'is_active' => isset($_POST['is_active']) ? 'true' : 'false',
            'description' => trim($_POST['description']),
            'updated_at' => date('Y-m-d')
        ];
        $rows[] = $newRow;
        write_csv($rows);
        header('Location: prompt_manager.php');
        exit;
    }

    if ($action === 'edit') {
        $target_id = $_POST['original_id'];
        foreach ($rows as &$row) {
            if ($row['id'] === $target_id) {
                $row['id'] = trim($_POST['id']);
                $row['category'] = trim($_POST['category']);
                $row['name'] = trim($_POST['name']);
                $row['role'] = trim($_POST['role']);
                $row['content'] = trim($_POST['content']);
                $row['is_active'] = isset($_POST['is_active']) ? 'true' : 'false';
                $row['description'] = trim($_POST['description']);
                $row['updated_at'] = date('Y-m-d');
                break;
            }
        }
        write_csv($rows);
        header('Location: prompt_manager.php');
        exit;
    }
}

if ($action === 'delete' && isset($_GET['id'])) {
    $rows = read_csv();
    $rows = array_filter($rows, fn($r) => $r['id'] !== $_GET['id']);
    write_csv(array_values($rows));
    header('Location: prompt_manager.php');
    exit;
}

if ($action === 'delete_session' && isset($_GET['sid'])) {
    $sid = preg_replace('/[^a-zA-Z0-9_\-]/', '', $_GET['sid']);
    $f = STORAGE_DIR . '/' . $sid . '.json';
    if (file_exists($f)) @unlink($f);
    header('Location: prompt_manager.php?tab=sessions');
    exit;
}

$prompts = read_csv();
$sessions = list_sessions();
$editPrompt = null;
if ($action === 'edit_form' && isset($_GET['id'])) {
    foreach ($prompts as $p) {
        if ($p['id'] === $_GET['id']) {
            $editPrompt = $p;
            break;
        }
    }
}

$activeTab = $_GET['tab'] ?? ($editPrompt ? 'prompts' : 'prompts');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E.L.L.I.E. Prompt & Session Manager</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .container { max-width: 1100px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 18px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden; }
        .topbar { background: #0084ff; color: #fff; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; }
        .topbar h1 { margin: 0; font-size: 20px; display: flex; align-items: center; gap: 10px; }
        .nav-tabs { display: flex; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; padding: 0 24px; }
        .nav-tab { padding: 14px 20px; text-decoration: none; color: #64748b; font-weight: 600; font-size: 14px; border-bottom: 2px solid transparent; display: flex; align-items: center; gap: 8px; }
        .nav-tab.active { color: #0084ff; border-bottom-color: #0084ff; background: #fff; }
        .content { padding: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th, td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 13.5px; }
        th { background: #f8fafc; font-weight: 600; color: #475569; }
        .badge { padding: 4px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 600; display: inline-block; }
        .badge-active { background: #dcfce7; color: #15803d; }
        .badge-inactive { background: #fee2e2; color: #b91c1c; }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #334155; }
        input[type="text"], select, textarea { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-family: inherit; }
        input:focus, textarea:focus, select:focus { border-color: #0084ff; outline: none; }
        button { background: #0084ff; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; transition: 0.15s; }
        button:hover { background: #006bce; }
        .btn-edit { color: #0084ff; text-decoration: none; margin-right: 12px; font-size: 15px; }
        .btn-delete { color: #ef4444; text-decoration: none; font-size: 15px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-top: 24px; }
    </style>
</head>
<body>

<div class="container">
    <div class="topbar">
        <h1><img src="ellie.jpeg" alt="E.L.L.I.E." style="width:32px;height:32px;border-radius:6px;object-fit:cover;vertical-align:middle;"> E.L.L.I.E. System Admin</h1>
        <div>
            <a href="index.php" style="color:#fff;text-decoration:none;font-size:13px;padding:6px 12px;background:rgba(255,255,255,0.2);border-radius:6px;"><i class="fa-solid fa-comment-dots"></i> Open Chat Demo</a>
        </div>
    </div>

    <div class="nav-tabs">
        <a class="nav-tab <?= $activeTab === 'prompts' ? 'active' : '' ?>" href="prompt_manager.php?tab=prompts"><i class="fa-solid fa-sliders"></i> System Prompts (<?= count($prompts) ?>)</a>
        <a class="nav-tab <?= $activeTab === 'models' ? 'active' : '' ?>" href="prompt_manager.php?tab=models"><i class="fa-solid fa-microchip"></i> AI Engine Models (3)</a>
        <a class="nav-tab <?= $activeTab === 'sessions' ? 'active' : '' ?>" href="prompt_manager.php?tab=sessions"><i class="fa-solid fa-database"></i> Active Sessions (<?= count($sessions) ?>)</a>
    </div>

    <div class="content">
        <?php if ($activeTab === 'prompts'): ?>
            <h3>Active System Prompts</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID Key</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Role</th>
                        <th>Content Preview</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($prompts as $p): ?>
                    <tr>
                        <td><code><?= htmlspecialchars($p['id'] ?? '') ?></code></td>
                        <td><strong><?= htmlspecialchars($p['name'] ?? '') ?></strong></td>
                        <td><?= htmlspecialchars($p['category'] ?? '') ?></td>
                        <td><span style="font-family:monospace;"><?= htmlspecialchars($p['role'] ?? '') ?></span></td>
                        <td title="<?= htmlspecialchars($p['content'] ?? '') ?>"><?= htmlspecialchars(substr($p['content'] ?? '', 0, 75)) ?>...</td>
                        <td>
                            <span class="badge <?= (strtolower($p['is_active'] ?? '') === 'true' || ($p['is_active'] ?? '') === '1') ? 'badge-active' : 'badge-inactive' ?>">
                                <?= (strtolower($p['is_active'] ?? '') === 'true' || ($p['is_active'] ?? '') === '1') ? 'Active' : 'Inactive' ?>
                            </span>
                        </td>
                        <td>
                            <a class="btn-edit" title="Edit" href="prompt_manager.php?action=edit_form&id=<?= urlencode($p['id'] ?? '') ?>"><i class="fa-solid fa-pen-to-square"></i></a>
                            <a class="btn-delete" title="Delete" href="prompt_manager.php?action=delete&id=<?= urlencode($p['id'] ?? '') ?>" onclick="return confirm('Delete this prompt?')"><i class="fa-solid fa-trash"></i></a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <div class="card">
                <h3 style="margin-top:0;"><?= $editPrompt ? 'Edit System Prompt' : 'Add New System Prompt' ?></h3>
                <form method="POST" action="prompt_manager.php?action=<?= $editPrompt ? 'edit' : 'add' ?>">
                    <?php if ($editPrompt): ?>
                        <input type="hidden" name="original_id" value="<?= htmlspecialchars($editPrompt['id']) ?>">
                    <?php endif; ?>

                    <div style="display: flex; gap: 16px;">
                        <div class="form-group" style="flex:1;">
                            <label>ID Key</label>
                            <input type="text" name="id" value="<?= htmlspecialchars($editPrompt['id'] ?? '') ?>" required>
                        </div>
                        <div class="form-group" style="flex:1;">
                            <label>Prompt Name</label>
                            <input type="text" name="name" value="<?= htmlspecialchars($editPrompt['name'] ?? '') ?>" required>
                        </div>
                        <div class="form-group" style="flex:1;">
                            <label>Category</label>
                            <input type="text" name="category" value="<?= htmlspecialchars($editPrompt['category'] ?? 'system') ?>" required>
                        </div>
                        <div class="form-group" style="flex:1;">
                            <label>Role</label>
                            <select name="role">
                                <option value="system" <?= ($editPrompt['role'] ?? '') === 'system' ? 'selected' : '' ?>>system</option>
                                <option value="assistant" <?= ($editPrompt['role'] ?? '') === 'assistant' ? 'selected' : '' ?>>assistant</option>
                                <option value="quick_action" <?= ($editPrompt['role'] ?? '') === 'quick_action' ? 'selected' : '' ?>>quick_action</option>
                                <option value="user" <?= ($editPrompt['role'] ?? '') === 'user' ? 'selected' : '' ?>>user</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Prompt Content (Instructions for AI)</label>
                        <textarea name="content" rows="4" required><?= htmlspecialchars($editPrompt['content'] ?? '') ?></textarea>
                    </div>

                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" name="description" value="<?= htmlspecialchars($editPrompt['description'] ?? '') ?>">
                    </div>

                    <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" name="is_active" id="is_active" value="true" <?= (!isset($editPrompt) || strtolower($editPrompt['is_active']) === 'true') ? 'checked' : '' ?>>
                        <label for="is_active" style="margin: 0;">Is Active</label>
                    </div>

                    <button type="submit"><?= $editPrompt ? 'Update Prompt' : 'Save New Prompt' ?></button>
                    <?php if ($editPrompt): ?>
                        <a href="prompt_manager.php" style="margin-left: 12px; color: #64748b; text-decoration: none;">Cancel</a>
                    <?php endif; ?>
                </form>
            </div>
        <?php elseif ($activeTab === 'models'): ?>
            <h3>Configured AI Engine Models</h3>
            <p style="color:#64748b;font-size:13.5px;">Selectable model options for E.L.L.I.E. via <code>data-model</code> attribute or <code>POST /api/chat</code> payload.</p>
            
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:16px;margin-top:16px;">
                <div style="border:2px solid #0084ff;border-radius:10px;padding:18px;background:#f0f7ff;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <span style="font-family:monospace;font-weight:700;font-size:15px;color:#0084ff;">qwen2.5-coder:1.5b</span>
                        <span class="badge badge-active">Recommended</span>
                    </div>
                    <div style="font-weight:600;font-size:13.5px;color:#0f172a;margin-bottom:6px;">ELLIE • Order-to-Cash (O2C)</div>
                    <p style="font-size:12.5px;color:#475569;line-height:1.5;margin:0 0 12px 0;">Specialized enterprise model for Uratex SAP Order-to-Cash, SD billing, pricing, sales orders (VA01), credit check, & delivery workflows.</p>
                    <div style="font-size:11.5px;color:#0084ff;font-family:monospace;background:#fff;padding:6px 10px;border-radius:6px;border:1px solid #bfdbfe;">
                        data-model="qwen2.5-coder:1.5b"
                    </div>
                </div>

                <div style="border:1px solid #e2e8f0;border-radius:10px;padding:18px;background:#fff;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <span style="font-family:monospace;font-weight:700;font-size:15px;color:#334155;">qwen2.5-coder:7b</span>
                        <span class="badge badge-active" style="background:#e0e7ff;color:#4338ca;">IT & Code</span>
                    </div>
                    <div style="font-weight:600;font-size:13.5px;color:#0f172a;margin-bottom:6px;">Qwen 2.5 Coder (7B)</div>
                    <p style="font-size:12.5px;color:#475569;line-height:1.5;margin:0 0 12px 0;">Fast IT systems administration, technical troubleshooting, server maintenance, and automation scripts.</p>
                    <div style="font-size:11.5px;color:#475569;font-family:monospace;background:#f8fafc;padding:6px 10px;border-radius:6px;border:1px solid #e2e8f0;">
                        data-model="qwen2.5-coder:7b"
                    </div>
                </div>

                <div style="border:1px solid #e2e8f0;border-radius:10px;padding:18px;background:#fff;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <span style="font-family:monospace;font-weight:700;font-size:15px;color:#334155;">llama3.1:8b</span>
                        <span class="badge badge-active" style="background:#f1f5f9;color:#475569;">General IT</span>
                    </div>
                    <div style="font-weight:600;font-size:13.5px;color:#0f172a;margin-bottom:6px;">Llama 3.1 (8B)</div>
                    <p style="font-size:12.5px;color:#475569;line-height:1.5;margin:0 0 12px 0;">Broad corporate IT helpdesk assistance, general inquiries, user accounts, and desktop software.</p>
                    <div style="font-size:11.5px;color:#475569;font-family:monospace;background:#f8fafc;padding:6px 10px;border-radius:6px;border:1px solid #e2e8f0;">
                        data-model="llama3.1:8b"
                    </div>
                </div>
            </div>
        <?php else: ?>
            <h3>Persisted Chat Sessions</h3>
            <p style="color:#64748b;font-size:13.5px;">Sessions stored in <code>sessions/</code> with conversation history and timestamp persistence.</p>
            <table>
                <thead>
                    <tr>
                        <th>Session ID</th>
                        <th>Messages Stored</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($sessions)): ?>
                        <tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:24px;">No active sessions currently stored.</td></tr>
                    <?php else: ?>
                        <?php foreach ($sessions as $s): ?>
                        <tr>
                            <td><code><?= htmlspecialchars($s['sessionId']) ?></code></td>
                            <td><?= $s['messages'] ?> messages</td>
                            <td><?= htmlspecialchars($s['updatedAt']) ?></td>
                            <td>
                                <a class="btn-delete" href="prompt_manager.php?action=delete_session&sid=<?= urlencode($s['sessionId']) ?>" onclick="return confirm('Purge this session?')"><i class="fa-solid fa-trash"></i> Purge</a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>

</body>
</html>
