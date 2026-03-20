import { useState, type FormEvent } from 'react';

const services = [
  'Basic House Cleaning',
  'Deep House Cleaning',
  'Move-In/Move-Out Cleaning',
  'Recurring Maid Services',
  'Airbnb Cleaning',
  'Commercial Cleaning',
  'Post-Construction Cleaning',
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
        <p className="text-green-700 mb-4">
          Thank you for reaching out. We'll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-[#E56B6F] font-semibold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-[#6D5455] mb-1.5">
          Name <span className="text-[#E56B6F]">*</span>
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E56B6F] focus:ring-2 focus:ring-[#E56B6F]/20 outline-none transition-all text-[#6D5455]"
          placeholder="Your full name"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-[#6D5455] mb-1.5">
          Email <span className="text-[#E56B6F]">*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E56B6F] focus:ring-2 focus:ring-[#E56B6F]/20 outline-none transition-all text-[#6D5455]"
          placeholder="your@email.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-[#6D5455] mb-1.5">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E56B6F] focus:ring-2 focus:ring-[#E56B6F]/20 outline-none transition-all text-[#6D5455]"
          placeholder="(405) 555-1234"
        />
      </div>

      {/* Service */}
      <div>
        <label htmlFor="service" className="block text-sm font-semibold text-[#6D5455] mb-1.5">
          Service Interested In
        </label>
        <select
          id="service"
          value={formData.service}
          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E56B6F] focus:ring-2 focus:ring-[#E56B6F]/20 outline-none transition-all text-[#6D5455] bg-white"
        >
          <option value="">Select a service (optional)</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-[#6D5455] mb-1.5">
          Message <span className="text-[#E56B6F]">*</span>
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E56B6F] focus:ring-2 focus:ring-[#E56B6F]/20 outline-none transition-all text-[#6D5455] resize-none"
          placeholder="Tell us about your cleaning needs..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-[#E56B6F] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#DC373C] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {status === 'sending' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending...
          </span>
        ) : (
          'Send Message'
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Or call us directly at{' '}
        <a href="tel:+15125550147" className="text-[#E56B6F] font-medium hover:underline">
          (512) 555-0147
        </a>
      </p>
    </form>
  );
}
