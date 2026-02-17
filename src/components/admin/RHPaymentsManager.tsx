import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Download, Search, Filter, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Payment {
  id: string;
  employee_name: string;
  unit: string;
  month_label: string;
  week_number: number | null;
  week_ref: string | null;
  check_number: string | null;
  delivery_date: string | null;
  status: string;
  obs: string;
  sort_order: number;
}

const MONTH_OPTIONS = ["DEZ", "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV"];

const UNIT_OPTIONS = ["DEERFIELD", "Orlando", "Tampa", "Fort Myers", "Port St Lucie", "Jacksonville"];

const STATUS_OPTIONS = ["", "COMPENSADO", "PENDENDE"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPENSADO": return "bg-green-600 text-white";
    case "PENDENDE": return "bg-amber-500 text-black";
    default: return "bg-muted text-muted-foreground";
  }
};

const RHPaymentsManager = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(() => {
    const labels: Record<number, string> = {
      0: "JAN", 1: "FEV", 2: "MAR", 3: "ABR", 4: "MAI", 5: "JUN",
      6: "JUL", 7: "AGO", 8: "SET", 9: "OUT", 10: "NOV", 11: "DEZ",
    };
    return labels[new Date().getMonth()];
  });
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUnit, setFilterUnit] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<Payment | null>(null);
  const [deleteCheckboxConfirmed, setDeleteCheckboxConfirmed] = useState(false);
  const [duplicateWeekOpen, setDuplicateWeekOpen] = useState(false);
  const [dupTargetWeek, setDupTargetWeek] = useState<number>(1);
  const [dupTargetRef, setDupTargetRef] = useState("");
  const [dupSourceWeek, setDupSourceWeek] = useState<number | null>(null);
  const [monthsWithData, setMonthsWithData] = useState<Set<string>>(new Set());

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("rh_payments")
      .select("*")
      .eq("month_label", activeMonth)
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar pagamentos");
      console.error(error);
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  };

  // Fetch which months have data for highlighting
  const fetchMonthsWithData = async () => {
    const { data, error } = await (supabase as any)
      .from("rh_payments")
      .select("month_label")
      .limit(1000);

    if (!error && data) {
      const months = new Set<string>(data.map((r: any) => r.month_label));
      setMonthsWithData(months);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [activeMonth]);

  useEffect(() => {
    fetchMonthsWithData();
  }, [payments]);

  // Get distinct weeks in current month for source selection
  const availableWeeks = useMemo(() => {
    const weeks = new Map<number, string>();
    payments.forEach(p => {
      if (p.week_number && !weeks.has(p.week_number)) {
        weeks.set(p.week_number, p.week_ref || "");
      }
    });
    return Array.from(weeks.entries()).sort((a, b) => a[0] - b[0]);
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let result = payments;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.employee_name.toLowerCase().includes(term) ||
        (p.check_number || "").toLowerCase().includes(term)
      );
    }
    if (filterUnit !== "all") {
      result = result.filter(p => p.unit === filterUnit);
    }
    return result;
  }, [payments, searchTerm, filterUnit]);

  const stats = useMemo(() => {
    const total = payments.length;
    const compensado = payments.filter(p => p.status === "COMPENSADO").length;
    const pendente = payments.filter(p => p.status === "PENDENDE").length;
    const semStatus = payments.filter(p => !p.status).length;
    return { total, compensado, pendente, semStatus };
  }, [payments]);

  const updateField = async (id: string, field: string, value: any) => {
    const { error } = await (supabase as any)
      .from("rh_payments")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao salvar");
      return;
    }

    setPayments(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
    setEditingCell(null);
  };

  const addRow = async () => {
    const maxOrder = payments.length > 0
      ? Math.max(...payments.map(p => p.sort_order))
      : 0;

    const { data, error } = await (supabase as any)
      .from("rh_payments")
      .insert({
        employee_name: "",
        unit: "DEERFIELD",
        month_label: activeMonth,
        week_number: null,
        week_ref: "",
        check_number: "",
        delivery_date: "",
        status: "",
        obs: "",
        sort_order: maxOrder + 1,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao adicionar linha");
      return;
    }
    setPayments(prev => [...prev, data]);
  };

  const deleteRow = async () => {
    if (!deleteConfirm) return;
    const { error } = await (supabase as any)
      .from("rh_payments")
      .delete()
      .eq("id", deleteConfirm.id);

    if (error) {
      toast.error("Erro ao remover");
      return;
    }
    setPayments(prev => prev.filter(p => p.id !== deleteConfirm.id));
    setDeleteConfirm(null);
    toast.success("Registro removido");
  };

  // Duplicate week: copies all employee names + units from a source week into a new week
  const duplicateWeek = async () => {
    if (!dupTargetRef.trim()) {
      toast.error("Preencha a semana de referência");
      return;
    }

    // Get source rows
    let sourceRows: Payment[];
    if (dupSourceWeek !== null) {
      sourceRows = payments.filter(p => p.week_number === dupSourceWeek);
    } else {
      // Get last week's data
      const lastWeek = availableWeeks.length > 0 ? availableWeeks[availableWeeks.length - 1][0] : null;
      if (!lastWeek) {
        toast.error("Nenhuma semana encontrada para copiar");
        return;
      }
      sourceRows = payments.filter(p => p.week_number === lastWeek);
    }

    if (sourceRows.length === 0) {
      toast.error("Nenhum funcionário na semana selecionada");
      return;
    }

    const maxOrder = payments.length > 0
      ? Math.max(...payments.map(p => p.sort_order))
      : 0;

    const newRows = sourceRows.map((p, i) => ({
      employee_name: p.employee_name,
      unit: p.unit,
      month_label: activeMonth,
      week_number: dupTargetWeek,
      week_ref: dupTargetRef,
      check_number: "",
      delivery_date: "",
      status: "",
      obs: "",
      sort_order: maxOrder + i + 1,
    }));

    const { data, error } = await (supabase as any)
      .from("rh_payments")
      .insert(newRows)
      .select();

    if (error) {
      toast.error("Erro ao duplicar semana");
      console.error(error);
      return;
    }

    setPayments(prev => [...prev, ...(data || [])]);
    setDuplicateWeekOpen(false);
    setDupTargetRef("");
    toast.success(`${sourceRows.length} funcionários copiados para Semana ${dupTargetWeek}`);
  };

  const exportCSV = () => {
    const headers = ["NOME", "UNIDADE", "MÊS", "SEM", "SEMANA DE REF", "N. CHEQUE", "DATA DA ENTREGA", "STATUS", "OBS"];
    const rows = payments.map(p =>
      [
        p.employee_name,
        p.unit,
        p.month_label,
        p.week_number ?? "",
        p.week_ref || "",
        p.check_number || "",
        p.delivery_date || "",
        p.status || "",
        p.obs || "",
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rh_pagamentos_${activeMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  const EditableCell = ({
    id, field, value, type = "text", className = "", required = false,
  }: {
    id: string; field: string; value: any; type?: string; className?: string; required?: boolean;
  }) => {
    const isEditing = editingCell?.id === id && editingCell?.field === field;
    const [localValue, setLocalValue] = useState(value ?? "");

    useEffect(() => { setLocalValue(value ?? ""); }, [value]);

    const handleSave = () => {
      if (required && !localValue.toString().trim()) {
        toast.error("Este campo é obrigatório");
        return;
      }
      const parsed = type === "number" ? parseInt(localValue) || null : localValue;
      updateField(id, field, parsed);
    };

    if (isEditing) {
      return (
        <input
          autoFocus
          type={type}
          value={localValue}
          onChange={e => setLocalValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={e => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setEditingCell(null);
          }}
          className={`w-full bg-background border border-primary/40 rounded px-1 py-0.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary ${className}`}
        />
      );
    }

    const isEmpty = !value && value !== 0;

    return (
      <span
        onClick={() => setEditingCell({ id, field })}
        className={`cursor-pointer hover:bg-muted/50 px-1 py-0.5 block truncate min-h-[22px] ${
          required && isEmpty ? "border border-dashed border-amber-400/50 rounded bg-amber-500/5" : ""
        } ${className}`}
      >
        {value ?? ""}
      </span>
    );
  };

  const StatusDropdown = ({ id, value }: { id: string; value: string }) => (
    <select
      value={value || ""}
      onChange={e => updateField(id, "status", e.target.value)}
      className={`text-[11px] font-bold rounded px-2 py-1 border-0 cursor-pointer appearance-none text-center w-full ${getStatusColor(value)}`}
      style={{ WebkitAppearance: "none" }}
    >
      <option value="">—</option>
      <option value="COMPENSADO">COMPENSADO</option>
      <option value="PENDENDE">PENDENDE</option>
    </select>
  );

  const UnitDropdown = ({ id, value }: { id: string; value: string }) => (
    <select
      value={value}
      onChange={e => updateField(id, "unit", e.target.value)}
      className="bg-transparent border border-border/40 rounded px-1 py-0.5 text-xs text-foreground cursor-pointer w-full"
    >
      {UNIT_OPTIONS.map(u => (
        <option key={u} value={u}>{u}</option>
      ))}
    </select>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Top toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            💰 RH — Pagamentos
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Controle de cheques e pagamentos por semana
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
            onClick={() => {
              setDupSourceWeek(availableWeeks.length > 0 ? availableWeeks[availableWeeks.length - 1][0] : null);
              setDupTargetWeek((availableWeeks.length > 0 ? availableWeeks[availableWeeks.length - 1][0] : 0) + 1);
              setDupTargetRef("");
              setDuplicateWeekOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <Copy className="w-3.5 h-3.5" /> Duplicar Semana
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
          { label: "Total", value: stats.total },
          { label: "Compensado", value: stats.compensado, color: "text-green-500" },
          { label: "Pendente", value: stats.pendente, color: "text-amber-500" },
          { label: "Sem Status", value: stats.semStatus, color: "text-muted-foreground" },
        ].map(c => (
          <div key={c.label} className="glass-strong rounded-lg p-2.5 border border-border/20">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{c.label}</p>
            <p className={`font-display font-bold text-sm ${c.color || "text-foreground"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou cheque..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-background/50 border border-border/40 rounded-lg pl-7 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={filterUnit}
            onChange={e => setFilterUnit(e.target.value)}
            className="bg-background/50 border border-border/40 rounded-lg px-2 py-1.5 text-xs text-foreground cursor-pointer"
          >
            <option value="all">Todas Unidades</option>
            {UNIT_OPTIONS.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
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
                {["NOME", "UNIDADE", "SEM", "SEMANA DE REF", "N. CHEQUE", "DATA ENTREGA", "STATUS", "OBS", ""].map((h, i) => (
                  <th key={i} className={`px-2 py-2 font-bold text-foreground text-[11px] whitespace-nowrap border-r border-border/10 last:border-r-0 ${
                    i === 0 ? "text-left min-w-[200px]" :
                    i === 1 ? "text-left min-w-[100px]" :
                    i === 2 ? "text-center w-12" :
                    i === 3 ? "text-left min-w-[120px]" :
                    i === 4 ? "text-center w-20" :
                    i === 5 ? "text-center w-24" :
                    i === 6 ? "text-center w-28" :
                    i === 7 ? "text-left min-w-[150px]" :
                    "w-6"
                  }`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => (
                <tr key={p.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                  <td className="px-2 py-1 border-r border-border/5">
                    <EditableCell id={p.id} field="employee_name" value={p.employee_name} required />
                  </td>
                  <td className="px-1 py-1 border-r border-border/5">
                    <UnitDropdown id={p.id} value={p.unit} />
                  </td>
                  <td className="px-2 py-1 border-r border-border/5 text-center">
                    <EditableCell id={p.id} field="week_number" value={p.week_number} type="number" className="text-center" />
                  </td>
                  <td className="px-2 py-1 border-r border-border/5">
                    <EditableCell id={p.id} field="week_ref" value={p.week_ref} required />
                  </td>
                  <td className="px-2 py-1 border-r border-border/5 text-center">
                    <EditableCell id={p.id} field="check_number" value={p.check_number} className="text-center" />
                  </td>
                  <td className="px-2 py-1 border-r border-border/5 text-center">
                    <EditableCell id={p.id} field="delivery_date" value={p.delivery_date} className="text-center" />
                  </td>
                  <td className="px-1 py-1 border-r border-border/5">
                    <StatusDropdown id={p.id} value={p.status} />
                  </td>
                  <td className="px-2 py-1 border-r border-border/5">
                    <EditableCell id={p.id} field="obs" value={p.obs} />
                  </td>
                  <td className="px-1 w-6">
                    <button
                      onClick={() => setDeleteConfirm(p)}
                      className="text-destructive/30 hover:text-destructive p-0.5 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-muted-foreground">
                    {searchTerm || filterUnit !== "all" ? "Nenhum resultado encontrado." : "Nenhum pagamento neste mês."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Month tabs at bottom — Excel style with highlights */}
      <div className="flex items-center gap-0 bg-secondary/40 border border-border/20 rounded-b-xl overflow-x-auto">
        {MONTH_OPTIONS.map(m => {
          const hasData = monthsWithData.has(m);
          const isActive = activeMonth === m;
          return (
            <button
              key={m}
              onClick={() => setActiveMonth(m)}
              className={`relative px-4 py-2 text-xs font-medium whitespace-nowrap border-r border-border/10 transition-all ${
                isActive
                  ? "bg-primary/20 text-primary font-bold border-b-2 border-b-primary"
                  : hasData
                    ? "text-foreground font-semibold hover:bg-secondary/60 bg-secondary/30"
                    : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/60"
              }`}
            >
              {m}
              {hasData && !isActive && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={open => {
        if (!open) {
          setDeleteConfirm(null);
          setDeleteCheckboxConfirmed(false);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Tem certeza que deseja remover{" "}
                  <strong className="text-foreground">
                    {deleteConfirm?.employee_name || "este registro"}
                  </strong>
                  {deleteConfirm?.week_ref && (
                    <> da semana <strong className="text-foreground">{deleteConfirm.week_ref}</strong></>
                  )}
                  ? Esta ação não pode ser desfeita.
                </p>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deleteCheckboxConfirmed}
                    onChange={e => setDeleteCheckboxConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-destructive cursor-pointer"
                  />
                  <span className="text-sm text-foreground font-medium">
                    Confirmo que desejo excluir este registro
                  </span>
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteRow}
              disabled={!deleteCheckboxConfirmed}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Week Dialog */}
      <AlertDialog open={duplicateWeekOpen} onOpenChange={setDuplicateWeekOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-primary" />
              Duplicar Semana — {activeMonth}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 mt-2">
                <p className="text-sm text-muted-foreground">
                  Copiar nomes e unidades de uma semana existente para uma nova semana.
                </p>

                {/* Source week */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Semana de origem
                  </label>
                  {availableWeeks.length > 0 ? (
                    <select
                      value={dupSourceWeek ?? ""}
                      onChange={e => setDupSourceWeek(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    >
                      {availableWeeks.map(([week, ref]) => (
                        <option key={week} value={week}>
                          Semana {week} {ref ? `(${ref})` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Nenhuma semana neste mês para duplicar.</p>
                  )}
                </div>

                {/* Target week number */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Número da nova semana
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={dupTargetWeek}
                    onChange={e => setDupTargetWeek(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                </div>

                {/* Target week ref (required) */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Semana de referência <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 03/02 A 03/07"
                    value={dupTargetRef}
                    onChange={e => setDupTargetRef(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={duplicateWeek}
              disabled={!dupTargetRef.trim() || availableWeeks.length === 0}
            >
              Duplicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RHPaymentsManager;
