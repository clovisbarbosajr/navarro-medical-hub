import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, Download, ChevronDown } from "lucide-react";
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

const MONTHS = ["DEZ2025", "JAN2026", "FEV2026", "MARCO2026"];

const DeniseProceduresManager = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState("FEV2026");
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [saving, setSaving] = useState(false);

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
    toast.success("Linha adicionada");
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
          p.denise_paid ? "Sim" : "Nao",
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
          className={`w-full bg-background border border-primary/40 rounded px-1.5 py-0.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary ${className}`}
        />
      );
    }

    return (
      <span
        onClick={() => setEditingCell({ id, field })}
        className={`cursor-pointer hover:bg-primary/5 rounded px-1 py-0.5 block truncate ${className}`}
      >
        {value ?? "—"}
      </span>
    );
  };

  const formatCurrency = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            📋 Procedimentos — Denise
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Planilha financeira confidencial. Apenas Inwise tem acesso.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Linha
          </button>
        </div>
      </div>

      {/* Month tabs */}
      <div className="flex gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
        {MONTHS.map(m => (
          <button
            key={m}
            onClick={() => setActiveMonth(m)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeMonth === m
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="glass-strong rounded-xl p-3 border border-border/20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Procedimentos</p>
          <p className="font-display font-bold text-lg text-foreground">{totals.count}</p>
        </div>
        <div className="glass-strong rounded-xl p-3 border border-border/20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total $ Proc</p>
          <p className="font-display font-bold text-lg text-foreground">{formatCurrency(totals.totalProc)}</p>
        </div>
        <div className="glass-strong rounded-xl p-3 border border-border/20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Custos</p>
          <p className="font-display font-bold text-lg text-foreground">{formatCurrency(totals.totalCost)}</p>
        </div>
        <div className="glass-strong rounded-xl p-3 border border-border/20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total a Pagar</p>
          <p className="font-display font-bold text-lg text-primary">{formatCurrency(totals.totalFinal)}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass-strong rounded-xl border border-border/20 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/20 bg-secondary/20">
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-24">Data</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Paciente</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-16">Chart</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Procedimento</th>
                <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground w-20">$ Proc</th>
                <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground w-20">Custo $</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground w-16">Pago</th>
                <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground w-20">Val-Custo</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground w-14">%</th>
                <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground w-20">Saldo</th>
                <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground w-20">Final</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground w-16">Square</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {procedures.map(p => {
                if (p.is_summary_row) {
                  return (
                    <tr key={p.id} className="bg-primary/5 border-b border-border/10">
                      <td colSpan={10} className="px-3 py-2 font-semibold text-foreground">
                        {p.summary_label || "Total"}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-primary">
                        {formatCurrency(p.summary_value || 0)}
                      </td>
                      <td />
                      <td>
                        <button onClick={() => deleteRow(p.id)} className="text-destructive/50 hover:text-destructive p-1">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                const v = computeValues(p);
                return (
                  <tr key={p.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                    <td className="px-3 py-1.5">
                      <EditableCell id={p.id} field="procedure_date" value={p.procedure_date} type="date" />
                    </td>
                    <td className="px-3 py-1.5">
                      <EditableCell id={p.id} field="patient_name" value={p.patient_name} />
                    </td>
                    <td className="px-3 py-1.5">
                      <EditableCell id={p.id} field="chart_number" value={p.chart_number} />
                    </td>
                    <td className="px-3 py-1.5">
                      <EditableCell id={p.id} field="procedure_name" value={p.procedure_name} />
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <EditableCell id={p.id} field="proc_price" value={p.proc_price} type="number" className="text-right" />
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <EditableCell id={p.id} field="cost" value={p.cost} type="number" className="text-right" />
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <button
                        onClick={() => updateField(p.id, "denise_paid", !p.denise_paid)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          p.denise_paid
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {p.denise_paid ? "Sim" : "Não"}
                      </button>
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                      {v.valorCusto.toFixed(2)}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <select
                        value={p.percentage}
                        onChange={e => updateField(p.id, "percentage", parseFloat(e.target.value))}
                        className="bg-transparent border border-border/30 rounded px-1 py-0.5 text-xs text-foreground cursor-pointer"
                      >
                        <option value={0.6}>0.6</option>
                        <option value={0.7}>0.7</option>
                      </select>
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                      {v.saldo.toFixed(2)}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono font-semibold text-primary">
                      {v.valorFinal.toFixed(2)}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <select
                        value={p.square_confirmed}
                        onChange={e => updateField(p.id, "square_confirmed", e.target.value)}
                        className={`bg-transparent border border-border/30 rounded px-1 py-0.5 text-[10px] cursor-pointer ${
                          p.square_confirmed === "sim" ? "text-green-400" :
                          p.square_confirmed === "nao" ? "text-red-400" : "text-muted-foreground"
                        }`}
                      >
                        <option value="escolher">—</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                      </select>
                    </td>
                    <td className="px-1">
                      <button onClick={() => deleteRow(p.id)} className="text-destructive/30 hover:text-destructive p-1 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {procedures.filter(p => !p.is_summary_row).length === 0 && (
                <tr>
                  <td colSpan={13} className="text-center py-10 text-muted-foreground">
                    Nenhum procedimento neste mês. Clique em "Nova Linha" para adicionar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeniseProceduresManager;
