"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await registerUser(form);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Ucet vytvoren, ale prihlaseni se nezdarilo. Zkus se prihlasit rucne.");
      return;
    }

    router.push("/");
    router.refresh();
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
