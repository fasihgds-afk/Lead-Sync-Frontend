import React, { useCallback, useMemo, useState } from 'react';
import {
  FiDatabase,
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiCalendar,
  FiBookOpen,
  FiHome,
  FiSave,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiLoader,
} from 'react-icons/fi';
import { metaLeadAPI } from '../../../api/metaLeadAPI';

// ─── constants ────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
  date: '',
  program: '',
  school: '',
  fullName: '',
  email: '',
  number: '',
  website: '',
};

// Single source of truth for every field: label, icon, input type, layout,
// and its own validator. Adding/removing a field means editing this array only.
const FIELDS = [
  {
    name: 'date',
    label: 'Date',
    icon: FiCalendar,
    type: 'date',
    required: true,
    validate: (v) => (!v ? 'Date is required' : ''),
  },
  {
    name: 'program',
    label: 'Program',
    icon: FiBookOpen,
    type: 'text',
    required: true,
    placeholder: 'e.g. BS Computer Science',
    validate: (v) => (!v.trim() ? 'Program is required' : ''),
  },
  {
    name: 'school',
    label: 'School',
    icon: FiHome,
    type: 'text',
    required: true,
    placeholder: 'e.g. ABC University',
    validate: (v) => (!v.trim() ? 'School is required' : ''),
  },
  {
    name: 'fullName',
    label: 'Full Name',
    icon: FiUser,
    type: 'text',
    required: true,
    placeholder: 'e.g. John Doe',
    validate: (v) => (!v.trim() ? 'Full name is required' : ''),
  },
  {
    name: 'email',
    label: 'Email',
    icon: FiMail,
    type: 'email',
    placeholder: 'e.g. john@example.com',
    // Cross-field rule (email OR number) is handled separately in validateForm.
    validate: (v) => (v.trim() && !EMAIL_REGEX.test(v.trim()) ? 'Enter a valid email address' : ''),
  },
  {
    name: 'number',
    label: 'Phone Number',
    icon: FiPhone,
    type: 'tel',
    placeholder: 'e.g. +923001234567',
    validate: () => '',
  },
  {
    name: 'website',
    label: 'Website',
    icon: FiGlobe,
    type: 'text',
    placeholder: 'e.g. https://example.com',
    fullWidth: true,
    validate: (v) => {
      if (!v.trim()) return '';
      const url = /^https?:\/\//i.test(v.trim()) ? v.trim() : `https://${v.trim()}`;
      try {
        // eslint-disable-next-line no-new
        new URL(url);
        return '';
      } catch {
        return 'Enter a valid website URL';
      }
    },
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const fieldCls = (hasErr) =>
  `block w-full min-w-0 pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border ${
    hasErr ? 'border-rose-500' : 'border-[var(--border-primary)]'
  } text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)] [color-scheme:dark]`;

/** Validate every field, plus the email/phone cross-field rule. Returns an errors map. */
function validateForm(data) {
  const errors = {};

  for (const field of FIELDS) {
    const message = field.validate(data[field.name] ?? '');
    if (message) errors[field.name] = message;
  }

  if (!data.email.trim() && !data.number.trim()) {
    errors.email = errors.email || 'At least one of email or phone number is required';
  }

  return errors;
}

// ─── presentational sub-component ────────────────────────────────────────────
const FormField = React.memo(function FormField({ field, value, error, disabled, onChange }) {
  const Icon = field.icon;
  return (
    <div className={`space-y-2 min-w-0 overflow-hidden ${field.fullWidth ? 'col-span-2' : ''}`}>
      <label
        htmlFor={field.name}
        className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
      >
        {field.label} {field.required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
          <Icon className="w-4 h-4" />
        </div>
        <input
          id={field.name}
          name={field.name}
          type={field.type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={field.placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
          className={fieldCls(!!error)}
          style={
            field.type === 'date'
              ? { appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }
              : undefined
          }
        />
      </div>
      {error && (
        <p id={`${field.name}-error`} className="text-xs text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
});

// ─── toast ────────────────────────────────────────────────────────────────────
const Toast = React.memo(function Toast({ tone, icon: Icon, message, onDismiss }) {
  const toneCls =
    tone === 'success'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
      : 'bg-rose-500/10 border-rose-500/20 text-rose-600';
  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between animate-fadeIn ${toneCls}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold">{message}</span>
      </div>
      <button onClick={onDismiss} aria-label="Dismiss">
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
});

// ─── component ────────────────────────────────────────────────────────────────
export default function AddData() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
    setApiError((prev) => (prev ? '' : prev));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
    setErrors({});
  }, []);

  const handleCancel = useCallback(() => {
    if (submitting) return;
    resetForm();
    setApiError('');
    setSuccess(false);
  }, [submitting, resetForm]);

  // The single point of contact with the backend: createMetaLead only.
  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      setApiError('');

      const validationErrors = validateForm(formData);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;

      setSubmitting(true);
      try {
        await metaLeadAPI.createMetaLead({
          date: formData.date,
          program: formData.program.trim(),
          school: formData.school.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          number: formData.number.trim(),
          website: formData.website.trim(),
        });

        setSuccess(true);
        resetForm();
        setTimeout(() => setSuccess(false), 4000);
      } catch (err) {
        if (err?.fieldErrors && typeof err.fieldErrors === 'object') {
          setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
        }
        setApiError(err?.message || 'Something went wrong. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [formData, resetForm]
  );

  const fieldNodes = useMemo(
    () =>
      FIELDS.map((field) => (
        <FormField
          key={field.name}
          field={field}
          value={formData[field.name]}
          error={errors[field.name]}
          disabled={submitting}
          onChange={handleChange}
        />
      )),
    [formData, errors, submitting, handleChange]
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto animate-fadeIn min-h-screen">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
            <FiDatabase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Add Meta Lead
            </h1>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
              Create a new meta lead — assign a manager from the Meta Leads page
            </p>
          </div>
        </div>
      </div>

      {success && (
        <Toast
          tone="success"
          icon={FiCheckCircle}
          message="Meta lead created successfully!"
          onDismiss={() => setSuccess(false)}
        />
      )}

      {apiError && (
        <Toast tone="error" icon={FiAlertCircle} message={apiError} onDismiss={() => setApiError('')} />
      )}

      {/* Form card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="border-b border-[var(--border-primary)] pb-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 rounded-full bg-[var(--accent-primary)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-wide">Meta Lead Information</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            <FiInfo className="w-4 h-4" />
            <span>Fields marked * are required</span>
          </div>
        </div>

        <form onSubmit={handleSave} noValidate className="space-y-6">
          <div className="grid gap-4 md:gap-6" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            {fieldNodes}
          </div>

          <div className="pt-6 border-t border-[var(--border-primary)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] font-semibold text-sm border border-[var(--border-primary)] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}