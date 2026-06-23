"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Spatny email nebo heslo.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto comic-panel p-8">
      <h1 className="font-display text-3xl uppercase mb-6">Přihlášení</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest">
          Email
          <input name="email" type="email" required className="input-comic" />
        </label>
        <label className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest">
          Heslo
          <input name="password" type="password" required className="input-comic" />
        </label>

        {error && <p className="font-mono text-xs border-2 border-ink p-2">{error}</p>}

        <button type="submit" disabled={loading} className="btn-comic mt-2 disabled:opacity-50">
          {loading ? "Přihlašuji..." : "Přihlásit se"}
        </button>
      </form>

      <p className="font-mono text-xs text-steel mt-6">
        Nemáš účet?{" "}
        <Link href="/register" className="underline">
          Zaregistruj se
        </Link>
      </p>
    </div>
  );
}
