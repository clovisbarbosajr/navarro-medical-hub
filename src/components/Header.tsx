import WeatherCard from "@/components/WeatherCard";
import navarroLogo from "@/assets/navarro-logo.png";

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
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={navarroLogo} alt="Navarro Medical Centers" className="h-10 w-auto" />
        </div>

        {/* Menu */}
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

        {/* Right side: Weather + Login */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <WeatherCard />
          </div>
          <a
            href="http://localhost:8085/user/auth/login"
            target="_blank"
            rel="noopener noreferrer"
            className="login-btn"
          >
            Login
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
