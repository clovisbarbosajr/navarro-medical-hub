import { Phone } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data — ready for HumHub integration
const extensions = [
  { department: "Recepção", contact: "Maria Silva", extension: "1001" },
  { department: "Enfermagem", contact: "João Santos", extension: "1002" },
  { department: "Laboratório", contact: "Ana Costa", extension: "1003" },
  { department: "Farmácia", contact: "Carlos Lima", extension: "1004" },
  { department: "TI / Helpdesk", contact: "Pedro Alves", extension: "1005" },
  { department: "RH", contact: "Lucia Mendes", extension: "1006" },
  { department: "Financeiro", contact: "Roberto Dias", extension: "1007" },
  { department: "Diretoria Médica", contact: "Dr. Fernando", extension: "1008" },
];

const ExtensionsTable = () => {
  return (
    <section className="relative px-6 pb-16" style={{ zIndex: 1 }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
          📞 Ramais & Contatos
        </h2>
        <div className="glass rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="font-display font-semibold text-foreground">
                  Setor
                </TableHead>
                <TableHead className="font-display font-semibold text-foreground">
                  Contato
                </TableHead>
                <TableHead className="font-display font-semibold text-foreground text-right">
                  Ramal
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extensions.map((ext, i) => (
                <TableRow
                  key={i}
                  className="border-border/30 hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    {ext.department}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ext.contact}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1.5 text-primary font-semibold font-display">
                      <Phone className="w-3.5 h-3.5" />
                      {ext.extension}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default ExtensionsTable;
