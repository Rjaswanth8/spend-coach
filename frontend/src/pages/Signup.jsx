import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components/UI';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Enter your full name (min 2 chars)';
    if (!form.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit Indian number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    setApiError('');
    try {
      await signup(form.name.trim(), form.email, form.password, form.phone || undefined);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Signup failed. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#E53E3E', '#EF9F27', '#3B82F6', '#00C896', '#00A878'][strength];

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.brand}>
          <span style={{ fontSize: 32 }}>💰</span>
          <span style={styles.brandName}>SpendCoach</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 style={styles.heroH1}>Start your free<br />finance journey</h1>
          <p style={styles.heroSub}>Join thousands of Indians who've taken control of their spending with AI-powered insights.</p>
        </div>

        <div style={styles.planCards}>
          {[
            { name: 'Free', price: '₹0', perks: ['Weekly summary', 'Basic categories', '3 goals max'], highlight: false },
            { name: 'Pro', price: '₹199/mo', perks: ['AI coach conversations', 'Budget alerts', 'Savings goals', 'Bill negotiator'], highlight: true },
          ].map((plan) => (
            <div key={plan.name} style={{
              ...styles.planCard,
              background: plan.highlight ? 'rgba(0,200,150,0.12)' : 'rgba(255,255,255,0.05)',
              border: plan.highlight ? '1px solid rgba(0,200,150,0.4)' : '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', fontSize: 15 }}>
                  {plan.name}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: plan.highlight ? 'var(--green)' : 'rgba(255,255,255,0.6)', fontSize: 16 }}>
                  {plan.price}
                </span>
              </div>
              {plan.perks.map((p) => (
                <div key={p} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>
                  ✓ {p}
                </div>
              ))}
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          🔒 DPDP-compliant • Client-side SMS parsing • No raw data stored
        </p>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.formWrap}>
          {/* Progress */}
          <div style={styles.progress}>
            {[1, 2].map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                  background: step >= s ? 'var(--green)' : 'var(--surface-alt)',
                  color: step >= s ? '#fff' : 'var(--text-light)',
                  transition: 'all 0.3s ease',
                }}>
                  {step > s ? '✓' : s}
                </div>
                <span style={{ fontSize: 13, color: step >= s ? 'var(--text)' : 'var(--text-light)', fontWeight: step === s ? 600 : 400 }}>
                  {s === 1 ? 'Your Info' : 'Password'}
                </span>
                {s < 2 && <div style={{ width: 32, height: 1, background: step > s ? 'var(--green)' : 'var(--border)', transition: 'background 0.3s ease' }} />}
              </div>
            ))}
          </div>

          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>{step === 1 ? 'Create your account' : 'Set your password'}</h2>
            <p style={styles.formSub}>{step === 1 ? 'Free forever. No credit card needed.' : 'Almost there! Choose a strong password.'}</p>
          </div>

          <Alert type="error" message={apiError} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {step === 1 ? (
              <>
                <Input label="Full name" placeholder="Priya Sharma" icon="👤" value={form.name} onChange={set('name')} error={errors.name} />
                <Input label="Email address" type="email" placeholder="priya@example.com" icon="✉️" value={form.email} onChange={set('email')} error={errors.email} />
                <Input
                  label="WhatsApp number (optional)"
                  placeholder="98765 43210"
                  icon="📱"
                  value={form.phone}
                  onChange={set('phone')}
                  error={errors.phone}
                  hint="Used to send your weekly summary via WhatsApp"
                />
                <Button type="button" fullWidth size="lg" onClick={handleNext}>
                  Continue →
                </Button>
              </>
            ) : (
              <>
                <Input label="Password" type="password" placeholder="Min 6 characters" icon="🔒" value={form.password} onChange={set('password')} error={errors.password} />
                {form.password && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 99,
                          background: i <= strength ? strengthColor : 'var(--border)',
                          transition: 'background 0.3s ease',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: strengthColor, fontWeight: 500 }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
                <Input label="Confirm password" type="password" placeholder="Repeat your password" icon="🔑" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                    ← Back
                  </Button>
                  <Button type="submit" loading={loading} style={{ flex: 2 }}>
                    Create Account 🎉
                  </Button>
                </div>
              </>
            )}
          </form>

          <p style={styles.terms}>
            By signing up, you agree to our{' '}
            <a href="#" style={{ color: 'var(--green-dark)' }}>Terms of Service</a> and{' '}
            <a href="#" style={{ color: 'var(--green-dark)' }}>Privacy Policy</a>.
          </p>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--green-dark)', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh' },
  left: {
    flex: 1, background: 'linear-gradient(145deg, #0D1F1A 0%, #1A3530 60%, #0D2E28 100%)',
    padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36,
    overflow: 'hidden',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandName: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fff' },
  heroH1: { fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.5px' },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 360 },
  planCards: { display: 'flex', flexDirection: 'column', gap: 12 },
  planCard: { padding: '16px', borderRadius: 12 },
  right: {
    width: 500, background: 'var(--bg)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '48px 40px',
  },
  formWrap: { width: '100%', display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' },
  progress: { display: 'flex', alignItems: 'center', gap: 4 },
  formHeader: { display: 'flex', flexDirection: 'column', gap: 6 },
  formTitle: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text)' },
  formSub: { fontSize: 14, color: 'var(--text-muted)' },
  terms: { fontSize: 12, color: 'var(--text-light)', textAlign: 'center', lineHeight: 1.6 },
};
