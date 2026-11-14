/** Company-wide constants: one place to change a phone number, logo or hours. */

export const SITE = {
  name: 'OneMillionSqFt',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  phone: '+91 8925343397',
  phoneHref: 'tel:+918925343397',
  whatsappHref: 'https://wa.me/918925343397',
  email: 'enquiries@onemillionsqft.com',
  hours: 'Mon – Sat, 9:30 AM – 6:30 PM',
  cities: 'Chennai | Bengaluru',
  logo: 'https://res.cloudinary.com/dib2kvojz/image/upload/v1788575455/one-million-logo_vmkdor.png',
  logoLight: 'https://res.cloudinary.com/dib2kvojz/image/upload/v1792490320/one-million-sqft-logo_blyf18.png',
} as const;

export const PATHS = {
  home: '/',
  search: '/properties',
  postProperty: '/post-property',
  contact: '/contact',
  about: '/about',
  blog: '/blogs',
} as const;
