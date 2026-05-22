'use client';

import { useEffect, useState } from 'react';

export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!promptEvent || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-slate-200 bg-white px-5 py-4 shadow-2xl sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Install SkyPath for offline access</p>
          <p className="text-sm text-slate-600">Save flight search and bookings to your home screen.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => { promptEvent.prompt(); }}>
            Install
          </button>
          <button type="button" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700" onClick={() => setDismissed(true)}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};
