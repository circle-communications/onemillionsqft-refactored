// Place at: app/privacy-policy/page.jsx  (App Router, served at /privacy-policy)
// Styled with Tailwind CSS. Brand red is #BC1F1A, search and replace it to rebrand.
// Tip: add `scroll-smooth` to your <html> tag if you want smooth anchor scrolling.

const LAST_UPDATED = "26th October, 2026";

export const metadata = {
    title: "Privacy Policy | OneMillionSqFt",
    description:
        "How OneMillionSqFt collects, uses and shares your information.",
};

const EMAIL = "enquiries@onemillionsqft.com";

const sections = [
    {
        title: "Introduction",
        blocks: [
            "Welcome to OneMillionSqFt! We are a real estate information service connecting people in the real estate market. OneMillionSqFt and its subsidiaries and affiliates (collectively \"OneMillionSqFt\") provide you with access to a variety of services, including but not limited to the OneMillionSqFt website (the \"Website\") and all the products and services available through it (collectively the \"Services\"). The Website is owned and operated by [Legal Entity Name], a company incorporated under the laws of [Jurisdiction].",
            "This Privacy Policy is incorporated as part of the OneMillionSqFt Terms of Use. Please read this Privacy Policy and our Terms of Use carefully before using our Services. By using the Services, you agree to the provisions of this Privacy Policy. If you do not want to be bound by it, please do not use our Services.",
        ],
    },
    {
        title: "Why We Collect Information from You",
        blocks: [
            "OneMillionSqFt is a real estate information service. To provide our Services, we use the information we collect to:",
            {
                list: [
                    "Help you find the most relevant information for your situation by customizing our Services to optimize your experience;",
                    "Keep you connected with OneMillionSqFt across the internet and update you with real estate-related news and information; and",
                    "Put you in touch with the right people to sell, buy, rent, or research real estate, and optimize the information we share with those parties so the relationship is productive and efficient.",
                ],
            },
            "Our goal in this policy is to be transparent about the data we collect, why we collect it, and how we use it, so that finding your next property is a pleasant experience.",
        ],
    },
    {
        title: "To Whom This Policy Applies",
        blocks: [
            "This Policy applies to everyone who uses our Services, though some parts are directed at specific groups, defined below.",
            {
                list: [
                    { b: "Users:", t: "everyone who uses our Services." },
                    {
                        b: "Real Estate Professionals (REPs):",
                        t: "Users who have created accounts (free or paid) with us to sell or rent real estate, take part in our advertising services, or use other Services directed at the professional real estate community. REPs include landlords, agents, developers, institutional property consultants, mortgage professionals and subscribers. We send leads to REPs on your behalf, as described in this Policy.",
                    },
                ],
            },
        ],
    },
    {
        title: "What Information We Collect, and Where We Get It",
        blocks: [
            {
                b: "From all visitors.",
                t: "Like many online services, we use session and persistent cookies, web beacons (tiny image files on web pages that communicate information about the page viewer to the beacon owner), log data, and third-party analytics services to collect and analyze information about all users of our Services. This includes User search preferences, interaction with ads on our Website, and location.",
            },
            "Our servers automatically record information (\"Log Data\") created by your use of the Services. Log Data may include your IP address, browser type, operating system, the referring web page, pages visited, location, mobile number, mobile carrier, email address, device, search terms, and cookie information. We receive Log Data when you visit our Website, sign in to our Services, or interact with our email notifications. We use it to provide, measure, customize and improve our Services, and to analyze it in aggregate. This Policy does not apply to, and we take no responsibility for, information collected by any third party through the Website, through links on the Website, or through advertisements.",
            "We also collect personal information such as your name, contact details, mobile number, email address and profile images that you provide during account creation or registration, or while interacting with our Services, so we can give you a smoother experience and tailor our Services to your preferences and interests.",
            {
                b: "Cookies.",
                t: "Cookies are small data files that we transfer to your computer. We use \"session\" cookies to keep you logged in, to understand how you interact with our Services, and to monitor aggregate usage and web traffic. We use \"persistent\" cookies to recognize you each time you return, for example to remember your most recent search and whether an agent responded to a query you sent through OneMillionSqFt. We use these to remember your preferences and, if you create an account, to keep your experience consistent after you register.",
            },
            "Most browsers accept cookies automatically, but you can change your settings or use third-party tools to refuse cookies, be prompted before accepting them, or delete cookies you already have. Some parts of our Services may not work if you disable cookies.",
            {
                b: "From REPs.",
                t: "If you create a REP account, whether as a landlord, agent, developer or subscriber, we ask for your name, company (if any), phone number and email address. If you create a paid REP account and become a subscriber, we also require a description of your campaign, and we collect financial data such as card details and billing addresses so we can handle billing. A OneMillionSqFt representative may call you to verify your information.",
            },
            {
                b: "From third parties.",
                t: "We may sometimes obtain information about you from third parties to help agents serve you better, for example predictions of your income range and how likely you are to purchase a property. We share this augmented data only with selected REPs (subscribers) whom you choose to contact through the OneMillionSqFt Services.",
            },
            {
                b: "Location data.",
                t: "If you provide location information (such as a PIN code, street address, or just a city) during registration or later through your account settings, we store it and associate it with your account. We may use and store location information to provide localized features, to analyze our Services with the help of third-party analytics services, to show you relevant advertising and marketing materials, and to improve and customize our Services.",
            },
            "If you do not want us to share your information with other companies or organizations, or you want your information deleted from our Website, email us at EMAIL.",
        ],
    },
    {
        title: "How We Use and Share Your Information",
        blocks: [
            "As you use and navigate our Website, we collect information that is either personally identifiable or not. We classify it as follows:",
            {
                list: [
                    { b: "Personal Information:", t: "personally identifiable information such as your name, address, age, email address and phone number." },
                    { b: "Sensitive Personal Information:", t: "your financial information, passwords, and any biometric, medical or health-related information." },
                    { b: "Other Information:", t: "everything else, for example device information, usage patterns and preferences, logs created when you use the Website, browser caches, location and IP address. These are examples only; the list is not exhaustive." },
                ],
            },
            "Personal Information is used to let you log in to your account, resolve service issues, inform you of new services or features, and communicate with you about your use of the Website. Other information is used for:",
            {
                list: [
                    "our business purposes, which may include viewing or advertising residential or commercial real estate, rental properties and associated services;",
                    "analytical purposes and data usage;",
                    "improving the Website and your experience; and",
                    "providing targeted advertisements.",
                ],
            },
            {
                b: "Legal and protective disclosures.",
                t: "We will share information we collect from you, including Personal Information, with a third party if we believe in good faith that it is required to comply with applicable law, regulation, legal process or an enforceable governmental request, or to protect our rights or interests. We may also release personal information to enforce our policies; to bill and collect amounts owed to us; to protect the safety of our users; to address fraud, security or technical issues; or where we reasonably believe an emergency involving immediate danger of death or serious physical injury requires disclosure without delay. OneMillionSqFt cooperates with law enforcement inquiries and may disclose some or all of your personal details in response to a request from law enforcement authorities, or where there is a bona fide need to prevent an imminent breach of the law.",
            },
            {
                b: "Email and phone contact.",
                t: "From time to time we may make the email addresses of people who access our Website available to other reputable organizations whose products or services we think you may find interesting. People who give us their telephone numbers online may receive calls or text messages from us about new products, services or upcoming events. To opt out of either, email EMAIL.",
            },
            {
                b: "Ad servers.",
                t: "To bring you offers of interest, we allow other companies to place ads on our web pages. As a result of your visit, ad server companies may collect information such as your domain type, IP address and clickstream information.",
            },
            {
                b: "Non-Personally Identifiable Information (Non-PII).",
                t: "Non-PII cannot by itself identify an individual. It includes information from your browser, operating system or device (browser settings, device identifiers, pages visited, the name or type of mobile app, visit dates and times, referring pages), the number of times a browser or device has seen a particular ad, generic categories about users and their interests (for example, \"male flat buyer\"), and the precise geographic location of a device where the user permits that collection.",
            },
            "We use Non-PII to provide and improve our Services; to show relevant, interest-based ads in a particular sequence and customized to a geographic region; to determine when users respond to ads; and to report aggregated statistics, such as the effectiveness of advertising campaigns. We disclose Non-PII that we collect, including cookie data, some log data and mobile data, to our advertising and analytics partners. We also share anonymous profiles of users who view a property with REPs.",
            {
                b: "Opting out of tracking.",
                t: "You can opt out of tracking Non-PII across all our online properties using the button at the end of this section. Opting out places a cookie in your browser, which we rely on to identify you as opted out. We will not be able to identify an opted-out user who clears the cookie, uses a different browser, or uses a different computer. We will stop tracking an opted-out user's behavior and stop displaying customized ads, although opted-out users may still see marketing, branding or promotional campaigns from us.",
            },
            { optOut: true },
            {
                b: "Direct contact with a REP.",
                t: "If you fill out a form to contact a REP (or any other contact form on our Website), or call a REP through our mobile site or app, we may share the personally identifiable information you give us and information about your use of the Services with the party you wanted to contact. This may include home search criteria and Log Data. If a REP wants to contact you based on the anonymized profile of OneMillionSqFt pages you visited, we will contact you first to see if you agree to the connection. Sometimes, if a third party is helping us improve the leads we provide to subscriber REPs, we may give that party additional but limited personally identifiable information, solely so they can carry out their duty to us.",
            },
            {
                b: "Mortgage services.",
                t: "If you request a mortgage quote through our Services, you authorize us to share the personally identifiable information our partners need to deliver the service. They may not use it for any other purpose.",
            },
            {
                b: "User-generated content.",
                t: "If you post a question, answer or blog on our Website, any personally identifiable information you submit can be read, collected or used by other users, and could be used to send you unsolicited messages. We are not responsible for personal information you choose to submit in these forums.",
            },
            {
                b: "Mobile ad networks and analytics.",
                t: "For our mobile products, we use third-party service providers, for the limited purpose of analyzing your mobile Log Data and location data, to improve and localize our Services, show relevant advertisements, and study how mobile users interact with our Website and Services.",
            },
        ],
    },
    {
        title: "Data Retention, Security and General Matters",
        blocks: [
            { b: "Data retention.", t: "We retain your Personal Information for as long as retention is required under applicable laws." },
            { b: "Account responsibility.", t: "You are responsible for keeping your password, email address and other account information secret and accurate at all times. We recommend a strong password that you do not use with other services. We are not responsible for personal data sent to a third party because of an incorrect email address." },
            { b: "Third-party websites.", t: "Our Website may contain links to other websites. Clicking one takes you to another website, and we accept no liability for misuse of information by the controller of any linked website, nor for content on websites that use OneMillionSqFt search functionality. We encourage you to read the privacy statements of those websites, which may differ from ours." },
            { b: "Sale or merger.", t: "Information about our Users and our Website is a business asset of OneMillionSqFt. Information about our Users, including personal information, will therefore be disclosed as part of any merger or acquisition, creation of a separate business to provide the Website or Services, sale or pledge of company assets, or insolvency, bankruptcy or receivership in which personal information is transferred as a business asset." },
            { b: "Security.", t: "We use commercially reasonable security measures to protect against loss, misuse and alteration of the information under our control, but we cannot absolutely guarantee the protection of any information shared with us. When you enter sensitive information (such as a card number) on our order forms, we encrypt the transmission using secure socket layer (SSL) technology." },
            { b: "Compliance.", t: "Access to and use of our computer resources, platform and Services are subject to compliance with applicable laws, rules and regulations, this Privacy Policy and our User Agreement. Non-compliance may result in immediate suspension or termination of access and/or removal of non-compliant information." },
            { b: "Policy changes.", t: "We may update this Privacy Policy to reflect changes to our information practices. If we change how we use your personal information, we will post a notice on this Website before the change takes effect. Please review this page periodically. Continued use of the Services constitutes acceptance of such updates." },
        ],
    },
    {
        title: "Contact Us",
        blocks: [
            "For questions about this Policy, or to ask us to stop sharing or to delete your information, email EMAIL.",
        ],
    },
];

function withEmail(text) {
    const parts = text.split("EMAIL");
    return parts.flatMap((part, i) =>
        i < parts.length - 1
            ? [part, <a key={i} href={`mailto:${EMAIL}`} className="text-[#BC1F1A] underline underline-offset-[3px] hover:decoration-2">{EMAIL}</a>]
            : [part]
    );
}

function Block({ block }) {
    if (typeof block === "string") {
        return (
            <p className="mb-4 text-[15.5px] leading-[1.8] text-[#2b3340] last:mb-0">
                {withEmail(block)}
            </p>
        );
    }

    if (block.list) {
        return (
            <ul className="mb-[18px] list-disc pl-[22px] last:mb-0">
                {block.list.map((item, i) => (
                    <li
                        key={i}
                        className="mb-2 text-[15.5px] leading-[1.8] text-[#2b3340] marker:text-[#BC1F1A]"
                    >
                        {typeof item === "string" ? (
                            withEmail(item)
                        ) : (
                            <>
                                <strong className="font-semibold text-[#14243d]">{item.b}</strong>{" "}
                                {withEmail(item.t)}
                            </>
                        )}
                    </li>
                ))}
            </ul>
        );
    }

    if (block.optOut) {
        // TODO: wire this to your tracking opt-out cookie handler.
        // Needs a client component (e.g. <OptOutButton />) to set the cookie.
        return (
            <p className="mb-4 last:mb-0">
                <a
                    className="inline-block rounded-lg bg-[#BC1F1A] px-[22px] py-[11px] text-sm font-semibold text-white no-underline transition hover:-translate-y-px hover:bg-[#14243d]"
                    href={`mailto:${EMAIL}?subject=Opt%20out%20of%20tracking`}
                >
                    I Agree, Opt me out
                </a>
            </p>
        );
    }

    return (
        <p className="mb-4 text-[15.5px] leading-[1.8] text-[#2b3340] last:mb-0">
            <strong className="font-semibold text-[#14243d]">{block.b}</strong>{" "}
            {withEmail(block.t)}
        </p>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <main className="bg-[#f6f8fb] text-[#2b3340]">
            {/* Hero */}
            <header className="bg-[#BC1F1A] pb-11 pt-[52px] sm:pb-16 sm:pt-[72px] print:bg-transparent print:pb-4 print:pt-0 print:text-black">
                <div className="container-x">
                    <span className="mb-3.5 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-white/70 print:text-black">
                        Legal
                    </span>
                    <h1 className="mb-3.5 mt-0 text-[clamp(30px,4vw,44px)] font-bold leading-[1.15] text-white print:text-black">
                        Privacy Policy
                    </h1>
                    <p className="m-0 max-w-[640px] text-base leading-[1.7] text-white/80 print:text-black">
                        How OneMillionSqFt collects, uses and shares your information when
                        you use our website and services.
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5 text-[13px] text-white/90 print:border-gray-400 print:text-black">
                        Last updated: {LAST_UPDATED}
                    </span>
                </div>
            </header>

            {/* Body */}
            <div className="pb-[88px] pt-14">
                <div className="container-xx">
                    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[360px_minmax(0,1fr)] print:block">
                        {/* Sticky contents (increase top-[100px] if your header is taller) */}
                        <aside className="lg:sticky lg:top-[100px] lg:self-start print:hidden">
                            <nav
                                aria-label="Privacy policy contents"
                                className="rounded-[14px] border border-[#e4e8ee] bg-white px-5 py-[22px] lg:max-h-[calc(100vh-124px)] lg:overflow-y-auto"
                            >
                                <p className="mb-3 mt-0 text-xs font-bold uppercase tracking-[0.12em] text-brand-600">
                                    Contents
                                </p>
                                <ol className="m-0 list-none p-0">
                                    {sections.map((s, i) => (
                                        <li key={s.title}>
                                            <a
                                                href={`#section-${i + 1}`}
                                                className="flex gap-2.5 rounded-lg px-2.5 py-[9px] text-sm leading-[1.4] text-[#2b3340] no-underline transition-colors hover:bg-[#eef2f8] hover:text-[#BC1F1A] focus-visible:bg-[#eef2f8] focus-visible:text-[#BC1F1A] focus-visible:outline-none"
                                            >
                                                <span className="font-semibold tabular-nums text-black">
                                                    {String(i + 1).padStart(2, "0")}
                                                </span>
                                                <span>{s.title}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        </aside>

                        {/* Sections */}
                        <div className="flex flex-col gap-6">
                            {sections.map((section, i) => (
                                <section
                                    key={section.title}
                                    id={`section-${i + 1}`}
                                    className={`scroll-mt-[100px] rounded-[14px] border bg-white px-[22px] py-[26px] shadow-[0_1px_2px_rgba(20,36,61,0.04)] sm:px-10 sm:py-9 print:break-inside-avoid print:shadow-none ${section.title === "Contact Us"
                                        ? "border-transparent"
                                        : "border-[#e4e8ee]"
                                        }`}
                                >
                                    <div className="mb-5 flex items-center gap-3.5 border-b border-[#e4e8ee] pb-[18px]">
                                        <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[10px] bg-[#eef2f8] text-sm font-bold text-[#BC1F1A]">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <h2 className="m-0 text-[22px] font-bold leading-[1.3] text-[#14243d]">
                                            {section.title}
                                        </h2>
                                    </div>
                                    {section.blocks.map((block, j) => (
                                        <Block key={j} block={block} />
                                    ))}
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}