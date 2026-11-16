export const MIN_PAGE_TIME_MS = 2000;

export type AutomationReason = 'missing-timer' | 'too-fast';

export function automationReason(body: unknown): AutomationReason | null {
    const ft = body && typeof body === 'object' ? (body as Record<string, unknown>).ft : undefined;
    if (typeof ft !== 'number' || !Number.isFinite(ft)) return 'missing-timer';
    return ft < MIN_PAGE_TIME_MS ? 'too-fast' : null;
}