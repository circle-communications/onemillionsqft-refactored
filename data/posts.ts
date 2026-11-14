export interface BlogPost {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    date: string;
    readTime: number;
}

export const posts: BlogPost[] = [
    {
        id: 1,
        slug: 'chennai-real-estate-outlook-2026',
        title: "Chennai's Real Estate Outlook: What Buyers Should Expect in 2026",
        excerpt:
            'Rising demand in OMR and GST Road corridors, new RERA guidelines, and where prices are headed this year.',
        image:
            'https://images.pexels.com/photos/37224965/pexels-photo-37224965.jpeg?auto=compress&cs=tinysrgb&w=1200',
        category: 'Market Trends',
        date: 'Sep 21, 2026',
        readTime: 6,
    },
    {
        id: 2,
        slug: 'first-time-home-buyer-checklist',
        title: 'The Complete Checklist Every First-Time Home Buyer Needs',
        excerpt:
            'From loan pre-approval to final registration — the steps that save you time, money, and stress.',
        image:
            'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200',
        category: 'Buying Guide',
        date: 'Sep 21, 2026',
        readTime: 4,
    },
    {
        id: 3,
        slug: 'rera-registration-explained',
        title: 'RERA Registration Explained: Why It Matters for Every Buyer',
        excerpt:
            'What RERA actually protects you from, and how to verify a project before you sign.',
        image:
            'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=1200',
        category: 'Legal',
        date: 'Sep 21, 2026',
        readTime: 5,
    },
    {
        id: 4,
        slug: 'home-loan-interest-rates-guide',
        title: 'Home Loan Interest Rates: A Simple Guide for 2026',
        excerpt:
            'How to compare lenders and lock in the best rate for your budget.',
        image:
            'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1200',
        category: 'Finance',
        date: 'Sep 21, 2026',
        readTime: 3,
    },
    {
        id: 5,
        slug: 'villa-vs-apartment-which-is-right',
        title: 'Villa vs. Apartment: Which Is Right for Your Family?',
        excerpt:
            'Weighing space, maintenance, and long-term value between the two.',
        image:
            'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1200',
        category: 'Buying Guide',
        date: 'Sep 21, 2026',
        readTime: 4,
    },
];

