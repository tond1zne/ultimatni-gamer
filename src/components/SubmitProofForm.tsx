"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitProof } from "@/actions/submissions";

export default function SubmitProofForm({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await submitProof(form);

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  if (success) {
    return (
      <div className="comic-panel p-5">
        <p className="font-mono text-sm">
          Důkaz odeslán. Admin ho teď posoudí — sleduj svůj profil pro výsledek.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="comic-panel p-5 flex flex-col gap-4">
      <input type="hidden" name="challengeId" value={challengeId} />
      <label className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest">
        Odkaz na video / screenshot (YouTube, Twitch klip, Google Drive...)
        <input
          name="proofUrl"
          type="url"
          required
          placeholder="https://..."
          className="input-comic"
        />
      </label>
      <label className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest">
        Poznámka (nepovinné)
        <textarea name="note" rows={2} className="input-comic" />
      </label>

      {error && <p className="font-mono text-xs border-2 border-ink p-2">{error}</p>}

      <button type="submit" disabled={loading} className="btn-comic w-fit disabled:opacity-50">
        {loading ? "Odesílám..." : "Odeslat důkaz"}
      </button>
    </form>
  );
}
