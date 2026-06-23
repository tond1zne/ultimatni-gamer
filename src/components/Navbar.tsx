import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b-[3px] border-ink bg-paper sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl sm:text-2xl tracking-tight uppercase">
          Ultimate<span className="border-b-4 border-ink">Streamer</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
          <Link href="/challenges" className="hover:underline">
            Vyzvy
          </Link>
          <Link href="/leaderboard" className="hover:underline">
            Zebricek
          </Link>
          {session?.user && (
            <Link href="/profile" className="hover:underline">
              Profil
            </Link>
          )}
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="hidden sm:inline font-mono text-xs text-steel">
                {session.user.name}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-comic-outline text-xs px-3 py-2">
                Prihlasit
              </Link>
              <Link href="/register" className="btn-comic text-xs px-3 py-2">
                Registrace
              </Link>
            </>
          )}
        </div>
      </div>

      <nav className="md:hidden flex items-center gap-4 px-4 pb-3 font-mono text-xs uppercase tracking-widest overflow-x-auto">
        <Link href="/challenges" className="hover:underline whitespace-nowrap">
          Vyzvy
        </Link>
        <Link href="/leaderboard" className="hover:underline whitespace-nowrap">
          Zebricek
        </Link>
        {session?.user && (
          <Link href="/profile" className="hover:underline whitespace-nowrap">
            Profil
          </Link>
        )}
        {session?.user?.role === "ADMIN" && (
          <Link href="/admin" className="hover:underline whitespace-nowrap">
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}
