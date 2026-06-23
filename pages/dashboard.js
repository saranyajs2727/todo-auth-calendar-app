import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);

  // Calendar dates generation state
  const currentYear = 2026;
  const currentMonth = 5; // June (0-indexed)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    const res = await fetch('/api/todos');
    if (res.ok) setTodos(await res.json());
  };

  const handleAddOrCreate = async (e) => {
    e.preventDefault();
    if (editingTodo) {
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingTodo, title, date }),
      });
      if (res.ok) { setEditingTodo(null); setTitle(''); setDate(''); fetchTodos(); }
    } else {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date }),
      });
      if (res.ok) { setTitle(''); setDate(''); fetchTodos(); }
    }
  };

  const startEdit = (todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDate(todo.date);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      await fetch(`/api/todos?id=${id}`, { method: 'DELETE' });
      fetchTodos();
    }
  };

  const toggleStatus = async (todo) => {
    const newStatus = todo.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
    await fetch('/api/todos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...todo, status: newStatus }),
    });
    fetchTodos();
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', background: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>June 2026 Dashboard</h1>
      
      {/* Responsive Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginTop: '20px' }}>
        
        {/* Module 1: Entry Input Panel */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3>{editingTodo ? 'Update Task' : 'Add New Task'}</h3>
          <form onSubmit={handleAddOrCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="Task description..." value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
            <button type="submit" style={{ padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {editingTodo ? 'Save Changes' : 'Add Todo'}
            </button>
            {editingTodo && <button type="button" onClick={() => { setEditingTodo(null); setTitle(''); setDate(''); }} style={{ background: '#gray' }}>Cancel</button>}
          </form>

          <h3 style={{ marginTop: '25px' }}>Task List</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todos.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee', background: t.status === 'COMPLETED' ? '#f0fdf4' : 'transparent' }}>
                <div>
                  <span style={{ textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none', fontWeight: 'bold' }}>{t.title}</span>
                  <br /><small style={{ color: '#666' }}>{t.date}</small>
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <button onClick={() => toggleStatus(t)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{t.status === 'COMPLETED' ? '✅' : '⬜'}</button>
                  <button onClick={() => startEdit(t)} style={{ background: '#fbbf24', border: 'none', borderRadius: '3px', padding: '3px 7px', cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => handleDelete(t.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '3px', padding: '3px 7px', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 2: Interactive Responsive Calendar View */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3>Calendar View - June 2026</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {/* June 1st 2026 is a Monday. Let's add 1 empty spacer block for Sunday */}
            <div />
            {daysArray.map(day => {
              const currentFormattedDate = `2026-06-${String(day).padStart(2, '0')}`;
              const daysTodos = todos.filter(t => t.date === currentFormattedDate);

              return (
                <div key={day} style={{ minHeight: '65px', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '4px', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{day}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', overflowY: 'auto' }}>
                    {daysTodos.map(todo => (
                      <div key={todo.id} style={{ fontSize: '10px', background: todo.status === 'COMPLETED' ? '#d1fae5' : '#dbeafe', color: '#1e3a8a', padding: '2px', borderRadius: '2px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }} title={todo.title}>
                        {todo.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}