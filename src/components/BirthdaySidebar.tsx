// Mock data — ready for HumHub integration
const birthdayList = [
  { name: "Ana Beatriz Silva", photo: "https://i.pravatar.cc/80?img=1", day: 3 },
  { name: "Carlos Eduardo", photo: "https://i.pravatar.cc/80?img=3", day: 8 },
  { name: "Mariana Oliveira", photo: "https://i.pravatar.cc/80?img=5", day: 12 },
  { name: "Dr. Rafael Costa", photo: "https://i.pravatar.cc/80?img=7", day: 15 },
  { name: "Juliana Santos", photo: "https://i.pravatar.cc/80?img=9", day: 18 },
  { name: "Pedro Henrique", photo: "https://i.pravatar.cc/80?img=11", day: 22 },
  { name: "Camila Ferreira", photo: "https://i.pravatar.cc/80?img=16", day: 27 },
];

const BirthdaySidebar = () => {
  const currentMonth = new Date().toLocaleDateString("pt-BR", { month: "long" });

  return (
    <div className="glass-strong rounded-2xl p-5 w-72 max-h-[480px] flex flex-col" style={{ zIndex: 1 }}>
      <h3 className="font-display font-bold text-foreground text-base mb-4 flex items-center gap-2">
        🎂 Aniversariantes — <span className="capitalize">{currentMonth}</span>
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {birthdayList.map((person) => (
          <div
            key={person.name}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <img
              src={person.photo}
              alt={person.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
              <p className="text-xs text-muted-foreground">Dia {person.day}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BirthdaySidebar;
