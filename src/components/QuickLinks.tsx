import { FileText, Calendar, FlaskConical, Pill, Stethoscope, HeadsetIcon, BookOpen, Shield } from "lucide-react";

const quickLinks = [
  {
    icon: FileText,
    title: "Prontuário Eletrônico",
    description: "Acesse prontuários e históricos",
    href: "http://localhost:8085/systems/prontuario",
    color: "from-blue-500/20 to-blue-600/5",
  },
  {
    icon: Calendar,
    title: "Agendamento",
    description: "Consultas e procedimentos",
    href: "http://localhost:8085/systems/agendamento",
    color: "from-emerald-500/20 to-emerald-600/5",
  },
  {
    icon: FlaskConical,
    title: "Laboratório",
    description: "Resultados e solicitações",
    href: "http://localhost:8085/systems/lab",
    color: "from-purple-500/20 to-purple-600/5",
  },
  {
    icon: Pill,
    title: "Farmácia",
    description: "Estoque e dispensação",
    href: "http://localhost:8085/systems/farmacia",
    color: "from-orange-500/20 to-orange-600/5",
  },
  {
    icon: Stethoscope,
    title: "Calculadoras Médicas",
    description: "IMC, dosagem e mais",
    href: "http://localhost:8085/tools/calculadoras",
    color: "from-rose-500/20 to-rose-600/5",
  },
  {
    icon: BookOpen,
    title: "Protocolos",
    description: "Protocolos e diretrizes",
    href: "http://localhost:8085/tools/protocolos",
    color: "from-cyan-500/20 to-cyan-600/5",
  },
  {
    icon: HeadsetIcon,
    title: "Helpdesk",
    description: "Abra um chamado de TI",
    href: "http://localhost:8085/helpdesk/new",
    color: "from-yellow-500/20 to-yellow-600/5",
  },
  {
    icon: Shield,
    title: "Documentos",
    description: "Normas e regulamentos",
    href: "http://localhost:8085/tools/documentos",
    color: "from-indigo-500/20 to-indigo-600/5",
  },
];

const QuickLinks = () => {
  return (
    <section className="relative px-4 md:px-6 pb-10" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-base md:text-lg font-bold text-foreground mb-4 text-center">
          🚀 Links Rápidos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group glass rounded-xl p-3 flex flex-col items-center text-center gap-1.5 hover:scale-[1.05] transition-all duration-300 hover:shadow-md hover:shadow-primary/10"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <p className="font-display font-semibold text-[10px] text-foreground leading-tight">
                  {link.title}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
