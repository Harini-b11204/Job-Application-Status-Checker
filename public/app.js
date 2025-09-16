const form = document.getElementById('appForm');
const list = document.getElementById('list');
const message = document.getElementById('message');
const refreshBtn = document.getElementById('refresh');
const checkBtn = document.getElementById('check');

async function fetchApps() {
  const res = await fetch('/api/applications');
  return res.json();
}

function render(listData) {
  list.innerHTML = '';
  if (!listData.length) {
    list.innerHTML = '<li>No applications yet.</li>';
    return;
  }
  listData.forEach((a, i) => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.textContent = `${i + 1}. ${a.name} (${a.id})`;
    const right = document.createElement('div');
    const status = document.createElement('span');
    status.className = 'status ' + a.status;
    status.textContent = a.status;
    right.appendChild(status);
    li.appendChild(left);
    li.appendChild(right);
    list.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Submit failed');
    message.textContent = `Submitted ${json.name} (ID: ${json.id})`;
    form.reset();
    render(await fetchApps());
  } catch (err) {
    message.textContent = 'Error: ' + err.message;
  }
});

refreshBtn.addEventListener('click', async () => {
  render(await fetchApps());
});

checkBtn.addEventListener('click', async () => {
  await fetch('/api/applications/check', { method: 'POST' });
  render(await fetchApps());
});

// initial
(async () => render(await fetchApps()))();
