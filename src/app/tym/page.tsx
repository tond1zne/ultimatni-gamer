type Member = {
  name: string;
  photo: string; // cesta do /public, napr. "/team/jmeno.jpg"
};

// --- TADY UPRAV JMENA A CESTY K FOTKAM ---
const OWNER: Member = { name: "Jméno Příjmení", photo: "/team/owner.jpg" };

const ADMINS: Member[] = [
  { name: "Jméno Příjmení", photo: "/team/admin1.jpg" },
  { name: "Jméno Příjmení", photo: "/team/admin2.jpg" },
];

const TESTERS: Member[] = [{ name: "Jméno Příjmení", photo: "/team/tester1.jpg" }];
// ------------------------------------------

function MemberCard({ member }: { member: Member }) {
  return (
    <div className="comic-panel-tight flex flex-col items-center gap-3 p-4 w-40">
      <img
        src={member.photo}
        alt={member.name}
        className="w-24 h-24 object-cover border-2 border-ink"
      />
      <span className="font-display uppercase text-sm text-center leading-tight">
        {member.name}
      </span>
    </div>
  );
}

function TeamSection({ title, members }: { title: string; members: Member[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl uppercase">{title}</h2>
      <div className="flex flex-wrap gap-4">
        {members.map((m) => (
          <MemberCard key={m.name} member={m} />
        ))}
      </div>
    </section>
  );
}

export default function TeamPage() {
  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-display text-3xl sm:text-4xl uppercase">Náš tým</h1>

      <TeamSection title="Majitel" members={[OWNER]} />
      <TeamSection title="Admini" members={ADMINS} />
      <TeamSection title="Testeři" members={TESTERS} />
    </div>
  );
}
