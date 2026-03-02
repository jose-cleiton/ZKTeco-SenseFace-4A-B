import { Router } from 'express';
import path from 'path';

const router = Router();

router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ZKTeco PUSH Server</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">ZKTeco PUSH Server Control Panel</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Devices -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">Devices Online</h2>
            <div id="devices-list" class="space-y-2">Loading...</div>
          </div>

          <!-- Manual Command -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">Send Manual Command</h2>
            <form id="command-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium">SN</label>
                <input type="text" id="cmd-sn" class="w-full border rounded p-2" required>
              </div>
              <div>
                <label class="block text-sm font-medium">Command</label>
                <input type="text" id="cmd-text" class="w-full border rounded p-2" placeholder="DATA QUERY user" required>
              </div>
              <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Send</button>
            </form>
          </div>
        </div>

        <!-- Recent Logs -->
        <div class="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Recent Logs</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b">
                  <th class="p-2">Time</th>
                  <th class="p-2">SN</th>
                  <th class="p-2">PIN</th>
                  <th class="p-2">Event</th>
                  <th class="p-2">Type</th>
                </tr>
              </thead>
              <tbody id="logs-list"></tbody>
            </table>
          </div>
        </div>
      </div>

      <script>
        async function loadData() {
          const devRes = await fetch('/api/devices');
          const devices = await devRes.json();
          document.getElementById('devices-list').innerHTML = devices.map(d => \`
            <div class="flex justify-between items-center p-2 border-b">
              <span>\${d.sn} (\${d.ip})</span>
              <span class="\${d.is_online ? 'text-green-500' : 'text-red-500'}">\${d.is_online ? 'Online' : 'Offline'}</span>
              <button onclick="syncUsers('\${d.sn}')" class="text-xs bg-gray-200 px-2 py-1 rounded">Sync Users</button>
            </div>
          \`).join('');

          const logRes = await fetch('/api/logs');
          const logs = await logRes.json();
          document.getElementById('logs-list').innerHTML = logs.slice(0, 10).map(l => \`
            <tr class="border-b text-sm">
              <td class="p-2">\${l.parsed_json.time || l.received_at}</td>
              <td class="p-2">\${l.sn}</td>
              <td class="p-2">\${l.parsed_json.pin || '-'}</td>
              <td class="p-2">\${l.parsed_json.event_desc}</td>
              <td class="p-2">\${l.parsed_json.verifytype_desc}</td>
            </tr>
          \`).join('');
        }

        async function syncUsers(sn) {
          const res = await fetch(\`/api/usuarios?sn=\${sn}\`);
          const data = await res.json();
          alert('Sync started. Job ID: ' + (data.jobId || 'Done'));
        }

        document.getElementById('command-form').onsubmit = async (e) => {
          e.preventDefault();
          const sn = document.getElementById('cmd-sn').value;
          const command = document.getElementById('cmd-text').value;
          await fetch('/api/commands/manual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sn, command })
          });
          alert('Command enqueued');
        };

        setInterval(loadData, 5000);
        loadData();
      </script>
    </body>
    </html>
  `);
});

export default router;
