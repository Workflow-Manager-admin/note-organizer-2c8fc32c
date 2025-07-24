import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// --- Theme Colors from Specs ---
const THEME_COLORS = {
  primary: '#1976d2',
  secondary: '#424242',
  accent: '#fbc02d',
  background: '#fafbfc',
  light: '#ffffff',
  sidebar: '#f8f9fa',
  text: '#282c34',
};

// --- 1. AUTHENTICATION (Demo only: optional login, persisted via localStorage) ---
const AUTH_KEY = 'notes_app_demo_auth_user';

function useAuth() {
  const [user, setUser] = useState(() => {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  });

  // PUBLIC_INTERFACE
  function login(username) {
    setUser({ username });
    localStorage.setItem(AUTH_KEY, JSON.stringify({ username }));
  }

  // PUBLIC_INTERFACE
  function logout() {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }

  // PUBLIC_INTERFACE
  function isAuthenticated() {
    return !!user;
  }

  return { user, login, logout, isAuthenticated };
}

// --- 2. NOTES STATE MANAGEMENT ---
const NOTES_KEY = 'notes_app_demo_notes';

function useNotes() {
  const [notes, setNotes] = useState(() => {
    const notesData = localStorage.getItem(NOTES_KEY);
    if (notesData) return JSON.parse(notesData);
    return [];
  });

  // PUBLIC_INTERFACE
  function addNote(note) {
    const newNote = { ...note, id: Date.now() };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  }

  // PUBLIC_INTERFACE
  function editNote(id, updated) {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, ...updated } : note
    );
    setNotes(updatedNotes);
    localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  }

  // PUBLIC_INTERFACE
  function deleteNote(id) {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  }

  // PUBLIC_INTERFACE
  function clearAllNotes() {
    setNotes([]);
    localStorage.removeItem(NOTES_KEY);
  }

  return { notes, addNote, editNote, deleteNote, clearAllNotes };
}

// --- 3. SIDEBAR NAVIGATION ---
function Sidebar({ onLogout, user, onSelect, currentSection }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-top">
        <div className="app-title">📝 Note Organizer</div>
        <div className="sidebar-links">
          <SidebarLink
            label="All Notes"
            icon="📒"
            active={currentSection === 'notes'}
            onClick={() => onSelect('notes')}
          />
          <SidebarLink
            label="Add Note"
            icon="➕"
            active={currentSection === 'add'}
            onClick={() => onSelect('add')}
          />
        </div>
      </div>
      <div className="sidebar-bottom">
        {user ? (
          <>
            <div className="sidebar-user">👤 {user.username}</div>
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <span className="sidebar-user">🚪 Not logged in</span>
        )}
      </div>
    </nav>
  );
}

function SidebarLink({ label, icon, active, ...props }) {
  return (
    <button
      className={`sidebar-link${active ? ' active' : ''}`}
      {...props}
    >
      <span className="sidebar-link-icon">{icon}</span>
      {label}
    </button>
  );
}

// --- 4. MAIN NOTES LIST ---
function NotesList({ notes, onEdit, onDelete, onSearch, searchTerm }) {
  return (
    <div className="notes-list-container">
      <div className="notes-list-header">
        <h2>Your Notes</h2>
        <SearchBar value={searchTerm} onChange={onSearch} />
      </div>
      {notes.length === 0 ? (
        <div className="notes-empty">
          No notes found.<br />Create one with the "Add Note" button.
        </div>
      ) : (
        <ul className="notes-list">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => onEdit(note)}
              onDelete={() => onDelete(note.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// --- 5. NOTE CARD COMPONENT ---
function NoteCard({ note, onEdit, onDelete }) {
  return (
    <li className="note-card">
      <div>
        <div className="note-title">{note.title}</div>
        <div className="note-content">{note.content}</div>
        <div className="note-meta">
          {note.updatedAt
            ? `Updated: ${new Date(note.updatedAt).toLocaleString()}`
            : `Created: ${new Date(note.id).toLocaleString()}`}
        </div>
      </div>
      <div className="note-actions">
        <button className="btn-note-edit" title="Edit" onClick={onEdit}>✏️</button>
        <button className="btn-note-delete" title="Delete" onClick={onDelete}>🗑️</button>
      </div>
    </li>
  );
}

// --- 6. NOTE FORM COMPONENT ---
function NoteForm({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note ? note.title : '');
  const [content, setContent] = useState(note ? note.content : '');

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    if (title.trim() === '' && content.trim() === '') return;
    onSave({
      ...note,
      title,
      content,
      updatedAt: Date.now(),
    });
    setTitle('');
    setContent('');
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <input
        className="note-input"
        type="text"
        placeholder="Note title"
        value={title}
        maxLength={48}
        autoFocus
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        className="note-textarea"
        placeholder="Type your note..."
        value={content}
        rows={6}
        onChange={e => setContent(e.target.value)}
      />
      <div className="note-form-actions">
        <button className="btn-primary" type="submit">
          {note ? 'Save Changes' : 'Add Note'}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// --- 7. LOGIN FORM ---
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length === 0) return;
    onLogin(trimmed);
  }
  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Sign in (optional)</h2>
      <input
        type="text"
        className="login-input"
        placeholder="Username"
        value={username}
        maxLength={24}
        onChange={(e) => setUsername(e.target.value)}
        autoFocus
      />
      <button className="btn-primary" type="submit">Log In</button>
      <span className="login-hint">Or continue without login</span>
    </form>
  );
}

// --- 8. SEARCH BAR ---
function SearchBar({ value, onChange }) {
  return (
    <input
      className="search-bar"
      type="text"
      placeholder="Search notes..."
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label="Search notes"
    />
  );
}

// --- 9. THEME (Light only for now, but easy to expand) ---
function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

// --- 10. MAIN APP COMPOSITION ---
function App() {
  // Theme (light/dark)
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auth & Notes hooks
  const { user, login, logout } = useAuth();
  const { notes, addNote, editNote, deleteNote } = useNotes();

  // State: View ('notes', 'add', 'edit', 'login')
  const [view, setView] = useState('notes');
  // State: for editing
  const [editingNote, setEditingNote] = useState(null);
  // State: search
  const [search, setSearch] = useState('');

  // Filtered notes (by search term)
  const visibleNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const term = search.trim().toLowerCase();
    return notes.filter(
      note =>
        (note.title && note.title.toLowerCase().includes(term)) ||
        (note.content && note.content.toLowerCase().includes(term))
    );
  }, [search, notes]);

  // Handlers
  function handleSaveNote(note) {
    if (editingNote) {
      editNote(editingNote.id, note);
    } else {
      addNote(note);
    }
    setEditingNote(null);
    setView('notes');
  }

  function handleEditNote(note) {
    setEditingNote(note);
    setView('edit');
  }

  function handleCancelForm() {
    setEditingNote(null);
    setView('notes');
  }

  return (
    <div className="app-outer">
      <Sidebar
        user={user}
        onLogout={logout}
        onSelect={(section) => {
          setView(section);
          setEditingNote(null);
        }}
        currentSection={view === 'edit' ? 'notes' : view}
      />

      <main className="main-content">
        <header className="main-header">
          <span />
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </header>
        <div className="main-content-inner">
          {!user ? (
            <LoginForm onLogin={login} />
          ) : view === 'add' ? (
            <NoteForm onSave={handleSaveNote} onCancel={handleCancelForm} />
          ) : view === 'edit' ? (
            <NoteForm
              note={editingNote}
              onSave={handleSaveNote}
              onCancel={handleCancelForm}
            />
          ) : (
            <NotesList
              notes={visibleNotes}
              onEdit={handleEditNote}
              onDelete={deleteNote}
              onSearch={setSearch}
              searchTerm={search}
            />
          )}
        </div>
        <footer className="main-footer">
          <small>
            &copy; 2024 Note Organizer. Theme by KAVIA.{' '}
            <a
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="main-footer-link"
            >
              Built with React
            </a>
          </small>
        </footer>
      </main>
    </div>
  );
}

export default App;
