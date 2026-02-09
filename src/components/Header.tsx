import WeatherCard from "@/components/WeatherCard";

const menuItems = [
  {
    label: "Sistemas",
    links: [
      { text: "Prontuário Eletrônico", href: "http://localhost:8085/systems/prontuario" },
      { text: "Agendamento", href: "http://localhost:8085/systems/agendamento" },
      { text: "Laboratório", href: "http://localhost:8085/systems/lab" },
      { text: "Farmácia", href: "http://localhost:8085/systems/farmacia" },
    ],
  },
  {
    label: "Ferramentas",
    links: [
      { text: "Calculadoras Médicas", href: "http://localhost:8085/tools/calculadoras" },
      { text: "Protocolos", href: "http://localhost:8085/tools/protocolos" },
      { text: "Documentos", href: "http://localhost:8085/tools/documentos" },
    ],
  },
  {
    label: "Helpdesk",
    links: [
      { text: "Abrir Chamado", href: "http://localhost:8085/helpdesk/new" },
      { text: "Meus Chamados", href: "http://localhost:8085/helpdesk/my" },
      { text: "FAQ", href: "http://localhost:8085/helpdesk/faq" },
    ],
  },
];

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 glass-strong" style={{ zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
            N
          </div>
          <span className="font-display font-bold text-base md:text-lg text-foreground tracking-tight">
            Navarro Medical
          </span>
        </div>

        {/* Menu — desktop only */}
        <nav className="hidden md:flex items-center gap-3">
          {menuItems.map((item) => (
            <div key={item.label} className="nav-dropdown">
              <a href="#" className="menu-btn">
                {item.label}
              </a>
              <div className="dropdown-content glass-strong rounded-xl p-2 shadow-2xl">
                {item.links.map((link) => (
                  <a
                    key={link.text}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dropdown-item"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Right side: Weather + Login — desktop only */}
        <div className="hidden md:flex items-center gap-4">
          <WeatherCard />
          <a href="/login" className="login-btn">
            Login
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
