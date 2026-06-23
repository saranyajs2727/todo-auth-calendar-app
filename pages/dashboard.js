import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [notification, setNotification] = useState('');
  const router = useRouter();

  // Calendar dates generation state
  const currentYear = 2026;
  const currentMonth = 5; // June (0-indexed)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    setLoading(true);
    const res = await fetch('/api/todos');
    if (res.ok) setTodos(await res.json());
    setLoading(false);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleAddOrCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (editingTodo) {
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingTodo, title, date }),
      });
      if (res.ok) {
        setEditingTodo(null);
        setTitle('');
        setDate('');
        showNotification('✅ Task updated successfully!');
        await fetchTodos();
      }
    } else {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date }),
      });
      if (res.ok) {
        setTitle('');
        setDate('');
        showNotification('🎉 Task added successfully!');
        await fetchTodos();
      }
    }
    setLoading(false);
  };

  const startEdit = (todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDate(todo.date);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      setLoading(true);
      await fetch(`/api/todos?id=${id}`, { method: 'DELETE' });
      showNotification('🗑️ Task deleted!');
      await fetchTodos();
      setLoading(false);
    }
  };

  const toggleStatus = async (todo) => {
    const newStatus = todo.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
    setLoading(true);
    await fetch('/api/todos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...todo, status: newStatus }),
    });
    showNotification(newStatus === 'COMPLETED' ? '✨ Task completed!' : '📝 Task reopened!');
    await fetchTodos();
    setLoading(false);
  };

  const filteredTodos = todos.filter(t => filterStatus === 'ALL' || t.status === filterStatus);

  const handleLogout = async () => {
    const res = await fetch('/api/logout', { method: 'POST' });
    if (res.ok) {
      router.push('/');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', animation: 'fadeIn 0.6s ease-in' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '32px', color: '#1f2937', marginBottom: '8px', animation: 'slideUp 0.5s ease-out' }}>📅 June 2026 Dashboard</h1>
            <p style={{ color: '#6b7280' }}>Organize and track your tasks with ease</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => e.target.style.background = '#dc2626'}
            onMouseLeave={(e) => e.target.style.background = '#ef4444'}
          >
            🚪 Logout
          </button>
        </div>

        {notification && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#10b981',
            color: '#fff',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideUp 0.3s ease-out',
            zIndex: 1000,
          }}>
            {notification}
          </div>
        )}
      
        {/* Responsive Workspace Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginTop: '20px' }}>
          
          {/* Module 1: Entry Input Panel */}
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', animation: 'slideUp 0.5s ease-out 0.1s both' }}>
            <h3 style={{ fontSize: '18px', color: '#1f2937', marginBottom: '20px' }}>{editingTodo ? '✏️ Update Task' : '✨ Add New Task'}</h3>
            <form onSubmit={handleAddOrCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                disabled={loading}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #e5e7eb',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1,
                }}
              />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                disabled={loading}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #e5e7eb',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1,
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px',
                  background: loading ? '#9ca3af' : '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? '⏳ Processing...' : editingTodo ? '💾 Save Changes' : '➕ Add Todo'}
              </button>
              {editingTodo && (
                <button
                  type="button"
                  onClick={() => { setEditingTodo(null); setTitle(''); setDate(''); }}
                  style={{
                    padding: '10px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  ✖️ Cancel
                </button>
              )}
            </form>

            <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', color: '#1f2937', marginBottom: '12px' }}>📋 Task List</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {['ALL', 'PENDING', 'COMPLETED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    style={{
                      padding: '6px 14px',
                      background: filterStatus === status ? '#3b82f6' : '#f3f4f6',
                      color: filterStatus === status ? '#fff' : '#6b7280',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>Loading tasks...</div>
                ) : filteredTodos.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No tasks yet. Add one to get started! 🚀</div>
                ) : (
                  filteredTodos.map((t, idx) => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        borderRadius: '8px',
                        background: t.status === 'COMPLETED' ? '#f0fdf4' : '#f9fafb',
                        border: `1px solid ${t.status === 'COMPLETED' ? '#dcfce7' : '#e5e7eb'}`,
                        transition: 'all 0.2s ease',
                        animation: `slideUp 0.3s ease-out ${idx * 0.05}s`,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = t.status === 'COMPLETED' ? '#f0fdf4' : '#f9fafb'}
                    >
                      <div style={{ flex: 1 }}>
                        <span style={{ textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none', fontWeight: '500', color: t.status === 'COMPLETED' ? '#9ca3af' : '#1f2937' }}>{t.title}</span>
                        <br /><small style={{ color: '#9ca3af', fontSize: '12px' }}>📅 {t.date}</small>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => toggleStatus(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>{t.status === 'COMPLETED' ? '✅' : '⬜'}</button>
                        <button onClick={() => startEdit(t)} style={{ background: '#fbbf24', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', transition: 'all 0.2s ease' }}>✏️</button>
                        <button onClick={() => handleDelete(t.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', transition: 'all 0.2s ease' }}>🗑️</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Module 2: Interactive Responsive Calendar View */}
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', animation: 'slideUp 0.5s ease-out 0.2s both' }}>
            <h3 style={{ fontSize: '18px', color: '#1f2937', marginBottom: '20px' }}>📆 Calendar View - June 2026</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: 'bold', marginBottom: '15px', color: '#6b7280' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ fontSize: '12px', fontWeight: 'bold', color: '#1f2937' }}>
                  {d}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {/* June 1st 2026 is a Monday. Let's add 1 empty spacer block for Sunday */}
              <div />
              {daysArray.map((day, idx) => {
                const currentFormattedDate = `2026-06-${String(day).padStart(2, '0')}`;
                const daysTodos = todos.filter(t => t.date === currentFormattedDate);
                const hasCompleted = daysTodos.some(t => t.status === 'COMPLETED');

                return (
                  <div
                    key={day}
                    style={{
                      minHeight: '100px',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '10px',
                      background: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      animation: `slideUp 0.4s ease-out ${0.3 + idx * 0.02}s`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.background = '#f0f9ff';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>{day}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
                      {daysTodos.length === 0 ? (
                        <span style={{ fontSize: '11px', color: '#d1d5db' }}>—</span>
                      ) : (
                        daysTodos.map(todo => (
                          <div
                            key={todo.id}
                            style={{
                              fontSize: '11px',
                              background: todo.status === 'COMPLETED' ? '#d1fae5' : '#dbeafe',
                              color: todo.status === 'COMPLETED' ? '#065f46' : '#0369a1',
                              padding: '4px 6px',
                              borderRadius: '4px',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              fontWeight: '500',
                              transition: 'all 0.2s ease',
                            }}
                            title={todo.title}
                          >
                            {todo.status === 'COMPLETED' ? '✓ ' : '○ '}{todo.title}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}