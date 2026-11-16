'use client';

import {
    ArrowLeft,
    Phone,
    Pencil,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    Wallet,
    Users2,
    Clock,
    Check,
    Mail,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEnquiry } from '@/components/layout/EnquiryProvider';
import { CATEGORIES, CATEGORY_BY_SLUG, isCategorySlug } from '@/lib/constants/property';
import { LeadSubmitError, submitLead } from '@/lib/leads/client';
// import { Honeypot } from '@/components/layout/Honeypot';

/** Same four categories the search filters use, so a posted property maps 1:1 onto the catalogue. */
const PROPERTY_TYPES = CATEGORIES.map((c) => ({ value: c.slug, label: c.singular }));
const BHK_OPTIONS = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'];
const POSSESSION_OPTIONS = ['Ready to move', 'Under construction'];

const BENEFITS = [
    { icon: Wallet, title: 'Free listing', desc: 'No cost to list your property, ever.' },
    { icon: ShieldCheck, title: 'No brokerage', desc: 'Deal directly, we never charge commission.' },
    { icon: Users2, title: 'Verified buyer leads', desc: 'Only serious, screened enquiries reach you.' },
    { icon: Clock, title: 'Listed within 24 hours', desc: 'Our team calls back and lists it fast.' },
];

type PostPropertyForm = {
    propertyType: string;
    bhk: string;
    location: string;
    price: string;
    name: string;
    phone: string;
    email: string;
    userType: string;
    projectName: string;
    area: string;
    possession: string;
    reraNumber: string;
    description: string;
};

const emptyForm: PostPropertyForm = {
    propertyType: '',
    bhk: '',
    location: '',
    price: '',
    name: '',
    phone: '',
    email: '',
    userType: 'Builder',
    projectName: '',
    area: '',
    possession: '',
    reraNumber: '',
    description: '',
};

/* ───────────────────────── Page ───────────────────────── */

export default function PostPropertyPage() {
    const router = useRouter();
    const [step, setStep] = useState<'phone' | 'details' | 'success'>('phone');
    const [form, setForm] = useState<PostPropertyForm>(emptyForm);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
    const [errors, setErrors] = useState<Partial<Record<keyof PostPropertyForm, string>>>({});
    const { openEnquiry } = useEnquiry();
    const [submitError, setSubmitError] = useState('');
    // const [trap, setTrap] = useState('');
    const showsBhk = !isCategorySlug(form.propertyType) || CATEGORY_BY_SLUG[form.propertyType].hasBedrooms;

    const update = (field: keyof PostPropertyForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validatePhone = () => {
        if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
            setErrors({ phone: 'Enter a valid 10-digit mobile number' });
            return false;
        }
        setErrors({});
        return true;
    };

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (validatePhone()) setStep('details');
    };

    const validateDetails = () => {
        const next: Partial<Record<keyof PostPropertyForm, string>> = {};
        if (!form.propertyType) next.propertyType = 'Select a property type';
        if (!form.projectName.trim()) next.projectName = 'Enter project / society name';
        if (!form.location.trim()) next.location = 'Enter a location';
        if (!form.area.trim()) next.area = 'Enter area in sq.ft';
        if (!form.price.trim()) next.price = 'Enter an expected price';
        if (!form.possession) next.possession = 'Select possession status';
        if (!form.name.trim()) next.name = 'Enter your name';
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateDetails()) return;
        setSubmitError('');
        setStatus('submitting');
        try {
            // await submitLead('post-property', { ...form, bhk: showsBhk ? form.bhk : '', hp: trap });
            await submitLead('post-property', { ...form, bhk: showsBhk ? form.bhk : '' });
            setStatus('idle');
            setStep('success');
        } catch (err) {
            setSubmitError(err instanceof LeadSubmitError ? err.message : 'Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    const stepIndex = step === 'phone' ? 1 : step === 'details' ? 2 : 3;

    return (
        <main className="min-h-screen bg-neutral-50">
            <div className="container-x py-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            </div>

            <div className="container-x pb-16">
                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    {/* Form column */}
                    <div className="rounded-2xl bg-white shadow-sm border border-neutral-100">
                        <div className="border-b border-neutral-100 px-6 py-6 sm:px-8">
                            <h1 className="text-2xl font-semibold text-neutral-900">Post Your Property
                                <span className="rounded-md bg-green-100 mx-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                                    Free
                                </span>
                            </h1>
                            <p className="mt-1 text-sm text-neutral-500">
                                Builder-only portal · Free listing, no brokerage — our team handles the rest.
                            </p>

                            {step !== 'success' && (
                                <div className="mt-5 flex items-center gap-2">
                                    <div className="flex flex-1 items-center gap-2">
                                        <span
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${stepIndex >= 1 ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-400'
                                                }`}
                                        >
                                            1
                                        </span>
                                        <span className="text-xs font-medium text-neutral-600">Mobile number</span>
                                    </div>
                                    <div className="flex flex-1 items-center gap-2">
                                        <span
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${stepIndex >= 2 ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-400'
                                                }`}
                                        >
                                            2
                                        </span>
                                        <span className="text-xs font-medium text-neutral-600">Property details</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {step === 'success' ? (
                            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center sm:px-8">
                                <CheckCircle2 className="h-14 w-14 text-brand-600" />
                                <p className="text-lg font-semibold text-neutral-800">Property submitted successfully</p>
                                <p className="max-w-sm text-sm text-neutral-500">
                                    Our team will call you on{' '}
                                    <span className="font-medium text-neutral-700">+91 {form.phone}</span> shortly to
                                    verify details and get your listing live.
                                </p>
                                <button
                                    onClick={() => router.push('/')}
                                    className="mt-3 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                                >
                                    Back to home
                                </button>
                            </div>
                        ) : step === 'phone' ? (
                            <form onSubmit={handleContinue} className="flex flex-col gap-4 px-6 py-6 sm:px-8">
                                <p className="text-sm text-neutral-500">
                                    Share your mobile number and our team will reach out to help you list your
                                    property.
                                </p>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-500">
                                        Mobile number
                                    </label>
                                    <div
                                        className={`flex items-center rounded-lg border px-3 focus-within:ring-2 focus-within:ring-brand-200 ${errors.phone ? 'border-red-400' : 'border-neutral-200'
                                            }`}
                                    >
                                        <span className="border-r border-neutral-200 pr-2 text-sm font-medium text-neutral-400">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            autoFocus
                                            value={form.phone}
                                            onChange={(e) =>
                                                update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))
                                            }
                                            placeholder="10-digit mobile number"
                                            className="w-full bg-transparent px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none"
                                        />
                                    </div>
                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                                </div>

                                <button
                                    type="submit"
                                    className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                                >
                                    Continue
                                </button>
                                <p className="text-center text-[12px] text-neutral-400">
                                    By continuing, you agree to be contacted by our team.
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-6 sm:px-8">
                                {/* <Honeypot value={trap} onChange={setTrap} /> */}
                                <button
                                    type="button"
                                    onClick={() => setStep('phone')}
                                    className="flex w-fit items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
                                >
                                    <Phone className="h-3.5 w-3.5" />
                                    +91 {form.phone}
                                    <Pencil className="h-3 w-3" />
                                </button>

                                {/* ── Builder-only select ── */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-500">
                                        User Type
                                    </label>
                                    <select
                                        value={form.userType}
                                        onChange={(e) => update('userType', e.target.value)}
                                        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-200 bg-neutral-50"
                                    >
                                        <option value="Builder">Builder</option>
                                    </select>
                                    <p className="mt-1 text-[11px] text-neutral-400">
                                        This portal is exclusively for builders.
                                    </p>
                                </div>

                                {/* Property type + BHK */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-neutral-500">
                                            Property type
                                        </label>
                                        <select
                                            value={form.propertyType}
                                            onChange={(e) => update('propertyType', e.target.value)}
                                            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-200 ${errors.propertyType ? 'border-red-400' : 'border-neutral-200'
                                                }`}
                                        >
                                            <option value="">Select property type</option>
                                            {PROPERTY_TYPES.map((t) => (
                                                <option key={t.value} value={t.value}>
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.propertyType && (
                                            <p className="mt-1 text-xs text-red-500">{errors.propertyType}</p>
                                        )}
                                    </div>

                                    {showsBhk && (
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-neutral-500">
                                                BHK (optional)
                                            </label>
                                            <select
                                                value={form.bhk}
                                                onChange={(e) => update('bhk', e.target.value)}
                                                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
                                            >
                                                <option value="">Select BHK</option>
                                                {BHK_OPTIONS.map((b) => (
                                                    <option key={b} value={b}>
                                                        {b}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Project name */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-500">
                                        Project name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.projectName}
                                        onChange={(e) => update('projectName', e.target.value)}
                                        placeholder="e.g. Green Valley Residences"
                                        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-200 ${errors.projectName ? 'border-red-400' : 'border-neutral-200'
                                            }`}
                                    />
                                    {errors.projectName && (
                                        <p className="mt-1 text-xs text-red-500">{errors.projectName}</p>
                                    )}
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-500">Location</label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => update('location', e.target.value)}
                                        placeholder="e.g. Medavakkam, Chennai"
                                        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-200 ${errors.location ? 'border-red-400' : 'border-neutral-200'
                                            }`}
                                    />
                                    {errors.location && (
                                        <p className="mt-1 text-xs text-red-500">{errors.location}</p>
                                    )}
                                </div>

                                {/* Area + Price */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-neutral-500">
                                            Area (sq.ft)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.area}
                                            onChange={(e) => update('area', e.target.value)}
                                            placeholder="e.g. 1250"
                                            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-200 ${errors.area ? 'border-red-400' : 'border-neutral-200'
                                                }`}
                                        />
                                        {errors.area && <p className="mt-1 text-xs text-red-500">{errors.area}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-neutral-500">
                                            Expected price
                                        </label>
                                        <input
                                            type="text"
                                            value={form.price}
                                            onChange={(e) => update('price', e.target.value)}
                                            placeholder="e.g. 75,00,000"
                                            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-200 ${errors.price ? 'border-red-400' : 'border-neutral-200'
                                                }`}
                                        />
                                        {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                                    </div>
                                </div>

                                {/* Possession */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-500">
                                        Possession
                                    </label>
                                    <select
                                        value={form.possession}
                                        onChange={(e) => update('possession', e.target.value)}
                                        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-200 ${errors.possession ? 'border-red-400' : 'border-neutral-200'
                                            }`}
                                    >
                                        <option value="">Select possession status</option>
                                        {POSSESSION_OPTIONS.map((p) => (
                                            <option key={p} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.possession && (
                                        <p className="mt-1 text-xs text-red-500">{errors.possession}</p>
                                    )}
                                </div>

                                {/* RERA number */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-500">
                                        RERA number <span className="text-neutral-400">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.reraNumber}
                                        onChange={(e) => update('reraNumber', e.target.value)}
                                        placeholder="e.g. TN/29/Building/0123/2024"
                                        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                                    />
                                </div>

                                {/* Name + Email */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-neutral-500">
                                            Your name
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => update('name', e.target.value)}
                                            placeholder="Full name"
                                            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-200 ${errors.name ? 'border-red-400' : 'border-neutral-200'
                                                }`}
                                        />
                                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-neutral-500">
                                            Email (optional)
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => update('email', e.target.value)}
                                            placeholder="you@example.com"
                                            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-200 ${errors.email ? 'border-red-400' : 'border-neutral-200'
                                                }`}
                                        />
                                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                    </div>
                                </div>

                                {/* Additional details */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-500">
                                        Additional details <span className="text-neutral-400">(optional)</span>
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => update('description', e.target.value)}
                                        rows={3}
                                        placeholder="Amenities, unique highlights, possession timeline, etc."
                                        className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                                    />
                                </div>

                                {status === 'error' && (
                                    <p className="text-xs text-red-500">{submitError || 'Something went wrong. Please try again.'}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                                >
                                    {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Trust / benefits sidebar */}
                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                Why list with us
                            </p>
                            <ul className="mt-4 flex flex-col gap-4">
                                {BENEFITS.map((b) => (
                                    <li key={b.title} className="flex items-start gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                                            <b.icon className="h-4.5 w-4.5 text-brand-600" />
                                        </span>
                                        <span>
                                            <span className="block text-sm font-semibold text-neutral-800">{b.title}</span>
                                            <span className="block text-xs text-neutral-500">{b.desc}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-4 rounded-2xl bg-brand-600 p-6 text-white shadow-sm">
                            <p className="text-sm font-semibold">Prefer to talk it through?</p>
                            <p className="mt-1 text-xs text-brand-50">
                                Our team is available to guide you — leave your details and we&apos;ll call back.
                            </p>
                            <button
                                onClick={() => openEnquiry({ heading: 'Need help listing your property?' })}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
                            >
                                <Mail className="h-4 w-4" />
                                Enquire Now
                            </button>
                        </div>

                        <ul className="mt-4 flex flex-col gap-2 px-1 text-xs text-neutral-500">
                            {/* <li className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-green-500" />
                                No hidden charges at any stage
                            </li> */}
                            <li className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-green-500" />
                                Your details are never shared publicly
                            </li>
                        </ul>
                    </aside>
                </div>
            </div>

        </main>
    );
}