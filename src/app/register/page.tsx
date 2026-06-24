"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await registerUser(form);

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto comic-panel p-8 flex flex-col gap-4">
        <span className="tag tag-filled w-fit">JEŠTĚ JEDEN KROK</span>
        <h1 className="font-display text-2xl uppercase">Zkontroluj email</h1>
        <p className="font-mono text-sm text-steel">
          Poslali jsme ti potvrzovací odkaz. Klikni na něj a pak se budeš moct přihlásit.
          Nezapomeň zkontrolovat i složku spam.
        </p>
        <Link href="/login" className="btn-comic w-fit mt-2">
          Přejít na přihlášení
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto comic-panel p-8">
      <h1 className="font-display text-3xl uppercase mb-6">Registrace</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest">
          Jméno / přezdívka
          <input name="name" type="text" required minLength={2} className="input-comic" />
        </label>
        <label className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest">
          Email
          <input name="email" type="email" required className="input-comic" />
        </label>
        <label className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest">
          Heslo
          <input name="password" type="password" required minLength={6} className="input-comic" />
        </label>

        {error && <p className="font-mono text-xs border-2 border-ink p-2">{error}</p>}

        <button type="submit" disabled={loading} className="btn-comic mt-2 disabled:opacity-50">
          {loading ? "Vytvářím účet..." : "Vytvořit účet"}
        </button>
      </form>

      <p className="font-mono text-xs text-steel mt-6">
        Už máš účet?{" "}
        <Link href="/login" className="underline">
          Přihlas se
        </Link>
      </p>
    </div>
  );
}
