import { motion, AnimatePresence } from 'framer-motion';
import type { HealthStatus } from '@nexus/api';
import type { UseProjectFormReturn, LocationMode } from '../hooks/use-project-form';

interface ProjectFormModalProps {
  open: boolean;
  form: UseProjectFormReturn;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const HEALTH_OPTIONS: { value: HealthStatus; label: string }[] = [
  { value: 'on_track', label: 'On Track' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'failing', label: 'Failing' },
];

const LOCATION_MODES: { value: LocationMode; label: string }[] = [
  { value: 'type', label: 'Type address' },
  { value: 'pick', label: 'Pick on map' },
];

export function ProjectFormModal({ open, form, onClose, onSubmitSuccess }: ProjectFormModalProps) {
  const isEdit = form.editingId !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await form.submit();
      onSubmitSuccess();
    } catch {
      /* error is set in form state */
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="project-form-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="project-form-modal"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="project-form-modal__header">
              <h2 className="project-form-modal__title">
                {isEdit ? 'Edit Project' : 'New Project'}
              </h2>
              <button type="button" className="project-panel__close" onClick={onClose}>
                &times;
              </button>
            </div>

            <form className="project-form-modal__body" onSubmit={handleSubmit}>
              <FieldGroup label="Title">
                <input
                  className="project-form-modal__input"
                  type="text"
                  value={form.fields.title}
                  onChange={(e) => form.setField('title', e.target.value)}
                  placeholder="Project title"
                  autoFocus
                />
              </FieldGroup>

              <FieldGroup label="Health Status">
                <select
                  className="project-form-modal__select"
                  value={form.fields.health_status}
                  onChange={(e) => form.setField('health_status', e.target.value as HealthStatus)}
                >
                  {HEALTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </FieldGroup>

              <FieldGroup label="Location">
                <div className="project-form-modal__location-toggle">
                  {LOCATION_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      className={`project-form-modal__toggle-btn ${form.locationMode === mode.value ? 'project-form-modal__toggle-btn--active' : ''}`}
                      onClick={() => form.setLocationMode(mode.value)}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {form.locationMode === 'type' ? (
                  <input
                    className="project-form-modal__input"
                    type="text"
                    value={form.fields.address}
                    onChange={(e) => form.setField('address', e.target.value)}
                    placeholder="Enter address"
                  />
                ) : (
                  <div className="project-form-modal__pick-hint">
                    {form.fields.lat != null
                      ? form.fields.address || `${form.fields.lat.toFixed(4)}, ${form.fields.lng?.toFixed(4)}`
                      : 'Click the map to set location'}
                  </div>
                )}
              </FieldGroup>

              {form.error && (
                <p className="project-form-modal__error">{form.error}</p>
              )}

              <button
                type="submit"
                className="project-form-modal__submit"
                disabled={form.submitting}
              >
                {form.submitting ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="project-form-modal__field">
      <span className="project-form-modal__label">{label}</span>
      {children}
    </label>
  );
}
