import { motion } from 'framer-motion';

interface KpiCardProps {
  label: string;
  value: string | number;
  secondary?: string;
  index?: number;
}

export function KpiCard({ label, value, secondary, index = 0 }: KpiCardProps) {
  return (
    <motion.div
      className="kpi-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <span className="kpi-card__label">{label}</span>
      <span className="kpi-card__value">{value}</span>
      {secondary && (
        <span className="kpi-card__secondary">{secondary}</span>
      )}
    </motion.div>
  );
}
