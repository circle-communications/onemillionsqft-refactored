import { handleLead } from '@/lib/leads/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = (req: Request) => handleLead('newsletter', req);
