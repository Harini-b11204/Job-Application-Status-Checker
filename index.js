const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let applications = [];
let idCounter = 1000;

function generateAppID() {
  return 'APP' + idCounter++;
}

function validateName(name) {
  return typeof name === 'string' && /^[a-zA-Z\s]+$/.test(name);
}

function validateEmail(email) {
  return typeof email === 'string' && /^[\w.-]+@[a-zA-Z_]+?\.[a-zA-Z]{2,}$/.test(email);
}

function createApplication({ name, email }) {
  if (!validateName(name)) {
    const e = new Error('Invalid name: only letters and spaces allowed.');
    e.status = 400;
    throw e;
  }
  if (!validateEmail(email)) {
    const e = new Error('Invalid email format.');
    e.status = 400;
    throw e;
  }

  const application = { id: generateAppID(), name, email, status: 'Pending' };
  applications.push(application);
  return application;
}

function checkStatus(application) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const statuses = ['Reviewed', 'Selected', 'Rejected'];
      let result = statuses[Math.floor(Math.random() * statuses.length)];
      application.status = result;
      resolve(application);
    }, 500);
  });
}

app.post('/api/applications', (req, res) => {
  try {
    const application = createApplication(req.body);
    res.status(201).json(application);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get('/api/applications', (req, res) => {
  res.json(applications);
});

app.post('/api/applications/check', async (req, res) => {
  // update all statuses
  await Promise.all(applications.map((app) => checkStatus(app)));
  res.json(applications);
});

// expose internals for tests
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
} else {
  module.exports = { app, createApplication, validateName, validateEmail, applications };
}
