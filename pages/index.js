import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgType, setMsgType] = useState('info');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const action = isLogin ? 'login' : 'signup';
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsgType('success');
      if (isLogin) {
        setMsg('Logging in...');
        setTimeout(() => router.push('/dashboard'), 500);
      } else {
        setMsg('Signed up! Please log in.');
        setIsLogin(true);
        setEmail('');
        setPassword('');
      }
    } else {
      setMsgType('error');
      setMsg(data.error || 'Something went wrong');
    }
  };

  const handleTabSwitch = () => {
    setIsLogin(!isLogin);
    setMsg('');
    setEmail('');
    setPassword('');
    setMsgType('info');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', animation: 'fadeIn 0.6s ease-in' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '420px', animation: 'slideUp 0.5s ease-out' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '8px' }}>📝 Todo App</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Manage your tasks efficiently</p>
        </div>

        <div style={{ display: 'flex', gap: '0', marginBottom: '30px', background: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => handleTabSwitch()}
            style={{
              flex: 1,
              padding: '10px',
              background: isLogin ? '#2563eb' : 'transparent',
              color: isLogin ? '#fff' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
            }}
          >
            Login
          </button>
          <button
            onClick={() => handleTabSwitch()}
            style={{
              flex: 1,
              padding: '10px',
              background: !isLogin ? '#2563eb' : 'transparent',
              color: !isLogin ? '#fff' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
            }}
          >
            Sign Up
          </button>
        </div>

        {msg && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              animation: 'slideUp 0.3s ease-out',
              background: msgType === 'error' ? '#fee2e2' : msgType === 'success' ? '#dcfce7' : '#dbeafe',
              color: msgType === 'error' ? '#991b1b' : msgType === 'success' ? '#166534' : '#0c4a6e',
              fontSize: '14px',
              border: `1px solid ${msgType === 'error' ? '#fecaca' : msgType === 'success' ? '#bbf7d0' : '#bae6fd'}`,
            }}
          >
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1.5px solid #e5e7eb',
              fontSize: '14px',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              cursor: loading ? 'not-allowed' : 'text',
              opacity: loading ? 0.6 : 1,
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1.5px solid #e5e7eb',
              fontSize: '14px',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              cursor: loading ? 'not-allowed' : 'text',
              opacity: loading ? 0.6 : 1,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              background: loading ? '#9ca3af' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '15px',
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}