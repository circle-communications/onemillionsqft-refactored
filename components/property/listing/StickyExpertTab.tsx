'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, MessagesSquare, X } from 'lucide-react';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '918925343397'; // digits only, with country code
const MESSAGE = 'Hi, I need help finding a property on your website.';
const STORAGE_KEY = 'sticky-expert-bubble-dismissed';
const BUBBLE_DELAY_MS = 6000;

export function StickyExpertTab() {
    const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

    const [dismissed, setDismissed] = useState(true); // start hidden to avoid a flash on load
    const [showBubble, setShowBubble] = useState(false);

    useEffect(() => {
        try {
            if (sessionStorage.getItem(STORAGE_KEY)) return;
        } catch {
            /* storage unavailable: fall through and show */
        }

        setDismissed(false);
        const timer = setTimeout(() => setShowBubble(true), BUBBLE_DELAY_MS);
        return () => clearTimeout(timer);
    }, []);

    const dismissBubble = () => {
        setShowBubble(false);
        setDismissed(true);
        try {
            sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
            /* storage unavailable: dismiss for this render only */
        }
    };

    const bubbleVisible = showBubble && !dismissed;

    return (
        <div className="fixed bottom-20 right-3 z-40 flex flex-col items-end gap-3 md:hidden">
            {/* greeting bubble */}
            <div
                aria-hidden={!bubbleVisible}
                className={`relative hidden w-64 rounded-2xl rounded-br-sm border border-neutral-200 bg-white p-3 shadow-xl transition-all duration-300 sm:block ${bubbleVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
                    }`}
            >
                <button
                    type="button"
                    onClick={dismissBubble}
                    tabIndex={bubbleVisible ? 0 : -1}
                    aria-label="Dismiss chat message"
                    className="absolute right-2 top-2 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={bubbleVisible ? 0 : -1}
                    className="flex items-start gap-2.5 pr-5"
                >
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                    </span>

                    <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-neutral-900">Property Expert</span>
                        <span className="text-xs leading-snug text-neutral-600">
                            Chat with us on WhatsApp.
                        </span>
                    </span>
                </a>
            </div>

            {/* launcher */}
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with an expert on WhatsApp"
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
                {/* <MessageCircle className="h-6 w-6" aria-hidden="true" /> */}
                <MessagesSquare className="h-6 w-6" aria-hidden="true" />
                <span className="absolute right-0 top-0 flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                </span>
            </a>
        </div>
    );
}