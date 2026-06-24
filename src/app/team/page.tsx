export default function TeamPage() {
  const members = [
    {
      role: "Pořadatel",
      name: "Tonda",
      image: "/team/poradatel.jpg",
    },
    {
      role: "Admin",
      name: "Vašek",
      image: "/team/admin.jpg",
    },
    {
      role: "Tester",
      name: "Pepa",
      image: "/team/tester.jpg",
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="comic-panel px-6 py-10">
        <h1 className="font-display text-4xl sm:text-6xl uppercase">
          Náš tým
        </h1>

        <p className="font-body text-steel mt-4 max-w-2xl">
          Lidé, kteří se starají o chod projektu a testování výzev.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {members.map((member) => (
          <div
            key={member.role}
            className="comic-panel overflow-hidden flex flex-col"
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-full aspect-square object-cover border-b-[3px] border-ink"
            />

            <div className="p-5 flex flex-col gap-2">
              <span className="tag tag-filled w-fit">
                {member.role}
              </span>

              <h2 className="font-display text-2xl uppercase">
                {member.name}
              </h2>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
