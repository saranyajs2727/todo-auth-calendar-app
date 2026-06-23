import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isLogin ? 'login' : 'signup';
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      if (isLogin) router.push('/dashboard');
      else { setMsg('Signed up! Please log in.'); setIsLogin(true); }
    } else {
      setMsg(data.error || 'Something went wrong');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', background: '#f3f4f6', padding: '20px' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        {msg && <p style={{ color: 'blue' }}>{msg}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <button type="submit" style={{ padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px' }}>
          {isLogin ? 'Create an account' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}