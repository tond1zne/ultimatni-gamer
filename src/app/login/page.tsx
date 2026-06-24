"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resendVerificationEmail } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resendDone, setResendDone] = useState(false);

  const showResend = !!error && error.toLowerCase().includes("email");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResendDone(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(
        res.error === "CredentialsSignin" ? "Špatný email nebo heslo." : res.error
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleResend() {
    const form = new FormData();
    form.set("email", email);
    await resendVerificationEmail(form);
    setResendDone(true);
  }

  return (
    <div className="max-w-md mx-auto comic-panel p-8">
      <h1 className="font-display text-3xl uppercase mb-6">Přihlášení</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest">
          Email
          <input
            name="email"
            type="email"
            required
            className="input-comic"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 font-mono text-xs uppercase tracking-widest">
          Heslo
          <input name="password" type="password" required className="input-comic" />
        </label>

        {error && <p className="font-mono text-xs border-2 border-ink p-2">{error}</p>}

        {showResend && !resendDone && (
          <button type="button" onClick={handleResend} className="font-mono text-xs underline text-left">
            Znovu odeslat potvrzovací email
          </button>
        )}
        {resendDone && (
          <p className="font-mono text-xs text-steel">
            Pokud účet existuje a ještě není potvrzený, poslali jsme nový email.
          </p>
        )}

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
