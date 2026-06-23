"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn-comic-outline text-xs px-3 py-2"
    >
      Odhlasit
    </button>
  );
}
