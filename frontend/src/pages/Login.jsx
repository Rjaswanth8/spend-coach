import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components/UI';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <span style={styles.logo}>💰</span>
          <span style={styles.brandName}>SpendCoach</span>
        </div>
        <div style={styles.heroText}>
          <h1 style={styles.heroH1}>Your AI-powered<br />finance coach</h1>
          <p style={styles.heroSub}>Track spending, build savings habits, and get personalized insights — all through WhatsApp.</p>
        </div>
        <div style={styles.stats}>
          {[
            { val: '300M+', label: 'UPI Users' },
            { val: '₹0', label: 'To Start' },
            { val: 'AI', label: 'Coach' },
          ].map((s) => (
            <div key={s.label} style={styles.statItem}>
              <div style={styles.statVal}>{s.val}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={styles.features}>
          {['📊 Auto expense categorization', '🎯 Smart savings goals', '🤖 AI budget alerts', '💬 WhatsApp-first experience'].map((f) => (
            <div key={f} style={styles.featureItem}>{f}</div>
          ))}
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSub}>Sign in to your SpendCoach account</p>
          </div>

          <Alert type="error" message={apiError} />

          <form onSubmit={handleSubmit} style={styles.form}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon="✉️"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              icon="🔒"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a href="#" style={{ fontSize: 13, color: 'var(--green-dark)', fontWeight: 500 }}>
                Forgot password?
              </a>
            </div>
            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign In →
            </Button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine} />
          </div>

          <div style={styles.demoBox}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              🧪 Try with demo account
            </p>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setForm({ email: 'demo@spendcoach.in', password: 'demo1234' })}
            >
              Fill Demo Credentials
            </Button>
          </div>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--green-dark)', fontWeight: 600 }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex', minHeight: '100vh',
  },
  left: {
    flex: 1, background: 'linear-gradient(145deg, #0D1F1A 0%, #1A3530 60%, #0D2E28 100%)',
    padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 40,
    position: 'relative', overflow: 'hidden',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logo: { fontSize: 32 },
  brandName: {
    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
    color: '#fff', letterSpacing: '-0.5px',
  },
  heroText: { display: 'flex', flexDirection: 'column', gap: 14 },
  heroH1: {
    fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800,
    color: '#fff', lineHeight: 1.15, letterSpacing: '-1px',
  },
  heroSub: { fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 380 },
  stats: {
    display: 'flex', gap: 32,
  },
  statItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  statVal: {
    fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
    color: 'var(--green)',
  },
  statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  features: { display: 'flex', flexDirection: 'column', gap: 12 },
  featureItem: {
    fontSize: 14, color: 'rgba(255,255,255,0.75)',
    background: 'rgba(255,255,255,0.06)', borderRadius: 8,
    padding: '10px 14px', border: '1px solid rgba(255,255,255,0.1)',
  },
  right: {
    width: 480, background: 'var(--bg)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '48px 40px',
  },
  formCard: {
    width: '100%', display: 'flex', flexDirection: 'column', gap: 24,
    animation: 'fadeIn 0.5s ease',
  },
  formHeader: { display: 'flex', flexDirection: 'column', gap: 6 },
  formTitle: {
    fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
    color: 'var(--text)',
  },
  formSub: { fontSize: 15, color: 'var(--text-muted)' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  divider: { display: 'flex', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, background: 'var(--border)' },
  dividerText: { fontSize: 13, color: 'var(--text-light)' },
  demoBox: {
    background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)',
    padding: '16px', border: '1px dashed var(--border-dark)',
  },
  switchText: { textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' },
};
