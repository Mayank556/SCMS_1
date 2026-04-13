import { useEffect, useMemo, useState } from 'react';

const initialNodes = [
  { id: 1, name: 'java-service-prod', type: 'Polyglot VM', status: 'Active', ip: '10.0.1.22' },
  { id: 2, name: 'python-analytics', type: 'Polyglot VM', status: 'Offline', ip: '10.0.1.45' },
  { id: 3, name: 'salesforce-sync', type: 'Integration Agent', status: 'Active', ip: '10.0.2.11' },
  { id: 4, name: 'owncloud-storage', type: 'OpenStack Storage', status: 'Active', ip: '192.168.1.100' }
];

const serviceBars = [
  { label: 'Java Backend Service', value: 95, color: 'var(--success)' },
  { label: 'Python Analytics Data', value: 82, color: 'var(--warning)' },
  { label: 'OwnCloud Storage', value: 100, color: 'var(--success)' }
];

function App() {
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('scms_users') || '{}'));
  const [nodes, setNodes] = useState(() => JSON.parse(localStorage.getItem('scms_nodes') || JSON.stringify(initialNodes)));
  const [tickets, setTickets] = useState(() => JSON.parse(localStorage.getItem('scms_tickets') || '[]'));
  const [comments, setComments] = useState(() => JSON.parse(localStorage.getItem('scms_comments') || '[]'));
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    localStorage.setItem('scms_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('scms_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('scms_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('scms_comments', JSON.stringify(comments));
  }, [comments]);

  const visibleTickets = useMemo(() => {
    if (!currentUser) return [];
    return currentUser.role === 'admin'
      ? tickets
      : tickets.filter((ticket) => ticket.author === currentUser.username);
  }, [currentUser, tickets]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  );

  const ticketComments = useMemo(
    () => comments.filter((comment) => comment.ticketId === selectedTicketId),
    [comments, selectedTicketId]
  );

  const metrics = useMemo(() => {
    const totalTickets = tickets.length;
    const resolvedTickets = tickets.filter((ticket) => ticket.status === 'Resolved').length;
    const activeNodes = nodes.filter((node) => node.status === 'Active').length;
    return {
      activeNodes,
      totalTickets,
      resolvedTickets,
      traffic: `${32450 + tickets.length * 18} req/h`
    };
  }, [tickets, nodes]);

  const handleAuth = (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert('Fields cannot be empty');
      return;
    }

    if (authMode === 'register') {
      if (users[username]) {
        alert('User already exists!');
        return;
      }

      const updatedUsers = {
        ...users,
        [username]: { password, role }
      };
      setUsers(updatedUsers);
      setCurrentUser({ username, role });
      setCurrentView('dashboard');
      setUsername('');
      setPassword('');
      setRole('user');
      return;
    }

    const user = users[username];
    if (!user || user.password !== password) {
      alert('Invalid credentials');
      return;
    }

    setCurrentUser({ username, role: user.role });
    setCurrentView('dashboard');
    setUsername('');
    setPassword('');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    setSelectedTicketId(null);
    setNewComment('');
  };

  const switchView = (view) => {
    setCurrentView(view);
    setSelectedTicketId(null);
    setNewComment('');
  };

  const toggleNode = (id) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? { ...node, status: node.status === 'Active' ? 'Offline' : 'Active' }
          : node
      )
    );
  };

  const deleteNode = (id) => {
    if (!window.confirm('Destroy instance?')) return;
    setNodes((prev) => prev.filter((node) => node.id !== id));
  };

  const deployNewNode = () => {
    const types = ['Polyglot VM', 'Salesforce Agent', 'Database Replica'];
    setNodes((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `node-${Math.floor(Math.random() * 1000)}`,
        type: types[Math.floor(Math.random() * types.length)],
        status: 'Active',
        ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      }
    ]);
  };

  const submitTicket = () => {
    if (!ticketTitle.trim() || !ticketDesc.trim()) {
      alert('Please fill both title and description.');
      return;
    }

    setTickets((prev) => [
      {
        id: Date.now(),
        title: ticketTitle,
        desc: ticketDesc,
        author: currentUser.username,
        status: 'Open',
        date: new Date().toLocaleString()
      },
      ...prev
    ]);

    setTicketTitle('');
    setTicketDesc('');
  };

  const openTicket = (id) => {
    setSelectedTicketId(id);
  };

  const closeModal = () => {
    setSelectedTicketId(null);
    setNewComment('');
  };

  const updateTicketStatus = (statusUpdate) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === selectedTicketId ? { ...ticket, status: statusUpdate } : ticket
      )
    );

    setComments((prev) => [
      ...prev,
      {
        ticketId: selectedTicketId,
        text: `System: Status updated to ${statusUpdate}`,
        author: 'System',
        role: 'admin',
        date: new Date().toLocaleString()
      }
    ]);
  };

  const postComment = () => {
    if (!newComment.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        ticketId: selectedTicketId,
        text: newComment.trim(),
        author: currentUser.username,
        role: currentUser.role,
        date: new Date().toLocaleString()
      }
    ]);

    setNewComment('');
  };

  if (!currentUser) {
    return (
      <div id="auth-container">
        <div className="auth-box">
          <h1>
            <i className="fas fa-cloud" /> SCMS Platform
          </h1>
          <p>Enterprise Cloud Infrastructure Management</p>

          <div className="tabs">
            <button
              className={`tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              Sign In
            </button>
            <button
              className={`tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>

          <form id="auth-form" onSubmit={handleAuth}>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {authMode === 'register' && (
              <div id="register-fields">
                <select value={role} onChange={(event) => setRole(event.target.value)}>
                  <option value="user">Infrastructure Analyst</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
            )}

            <button type="submit" id="auth-btn">
              {authMode === 'login' ? 'Sign In' : 'Register Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="app-container">
      <nav className="sidebar">
        <div className="brand">
          <i className="fas fa-cloud" /> SCMS
        </div>
        <ul className="nav-links">
          <li>
            <a
              href="#"
              className={currentView === 'dashboard' ? 'active' : ''}
              onClick={(event) => {
                event.preventDefault();
                switchView('dashboard');
              }}
            >
              <i className="fas fa-chart-line" /> Analytics
            </a>
          </li>
          {currentUser.role === 'admin' && (
            <li>
              <a
                href="#"
                className={currentView === 'infrastructure' ? 'active' : ''}
                onClick={(event) => {
                  event.preventDefault();
                  switchView('infrastructure');
                }}
              >
                <i className="fas fa-server" /> Cloud Manager
              </a>
            </li>
          )}
          <li>
            <a
              href="#"
              className={currentView === 'complaints' ? 'active' : ''}
              onClick={(event) => {
                event.preventDefault();
                switchView('complaints');
              }}
            >
              <i className="fas fa-ticket-alt" /> Support Tickets
            </a>
          </li>
        </ul>
        <div className="user-info">
          <div id="current-user-name">{currentUser.username}</div>
          <div id="current-user-role" className="role-badge">
            {currentUser.role.toUpperCase()}
          </div>
          <button className="logout-btn" onClick={logout}>
            <i className="fas fa-sign-out-alt" />
          </button>
        </div>
      </nav>

      <main className="main-content">
        <section className={`view ${currentView === 'dashboard' ? 'active' : ''}`}>
          <header className="section-header">
            <h2>Cloud System Overview</h2>
            <span className="live-status">
              <span className="dot pulse" /> Live
            </span>
          </header>

          <div className="metrics-grid">
            <div className="metric-card">
              <i className="fas fa-network-wired" />
              <div className="data">
                <h3>Polyglot App Traffic</h3>
                <p id="metric-traffic">{metrics.traffic}</p>
              </div>
            </div>
            <div className="metric-card">
              <i className="fas fa-microchip" />
              <div className="data">
                <h3>Compute Usage (EC2)</h3>
                <p id="metric-cpu">{Math.min(100, 64 + nodes.filter((n) => n.status === 'Active').length * 4)}% Avg</p>
              </div>
            </div>
            <div className="metric-card">
              <i className="fab fa-salesforce" />
              <div className="data">
                <h3>Salesforce Synced</h3>
                <p id="metric-sf">{1240 + tickets.length * 2} records</p>
              </div>
            </div>
            <div className="metric-card">
              <i className="fas fa-database" />
              <div className="data">
                <h3>Private Cloud (OpenStack)</h3>
                <p id="metric-storage">{(4.2 + metrics.activeNodes * 0.1).toFixed(1)} TB Used</p>
              </div>
            </div>
          </div>

          <div className="analysis-panel">
            <h3>Service Health Distribution</h3>
            <div className="bars">
              {serviceBars.map((bar) => (
                <div className="bar-group" key={bar.label}>
                  <label>{bar.label}</label>
                  <div className="progress-wrap">
                    <div className="progress" style={{ width: `${bar.value}%`, background: bar.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`view ${currentView === 'infrastructure' ? 'active' : ''}`}>
          <header className="section-header">
            <h2>Infrastructure Manager</h2>
            <button className="primary-btn" onClick={deployNewNode}>
              <i className="fas fa-plus" /> Deploy Node
            </button>
          </header>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Instance Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>IP Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="nodes-table-body">
                {nodes.map((node) => (
                  <tr key={node.id}>
                    <td>
                      <strong>{node.name}</strong>
                    </td>
                    <td>{node.type}</td>
                    <td>
                      <span className={`status-badge status-${node.status.toLowerCase()}`}>
                        {node.status}
                      </span>
                    </td>
                    <td>{node.ip}</td>
                    <td>
                      <button className="primary-btn" onClick={() => toggleNode(node.id)}>
                        {node.status === 'Active' ? 'Stop' : 'Start'}
                      </button>
                      <button className="warning-btn" onClick={() => deleteNode(node.id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`view ${currentView === 'complaints' ? 'active' : ''}`}>
          <header className="section-header">
            <h2>System Issues & Support</h2>
          </header>

          <div className="two-col">
            <div className="col left" id="ticket-form-container">
              <div className="card form-card">
                <h3>Open a New Ticket</h3>
                <input
                  type="text"
                  id="ticket-title"
                  placeholder="Issue Summary (e.g. EC2 connection failed)"
                  value={ticketTitle}
                  onChange={(event) => setTicketTitle(event.target.value)}
                />
                <textarea
                  id="ticket-desc"
                  rows="4"
                  placeholder="Detailed description..."
                  value={ticketDesc}
                  onChange={(event) => setTicketDesc(event.target.value)}
                />
                <button className="primary-btn fluid" onClick={submitTicket}>
                  Submit Ticket
                </button>
              </div>
            </div>

            <div className="col right">
              <div className="card list-card" id="tickets-list">
                {visibleTickets.length === 0 ? (
                  <p style={{ color: '#666' }}>No support tickets found.</p>
                ) : (
                  visibleTickets.map((ticket) => (
                    <div className="ticket-item" key={ticket.id} onClick={() => openTicket(ticket.id)}>
                      <span className={`status-badge status-${ticket.status.replace(' ', '')}`} style={{ float: 'right' }}>
                        {ticket.status}
                      </span>
                      <h4>
                        <i className="fas fa-ticket-alt" /> {ticket.title}
                      </h4>
                      <div className="ticket-meta">
                        <span>By: {ticket.author}</span>
                        <span>{ticket.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {selectedTicket && (
        <div id="ticket-modal" className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <span className="close-btn" onClick={closeModal}>
              &times;
            </span>
            <h2 id="modal-title">{selectedTicket.title}</h2>
            <div className="status-badge" id="modal-status">
              {selectedTicket.status}
            </div>
            <p id="modal-desc" className="modal-desc-text">
              {selectedTicket.desc}
            </p>
            <div className="modal-meta">
              <span>
                <i className="fas fa-user" /> <span id="modal-author">{selectedTicket.author}</span>
              </span>
              <span>
                <i className="far fa-clock" /> <span id="modal-date">{selectedTicket.date}</span>
              </span>
            </div>

            {currentUser.role === 'admin' && selectedTicket.status !== 'Resolved' && (
              <div className="admin-actions" id="admin-ticket-actions">
                <button className="success-btn" onClick={() => updateTicketStatus('Resolved')}>
                  Mark Resolved
                </button>
                <button className="warning-btn" onClick={() => updateTicketStatus('In Progress')}>
                  Mark In Progress
                </button>
              </div>
            )}

            <div className="comments-section">
              <h3>Thread</h3>
              <div id="modal-comments" className="comments-list">
                {ticketComments.length === 0 ? (
                  <p style={{ color: '#666' }}>No comments yet.</p>
                ) : (
                  ticketComments.map((comment, index) => (
                    <div className="comment-item" key={`${comment.ticketId}-${index}-${comment.date}`}>
                      <div className="comment-meta">
                        <strong>{comment.author}</strong> <span>{comment.role}</span>
                        <span>{comment.date}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="add-comment">
                <input
                  type="text"
                  id="new-comment"
                  placeholder="Type a response..."
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                />
                <button className="primary-btn" onClick={postComment}>
                  <i className="fas fa-paper-plane" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
