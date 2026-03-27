import { motion } from 'framer-motion';
import type { AuthUser } from '@nexus/api';
import { LoginCard } from './LoginCard';
import './auth.css';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  return (
    <motion.div
      className="auth-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <LoginCard onAuthSuccess={onLoginSuccess} />
    </motion.div>
  );
}
