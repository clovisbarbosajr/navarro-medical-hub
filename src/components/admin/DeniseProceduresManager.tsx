import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Download, X } from "lucide-react";
import { toast } from "sonner";

interface Procedure {
  id: string;
  month_label: string;
  procedure_date: string | null;
  patient_name: string | null;
  chart_number: string | null;
  procedure_name: string | null;
  proc_price: number;
  cost: number;
  denise_paid: boolean;
  percentage: number;
  square_confirmed: string;
  is_summary_row: boolean;
  summary_label: string | null;
  summary_value: number | null;
  sort_order: number;
}

// Always show current month + 1 ahead
const getMonths = () => {
  const now = new Date();
  const months: string[] = [];
  // Start from Dec 2025
  const start = new Date(2025, 11, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 1); // +2 = one month ahead

  const labels: Record<number, string> = {
    0: "JAN", 1: "FEV", 2: "MARCO", 3: "ABR", 4: "MAIO", 5: "JUN",
    6: "JUL", 7: "AGO", 8: "SET", 9: "OUT", 10: "NOV", 11: "DEZ",
  };

  const cur = new Date(start);
  while (cur <= end) {
    const label = `${labels[cur.getMonth()]}${cur.getFullYear()}`;
    months.push(label);
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
};

const MONTHS = getMonths();

const DeniseProceduresManager = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(() => {
    const now = new Date();
    const labels: Record<number, string> = {
      0: "JAN", 1: "FEV", 2: "MARCO", 3: "ABR", 4: "MAIO", 5: "JUN",
      6: "JUL", 7: "AGO", 8: "SET", 9: "OUT", 10: "NOV", 11: "DEZ",
    };
    return `${labels[now.getMonth()]}${now.getFullYear()}`;
  });
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);

  const fetchProcedures = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("denise_procedures")
      .select("*")
      .eq("month_label", activeMonth)
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar procedimentos");
      console.error(error);
    } else {
      setProcedures(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProcedures();
  }, [activeMonth]);

  const computeValues = (p: Procedure) => {
    const valorCusto = (p.proc_price || 0) - (p.cost || 0);
    const saldo = valorCusto * (p.percentage || 0);
    const valorFinal = p.denise_paid ? saldo + (p.cost || 0) : saldo;
    return { valorCusto, saldo, valorFinal };
  };

  const totals = useMemo(() => {
    const dataRows = procedures.filter(p => !p.is_summary_row && p.patient_name);
    const totalProc = dataRows.reduce((s, p) => s + (p.proc_price || 0), 0);
    const totalCost = dataRows.reduce((s, p) => s + (p.cost || 0), 0);
    const totalFinal = dataRows.reduce((s, p) => s + computeValues(p).valorFinal, 0);
    return { totalProc, totalCost, totalFinal, count: dataRows.length };
  }, [procedures]);

  const updateField = async (id: string, field: string, value: any) => {
    const { error } = await (supabase as any)
      .from("denise_procedures")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao salvar");
      return;
    }

    setProcedures(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
    setEditingCell(null);
  };

  const addRow = async () => {
    const maxOrder = procedures.length > 0
      ? Math.max(...procedures.map(p => p.sort_order))
      : 0;

    const { data, error } = await (supabase as any)
      .from("denise_procedures")
      .insert({
        month_label: activeMonth,
        sort_order: maxOrder + 1,
        proc_price: 0,
        cost: 0,
        denise_paid: false,
        percentage: 0.6,
        square_confirmed: "escolher",
        is_summary_row: false,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao adicionar linha");
      return;
    }
    setProcedures(prev => [...prev, data]);
  };

  const addSummaryRow = async () => {
    const maxOrder = procedures.length > 0
      ? Math.max(...procedures.map(p => p.sort_order))
      : 0;

    const { data, error } = await (supabase as any)
      .from("denise_procedures")
      .insert({
        month_label: activeMonth,
        sort_order: maxOrder + 1,
        is_summary_row: true,
        summary_label: "Total pago no cheque do dia",
        summary_value: 0,
        proc_price: 0,
        cost: 0,
        denise_paid: false,
        percentage: 0,
        square_confirmed: "escolher",
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao adicionar linha de total");
      return;
    }
    setProcedures(prev => [...prev, data]);
  };

  const deleteRow = async (id: string) => {
    const { error } = await (supabase as any)
      .from("denise_procedures")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao remover");
      return;
    }
    setProcedures(prev => prev.filter(p => p.id !== id));
  };

  const exportCSV = () => {
    const headers = ["Data", "Paciente", "Chart", "Procedimento", "$ Proc", "Custo $", "Denise Paid", "Valor-Custo", "Percentual", "Saldo a Pagar", "Valor Final", "Square Conf"];
    const rows = procedures
      .filter(p => !p.is_summary_row)
      .map(p => {
        const v = computeValues(p);
        return [
          p.procedure_date || "",
          p.patient_name || "",
          p.chart_number || "",
          p.procedure_name || "",
          p.proc_price,
          p.cost,
          p.denise_paid ? "sim" : "nao",
          v.valorCusto.toFixed(2),
          p.percentage,
          v.saldo.toFixed(2),
          v.valorFinal.toFixed(2),
          p.square_confirmed,
        ].join(",");
      });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `procedimentos_${activeMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  const EditableCell = ({
    id, field, value, type = "text", className = "",
  }: {
    id: string; field: string; value: any; type?: string; className?: string;
  }) => {
    const isEditing = editingCell?.id === id && editingCell?.field === field;
    const [localValue, setLocalValue] = useState(value ?? "");

    useEffect(() => { setLocalValue(value ?? ""); }, [value]);

    if (isEditing) {
      return (
        <input
          autoFocus
          type={type}
          value={localValue}
          onChange={e => setLocalValue(e.target.value)}
          onBlur={() => {
            const parsed = type === "number" ? parseFloat(localValue) || 0 : localValue;
            updateField(id, field, parsed);
          }}
          onKeyDown={e => {
            if (e.key === "Enter") {
              const parsed = type === "number" ? parseFloat(localValue) || 0 : localValue;
              updateField(id, field, parsed);
            }
            if (e.key === "Escape") setEditingCell(null);
          }}
          className={`w-full bg-background border border-primary/40 rounded px-1 py-0.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary ${className}`}
        />
      );
    }

    return (
      <span
        onClick={() => setEditingCell({ id, field })}
        className={`cursor-pointer hover:bg-muted/50 px-1 py-0.5 block truncate min-h-[22px] ${className}`}
      >
        {value ?? ""}
      </span>
    );
  };

  const DenisePaidDropdown = ({ id, value }: { id: string; value: boolean }) => (
    <select
      value={value ? "sim" : "nao"}
      onChange={e => updateField(id, "denise_paid", e.target.value === "sim")}
      className={`text-[11px] font-bold rounded px-2 py-1 border-0 cursor-pointer appearance-none text-center w-full ${
        value
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
      style={{ WebkitAppearance: "none" }}
    >
      <option value="sim">sim</option>
      <option value="nao">nao</option>
    </select>
  );

  const PercentualDropdown = ({ id, value }: { id: string; value: number }) => (
    <select
      value={value}
      onChange={e => updateField(id, "percentage", parseFloat(e.target.value))}
      className="bg-transparent border border-border/40 rounded px-1 py-0.5 text-xs text-foreground cursor-pointer w-full text-center"
    >
      <option value={0.6}>0,6</option>
      <option value={0.7}>0,7</option>
    </select>
  );

  const SquareDropdown = ({ id, value }: { id: string; value: string }) => (
    <select
      value={value}
      onChange={e => updateField(id, "square_confirmed", e.target.value)}
      className={`text-[11px] font-bold rounded px-2 py-1 border-0 cursor-pointer appearance-none text-center w-full ${
        value === "sim" ? "bg-green-600 text-white" :
        value === "nao" ? "bg-red-600 text-white" :
        value === "nao localizado" ? "bg-red-800 text-white" :
        "bg-muted text-muted-foreground"
      }`}
      style={{ WebkitAppearance: "none" }}
    >
      <option value="escolher">escolher</option>
      <option value="sim">sim</option>
      <option value="nao">nao</option>
      <option value="nao localizado">nao localizado</option>
    </select>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Top toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            📋 Procedimentos — Denise
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Planilha financeira confidencial
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={addSummaryRow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            + Total
          </button>
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Linha
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: "Procedimentos", value: totals.count },
          { label: "Total $ Proc", value: `$${totals.totalProc.toFixed(2)}` },
          { label: "Total Custos", value: `$${totals.totalCost.toFixed(2)}` },
          { label: "Total a Pagar", value: `$${totals.totalFinal.toFixed(2)}`, highlight: true },
        ].map(c => (
          <div key={c.label} className="glass-strong rounded-lg p-2.5 border border-border/20">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{c.label}</p>
            <p className={`font-display font-bold text-sm ${c.highlight ? "text-primary" : "text-foreground"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-auto glass-strong rounded-t-xl border border-border/20">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[hsl(var(--primary)/0.15)] border-b border-border/30">
                {["DATA", "PACIENTE", "CHART", "PROCEDIMENTO", "$ PROC", "CUSTO $", "Denise paid", "valor - custo", "PERCENTUAL", "SALDO A PAGAR", "valor final a pg", "SQUARE CONF", ""].map((h, i) => (
                  <th key={i} className={`px-2 py-2 font-bold text-foreground text-[11px] whitespace-nowrap border-r border-border/10 last:border-r-0 ${
                    i >= 4 && i <= 10 ? "text-right" : i === 6 || i === 8 || i === 11 ? "text-center" : "text-left"
                  }`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {procedures.map(p => {
                if (p.is_summary_row) {
                  return (
                    <tr key={p.id} className="bg-yellow-500/20 border-b border-border/10">
                      <td colSpan={9} className="px-2 py-1.5">
                        <EditableCell id={p.id} field="summary_label" value={p.summary_label} className="font-semibold text-foreground" />
                      </td>
                      <td />
                      <td className="px-2 py-1.5 text-right">
                        <span className="font-bold text-green-500 text-sm">
                          {(p.summary_value || 0).toFixed(2)}
                        </span>
                      </td>
                      <td />
                      <td className="px-1">
                        <button onClick={() => deleteRow(p.id)} className="text-destructive/40 hover:text-destructive p-0.5 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                const v = computeValues(p);
                return (
                  <tr key={p.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                    <td className="px-2 py-1 border-r border-border/5 w-24">
                      <EditableCell id={p.id} field="procedure_date" value={p.procedure_date} type="date" />
                    </td>
                    <td className="px-2 py-1 border-r border-border/5">
                      <EditableCell id={p.id} field="patient_name" value={p.patient_name} />
                    </td>
                    <td className="px-2 py-1 border-r border-border/5 w-16">
                      <EditableCell id={p.id} field="chart_number" value={p.chart_number} />
                    </td>
                    <td className="px-2 py-1 border-r border-border/5">
                      <EditableCell id={p.id} field="procedure_name" value={p.procedure_name} />
                    </td>
                    <td className="px-2 py-1 border-r border-border/5 text-right w-16">
                      <EditableCell id={p.id} field="proc_price" value={p.proc_price} type="number" className="text-right" />
                    </td>
                    <td className="px-2 py-1 border-r border-border/5 text-right w-16">
                      <EditableCell id={p.id} field="cost" value={p.cost} type="number" className="text-right" />
                    </td>
                    <td className="px-1 py-1 border-r border-border/5 w-20">
                      <DenisePaidDropdown id={p.id} value={p.denise_paid} />
                    </td>
                    <td className="px-2 py-1 border-r border-border/5 text-right font-mono text-muted-foreground w-20">
                      {v.valorCusto.toFixed(0)}
                    </td>
                    <td className="px-1 py-1 border-r border-border/5 w-20">
                      <PercentualDropdown id={p.id} value={p.percentage} />
                    </td>
                    <td className="px-2 py-1 border-r border-border/5 text-right font-mono text-muted-foreground w-24">
                      {v.saldo.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 border-r border-border/5 text-right font-mono font-semibold text-foreground w-24">
                      {v.valorFinal.toFixed(2)}
                    </td>
                    <td className="px-1 py-1 border-r border-border/5 w-24">
                      <SquareDropdown id={p.id} value={p.square_confirmed} />
                    </td>
                    <td className="px-1 w-6">
                      <button onClick={() => deleteRow(p.id)} className="text-destructive/30 hover:text-destructive p-0.5 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {procedures.filter(p => !p.is_summary_row).length === 0 && (
                <tr>
                  <td colSpan={13} className="text-center py-10 text-muted-foreground">
                    Nenhum procedimento neste mês.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Month tabs at bottom — Excel style */}
      <div className="flex items-center gap-0 bg-secondary/40 border border-border/20 rounded-b-xl overflow-x-auto">
        {MONTHS.map(m => (
          <button
            key={m}
            onClick={() => setActiveMonth(m)}
            className={`px-4 py-2 text-xs font-medium whitespace-nowrap border-r border-border/20 transition-all ${
              activeMonth === m
                ? "bg-primary text-primary-foreground font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            {m.replace("2025", " 2025").replace("2026", " 2026")}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DeniseProceduresManager;
