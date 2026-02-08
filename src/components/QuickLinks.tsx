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
    <section className="relative px-6 pb-16" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
          🚀 Links Rápidos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group glass rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:scale-[1.04] transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-7 h-7 text-foreground" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-foreground">
                    {link.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {link.description}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
