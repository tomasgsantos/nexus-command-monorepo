import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { AuthUser } from '@nexus/api';
import { useLoginForm } from './hooks/use-login-form';
import { useDemoLogin } from './hooks/use-demo-login';
import './auth.css';

interface LoginCardProps {
  onAuthSuccess: (user: AuthUser) => void;
}

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' as const },
  }),
};

export function LoginCard({ onAuthSuccess }: LoginCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { loading: signInLoading, error: signInError, login } = useLoginForm(onAuthSuccess);
  const { loading: demoLoading, error: demoError, loginAsDemo } = useDemoLogin();

  const isLoading = signInLoading || demoLoading;
  const error = signInError ?? demoError;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  const handleDemo = async () => {
    const user = await loginAsDemo();
    if (user) onAuthSuccess(user);
  };

  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <motion.h1
        className="auth-headline"
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fieldVariants}
      >
        Nexus Command
      </motion.h1>
      <motion.p
        className="auth-subline"
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fieldVariants}
      >
        B2B Consultant Command Center
      </motion.p>

      <form className="auth-form" onSubmit={onSubmit}>
        <motion.div className="auth-field" custom={2} initial="hidden" animate="visible" variants={fieldVariants}>
          <label className="auth-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="auth-input"
            type="email"
            autoComplete="email"
            placeholder="you@firm.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </motion.div>

        <motion.div className="auth-field" custom={3} initial="hidden" animate="visible" variants={fieldVariants}>
          <label className="auth-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="auth-input"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </motion.div>

        {error && (
          <motion.p className="auth-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.p>
        )}

        <motion.div custom={4} initial="hidden" animate="visible" variants={fieldVariants}>
          <button className="auth-btn-primary" type="submit" disabled={isLoading}>
            {signInLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </motion.div>
      </form>

      <motion.div custom={5} initial="hidden" animate="visible" variants={fieldVariants}>
        <div className="auth-divider">or</div>
        <button
          className="auth-btn-ghost"
          type="button"
          onClick={handleDemo}
          disabled={isLoading}
        >
          {demoLoading ? 'Loading demo…' : 'Enter Demo'}
        </button>
        <p className="auth-demo-label">No credentials required</p>
      </motion.div>
    </motion.div>
  );
}
