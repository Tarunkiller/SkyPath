import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="h-56 w-full overflow-hidden rounded-3xl bg-indigo-50">
          <svg viewBox="0 0 640 320" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 240C160 120 320 280 480 160C560 100 640 160 640 160V320H0V240Z" fill="#e0e7ff"/>
            <path d="M196 170L288 140L426 172L496 198L563 215L618 231" stroke="#4338ca" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M134 186C140 180 156 178 170 182L242 198C260 204 275 223 270 244L238 322" fill="#c7d2fe"/>
            <path d="M273 69C280 65 294 64 309 69L406 95C424 101 436 119 434 138L430 198C428 211 414 221 401 218L334 206L273 69Z" fill="#4f46e5"/>
            <circle cx="554" cy="50" r="30" fill="#fbbf24"/>
          </svg>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-900">You're offline.</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">SkyPath continues to hold your latest booking data while the network is unavailable. Return to your cached itinerary and reconnect when ready.</p>
          <Link href="/bookings" className="inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">View my bookings</Link>
        </div>
      </div>
    </div>
  );
}
