// SCMS Frontend Logic (localStorage Mock API)

let currentUser = null;
let currentTicketId = null;
let activeTab = 'login'; // 'login' or 'register'

// Mock Data Initializer for Cloud Nodes
const initialNodes = [
    { id: 1, name: 'java-service-prod', type: 'Polyglot VM', status: 'Active', ip: '10.0.1.22' },
    { id: 2, name: 'python-analytics', type: 'Polyglot VM', status: 'Offline', ip: '10.0.1.45' },
    { id: 3, name: 'salesforce-sync', type: 'Integration Agent', status: 'Active', ip: '10.0.2.11' },
    { id: 4, name: 'owncloud-storage', type: 'OpenStack Storage', status: 'Active', ip: '192.168.1.100' }
];

// Initialize Storage if empty
if (!localStorage.getItem('scms_nodes')) {
    localStorage.setItem('scms_nodes', JSON.stringify(initialNodes));
}

// ---------------------------
// Authentication Logic
// ---------------------------
function switchAuthTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('auth-btn').innerText = tab === 'login' ? 'Sign In' : 'Register Account';
    document.getElementById('register-fields').style.display = tab === 'register' ? 'block' : 'none';
}

function handleAuth(e) {
    e.preventDefault();
    const uname = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!uname || !pass) return alert("Fields cannot be empty");

    let users = JSON.parse(localStorage.getItem('scms_users') || '{}');

    if (activeTab === 'register') {
        const role = document.getElementById('role-select').value;
        if (users[uname]) return alert('User already exists!');
        users[uname] = { password: pass, role };
        localStorage.setItem('scms_users', JSON.stringify(users));
        alert('Registration successful! Logging you in...');
    } else {
        if (!users[uname] || users[uname].password !== pass) {
            return alert('Invalid credentials');
        }
    }

    // Login successful
    currentUser = { username: uname, role: users[uname] ? users[uname].role : 'admin' };
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    document.getElementById('current-user-name').innerText = currentUser.username;
    document.getElementById('current-user-role').innerText = currentUser.role.toUpperCase();

    // Hide infra for normal users
    if (currentUser.role !== 'admin') {
        document.getElementById('nav-infra').style.display = 'none';
        switchView('dashboard');
    } else {
        document.getElementById('nav-infra').style.display = 'block';
    }

    startRealTimeSimulation();
    loadDashboard();
}

function logout() {
    currentUser = null;
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('auth-form').reset();
    clearInterval(window.simInterval);
}

// ---------------------------
// Navigation / Views
// ---------------------------
function switchView(viewName) {
    /* Handle active nav link */
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    event.currentTarget.classList.add('active');

    /* Handle active section */
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(`view-${viewName}`).style.display = 'block';

    if (viewName === 'infrastructure') loadNodes();
    if (viewName === 'complaints') loadTickets();
}

// ---------------------------
// Cloud Infrastructure Logic
// ---------------------------
function loadNodes() {
    if (currentUser.role !== 'admin') return;
    const nodes = JSON.parse(localStorage.getItem('scms_nodes'));
    const tbody = document.getElementById('nodes-table-body');

    tbody.innerHTML = nodes.map(n => `
        <tr>
            <td><strong>${n.name}</strong></td>
            <td>${n.type}</td>
            <td><span class="status-badge status-${n.status.toLowerCase()}">${n.status}</span></td>
            <td>${n.ip}</td>
            <td>
                <button class="primary-btn" onclick="toggleNode(${n.id})">${n.status === 'Active' ? 'Stop' : 'Start'}</button>
                <button class="warning-btn" onclick="deleteNode(${n.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function toggleNode(id) {
    let nodes = JSON.parse(localStorage.getItem('scms_nodes'));
    let node = nodes.find(n => n.id === id);
    node.status = node.status === 'Active' ? 'Offline' : 'Active';
    localStorage.setItem('scms_nodes', JSON.stringify(nodes));
    loadNodes();
}

function deployNewNode() {
    let nodes = JSON.parse(localStorage.getItem('scms_nodes'));
    const types = ['Polyglot VM', 'Salesforce Agent', 'Database Replica'];
    nodes.push({
        id: Date.now(),
        name: `node-${Math.floor(Math.random() * 1000)}`,
        type: types[Math.floor(Math.random() * types.length)],
        status: 'Active',
        ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    });
    localStorage.setItem('scms_nodes', JSON.stringify(nodes));
    loadNodes();
}

function deleteNode(id) {
    if (!confirm("Destroy instance?")) return;
    let nodes = JSON.parse(localStorage.getItem('scms_nodes'));
    nodes = nodes.filter(n => n.id !== id);
    localStorage.setItem('scms_nodes', JSON.stringify(nodes));
    loadNodes();
}


// ---------------------------
// Tickets / Complaints Logic
// ---------------------------
function submitTicket() {
    const title = document.getElementById('ticket-title').value.trim();
    const desc = document.getElementById('ticket-desc').value.trim();
    if (!title || !desc) return alert("Please fill both title and description.");

    let tickets = JSON.parse(localStorage.getItem('scms_tickets') || '[]');
    tickets.unshift({
        id: Date.now(),
        title,
        desc,
        author: currentUser.username,
        status: 'Open',
        date: new Date().toLocaleString()
    });
    localStorage.setItem('scms_tickets', JSON.stringify(tickets));

    document.getElementById('ticket-title').value = '';
    document.getElementById('ticket-desc').value = '';
    loadTickets();
    alert("Support ticket submitted.");
}

function loadTickets() {
    let tickets = JSON.parse(localStorage.getItem('scms_tickets') || '[]');

    // Non-admins only see their own tickets
    if (currentUser.role !== 'admin') {
        tickets = tickets.filter(t => t.author === currentUser.username);
    }

    const container = document.getElementById('tickets-list');

    if (tickets.length === 0) {
        container.innerHTML = '<p style="color:#666;">No support tickets found.</p>';
        return;
    }

    container.innerHTML = tickets.map(t => `
        <div class="ticket-item" onclick="openTicket(${t.id})">
            <span class="status-badge status-${t.status.replace(' ', '')}" style="float: right;">${t.status}</span>
            <h4><i class="fas fa-ticket-alt"></i> ${t.title}</h4>
            <div class="ticket-meta">
                <span>By: ${t.author}</span>
                <span>${t.date}</span>
            </div>
        </div>
    `).join('');
}

// ---------------------------
// Modal & Comments Logic
// ---------------------------
function openTicket(id) {
    currentTicketId = id;
    let tickets = JSON.parse(localStorage.getItem('scms_tickets'));
    let t = tickets.find(t => t.id === id);

    document.getElementById('modal-title').innerText = t.title;
    document.getElementById('modal-desc').innerText = t.desc;
    document.getElementById('modal-author').innerText = t.author;
    document.getElementById('modal-date').innerText = t.date;

    const statusBadge = document.getElementById('modal-status');
    statusBadge.innerText = t.status;
    statusBadge.className = `status-badge status-${t.status.replace(' ', '')}`;

    document.getElementById('admin-ticket-actions').style.display =
        (currentUser.role === 'admin' && t.status !== 'Resolved') ? 'flex' : 'none';

    loadComments();
    document.getElementById('ticket-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('ticket-modal').style.display = 'none';
    currentTicketId = null;
    loadTickets(); // Refresh list on close
}

function updateTicketStatus(newStatus) {
    let tickets = JSON.parse(localStorage.getItem('scms_tickets'));
    let t = tickets.find(t => t.id === currentTicketId);
    t.status = newStatus;
    localStorage.setItem('scms_tickets', JSON.stringify(tickets));

    // Add system comment
    let comments = JSON.parse(localStorage.getItem('scms_comments') || '[]');
    comments.push({ ticketId: currentTicketId, text: `System: Status updated to ${newStatus}`, author: 'System', role: 'admin' });
    localStorage.setItem('scms_comments', JSON.stringify(comments));

    openTicket(currentTicketId); // Reload
}

function postComment() {
    const input = document.getElementById('new-comment');
    const text = input.value.trim();
    if (!text) return;

    let comments = JSON.parse(localStorage.getItem('scms_comments') || '[]');
    comments.push({ ticketId: currentTicketId, text, author: currentUser.username, role: currentUser.role });
    localStorage.setItem('scms_comments', JSON.stringify(comments));

    input.value = '';
    loadComments();
}

function loadComments() {
    let comments = JSON.parse(localStorage.getItem('scms_comments') || '[]');
    let ticketComments = comments.filter(c => c.ticketId === currentTicketId);

    const container = document.getElementById('modal-comments');
    if (ticketComments.length === 0) {
        container.innerHTML = "<p>No comments yet.</p>";
        return;
    }

    container.innerHTML = ticketComments.map(c => `
        <div class="comment-box ${c.role === 'admin' ? 'admin-comment' : ''}">
            <div class="comment-header"><i class="fas ${c.role === 'admin' ? 'fa-shield-alt' : 'fa-user'}"></i> ${c.author}</div>
            <div class="comment-text">${c.text}</div>
        </div>
    `).join('');
}

// ---------------------------
// Dashboard Analytics Simulation
// ---------------------------
function loadDashboard() { }

// Simulates live traffic updates for the Dashboard
function startRealTimeSimulation() {
    window.simInterval = setInterval(() => {
        if (document.getElementById('view-dashboard').style.display !== 'none') {
            const traffic = 30000 + Math.floor(Math.random() * 5000);
            const cpu = 40 + Math.floor(Math.random() * 40);
            document.getElementById('metric-traffic').innerText = traffic.toLocaleString() + ' req/h';
            document.getElementById('metric-cpu').innerText = cpu + '% Avg';

            // Optional: Randomize progress bars slightly
            document.querySelectorAll('.progress').forEach(el => {
                let current = parseInt(el.style.width);
                if (current < 100) {
                    let move = Math.floor(Math.random() * 5) - 2; // -2 to +2
                    let next = Math.max(10, Math.min(100, current + move));
                    el.style.width = next + '%';
                }
            });
        }
    }, 2000);
}
