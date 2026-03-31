import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  MapPin, ChevronDown, ChevronRight, Plus, Pencil, Trash2, Settings2,
  Eye, EyeOff, Upload, Download, Printer, Monitor, Phone, Wifi,
  Globe, Server, Cloud, Camera, Hash, Cable, Network, FileUp, X
} from "lucide-react";

interface Location { id: string; name: string; sort_order: number; }
interface Category { id: string; location_id: string; name: string; icon: string; sort_order: number; }
interface Field { id: string; category_id: string; field_name: string; field_type: string; is_required: boolean; sort_order: number; }
interface Item { id: string; category_id: string; field_values: Record<string, string>; sort_order: number; created_at: string; }

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  printer: Printer, monitor: Monitor, phone: Phone, wifi: Wifi, globe: Globe,
  server: Server, cloud: Cloud, camera: Camera, hash: Hash, cable: Cable, network: Network,
};

const ICON_OPTIONS = [
  { value: "printer", label: "Impressora" }, { value: "monitor", label: "Monitor" },
  { value: "phone", label: "Telefone" }, { value: "wifi", label: "Wi-Fi" },
  { value: "globe", label: "Globe" }, { value: "server", label: "Servidor" },
  { value: "cloud", label: "Cloud" }, { value: "camera", label: "Câmera" },
  { value: "hash", label: "Hash" }, { value: "cable", label: "Cabo/Switch" },
  { value: "network", label: "Rede" },
];

const getIcon = (iconName: string, className = "w-4 h-4") => {
  const Icon = ICON_MAP[iconName] || Server;
  return <Icon className={className} />;
};

const NetworkManager = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [openLocs, setOpenLocs] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  // Item dialog
  const [itemDialog, setItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [itemForm, setItemForm] = useState<Record<string, string>>({});

  // Fields management dialog
  const [fieldsDialog, setFieldsDialog] = useState(false);
  const [fieldsCategoryId, setFieldsCategoryId] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");

  // Add category dialog
  const [catDialog, setCatDialog] = useState(false);
  const [catLocationId, setCatLocationId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("server");

  // Password visibility
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [l, c, f, i] = await Promise.all([
      (supabase as any).from('network_locations').select('*').order('sort_order'),
      (supabase as any).from('network_categories').select('*').order('sort_order'),
      (supabase as any).from('network_category_fields').select('*').order('sort_order'),
      (supabase as any).from('network_items').select('*').order('sort_order'),
    ]);
    if (l.data) setLocations(l.data);
    if (c.data) setCategories(c.data);
    if (f.data) setFields(f.data);
    if (i.data) setItems(i.data);
    if (l.data?.length && !initialized) {
      setOpenLocs(new Set([l.data[0].id]));
      setInitialized(true);
    }
    setLoading(false);
  }, [initialized]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getFields = (catId: string) => fields.filter(f => f.category_id === catId);
  const getItems = (catId: string) => items.filter(i => i.category_id === catId);
  const getCatsForLoc = (locId: string) => categories.filter(c => c.location_id === locId);

  const toggleLocation = (id: string) => {
    setOpenLocs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ITEM CRUD
  const openAddItem = (categoryId: string) => {
    setEditingItem(null);
    setItemCategoryId(categoryId);
    setItemForm({});
    setItemDialog(true);
  };

  const openEditItem = (item: Item) => {
    setEditingItem(item);
    setItemCategoryId(item.category_id);
    setItemForm({ ...item.field_values });
    setItemDialog(true);
  };

  const saveItem = async () => {
    try {
      if (editingItem) {
        await (supabase as any).from('network_items').update({ field_values: itemForm }).eq('id', editingItem.id);
        toast.success("Item atualizado");
      } else {
        await (supabase as any).from('network_items').insert({ category_id: itemCategoryId, field_values: itemForm });
        toast.success("Item adicionado");
      }
      setItemDialog(false);
      fetchAll();
    } catch { toast.error("Erro ao salvar"); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Excluir este item?")) return;
    await (supabase as any).from('network_items').delete().eq('id', id);
    toast.success("Item excluído");
    fetchAll();
  };

  // FILE UPLOAD/DOWNLOAD
  const handleFileUpload = async (categoryId: string, itemId: string, fieldName: string, file: File) => {
    const path = `${categoryId}/${itemId}/${file.name}`;
    const { error } = await supabase.storage.from('network-backups').upload(path, file, { upsert: true });
    if (error) { toast.error("Erro no upload"); return; }
    const item = items.find(i => i.id === itemId);
    if (item) {
      const updatedValues = {
        ...item.field_values,
        [fieldName]: path,
        [`${fieldName}_name`]: file.name,
        [`${fieldName}_date`]: new Date().toISOString(),
      };
      await (supabase as any).from('network_items').update({ field_values: updatedValues }).eq('id', itemId);
      toast.success("Arquivo enviado");
      fetchAll();
    }
  };

  const handleFileDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from('network-backups').download(filePath);
    if (error || !data) { toast.error("Erro ao baixar"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url; a.download = fileName || 'backup'; a.click();
    URL.revokeObjectURL(url);
  };

  // FIELD CRUD
  const addField = async () => {
    if (!newFieldName.trim()) return;
    const catFields = getFields(fieldsCategoryId);
    await (supabase as any).from('network_category_fields').insert({
      category_id: fieldsCategoryId,
      field_name: newFieldName.trim(),
      field_type: newFieldType,
      sort_order: catFields.length,
    });
    setNewFieldName("");
    setNewFieldType("text");
    toast.success("Campo adicionado");
    fetchAll();
  };

  const deleteField = async (fieldId: string) => {
    if (!confirm("Excluir este campo?")) return;
    await (supabase as any).from('network_category_fields').delete().eq('id', fieldId);
    toast.success("Campo excluído");
    fetchAll();
  };

  // CATEGORY CRUD
  const addCategory = async () => {
    if (!newCatName.trim()) return;
    const locCats = getCatsForLoc(catLocationId);
    await (supabase as any).from('network_categories').insert({
      location_id: catLocationId,
      name: newCatName.trim(),
      icon: newCatIcon,
      sort_order: locCats.length,
    });
    setCatDialog(false);
    setNewCatName("");
    toast.success("Categoria adicionada");
    fetchAll();
  };

  const deleteCategory = async (catId: string) => {
    if (!confirm("Excluir esta categoria e todos seus itens?")) return;
    await (supabase as any).from('network_categories').delete().eq('id', catId);
    toast.success("Categoria excluída");
    fetchAll();
  };

  const togglePassword = (key: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex gap-1.5">
          <span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Network className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold">Infraestrutura de Rede</h2>
      </div>

      {locations.map(loc => {
        const isOpen = openLocs.has(loc.id);
        const locCats = getCatsForLoc(loc.id);
        return (
          <Collapsible key={loc.id} open={isOpen} onOpenChange={() => toggleLocation(loc.id)}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-card to-card/80 border border-border/50 hover:border-primary/40 transition-all shadow-sm">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-bold">{loc.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({locCats.length} categorias)</span>
                </div>
                <div className="ml-auto">
                  {isOpen ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20 ml-4">
              {locCats.map(cat => {
                const catFields = getFields(cat.id);
                const catItems = getItems(cat.id);
                return (
                  <div key={cat.id} className="rounded-lg border border-border/30 bg-card/50 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border/20">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary">
                        {getIcon(cat.icon, "w-4 h-4")}
                      </div>
                      <span className="font-medium text-sm">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">({catItems.length})</span>
                      <div className="ml-auto flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Gerenciar campos"
                          onClick={() => { setFieldsCategoryId(cat.id); setNewFieldName(""); setFieldsDialog(true); }}>
                          <Settings2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Adicionar item"
                          onClick={() => openAddItem(cat.id)}>
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Excluir categoria"
                          onClick={() => deleteCategory(cat.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {catItems.length > 0 && catFields.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {catFields.map(f => (
                                <TableHead key={f.id} className="text-xs whitespace-nowrap">{f.field_name}</TableHead>
                              ))}
                              <TableHead className="w-20" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {catItems.map(item => (
                              <TableRow key={item.id}>
                                {catFields.map(f => {
                                  const val = item.field_values[f.field_name] || "";
                                  const visKey = `${item.id}-${f.field_name}`;

                                  if (f.field_type === "password") {
                                    return (
                                      <TableCell key={f.id} className="text-xs">
                                        <div className="flex items-center gap-1">
                                          <span className="font-mono">{visiblePasswords.has(visKey) ? val : "••••••"}</span>
                                          <button onClick={() => togglePassword(visKey)} className="text-muted-foreground hover:text-foreground">
                                            {visiblePasswords.has(visKey) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                          </button>
                                        </div>
                                      </TableCell>
                                    );
                                  }

                                  if (f.field_type === "file") {
                                    const fileName = item.field_values[`${f.field_name}_name`] || "";
                                    const fileDate = item.field_values[`${f.field_name}_date`] || "";
                                    return (
                                      <TableCell key={f.id} className="text-xs">
                                        {val ? (
                                          <div className="space-y-1">
                                            <button onClick={() => handleFileDownload(val, fileName)}
                                              className="text-primary hover:underline flex items-center gap-1">
                                              <Download className="w-3 h-3" /> {fileName || "Download"}
                                            </button>
                                            {fileDate && (
                                              <p className="text-[10px] text-muted-foreground">
                                                {new Date(fileDate).toLocaleDateString("pt-BR")}
                                              </p>
                                            )}
                                            <label className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                                              <Upload className="w-3 h-3" /> Atualizar
                                              <input type="file" className="hidden" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(cat.id, item.id, f.field_name, file);
                                              }} />
                                            </label>
                                          </div>
                                        ) : (
                                          <label className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-1">
                                            <FileUp className="w-3 h-3" /> Upload
                                            <input type="file" className="hidden" onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleFileUpload(cat.id, item.id, f.field_name, file);
                                            }} />
                                          </label>
                                        )}
                                      </TableCell>
                                    );
                                  }

                                  return (
                                    <TableCell key={f.id} className="text-xs">
                                      {val || <span className="text-muted-foreground">—</span>}
                                    </TableCell>
                                  );
                                })}
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditItem(item)}>
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteItem(item.id)}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground px-4 py-3 italic">Nenhum item cadastrado</p>
                    )}
                  </div>
                );
              })}
              <Button variant="outline" size="sm" className="w-full border-dashed"
                onClick={() => { setCatLocationId(loc.id); setNewCatName(""); setNewCatIcon("server"); setCatDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar Categoria
              </Button>
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {/* Item Dialog */}
      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Item" : "Adicionar Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {getFields(itemCategoryId).filter(f => f.field_type !== "file").map(f => (
              <div key={f.id} className="space-y-1">
                <Label className="text-xs">{f.field_name}</Label>
                <Input
                  type={f.field_type === "password" ? "text" : "text"}
                  value={itemForm[f.field_name] || ""}
                  onChange={(e) => setItemForm(prev => ({ ...prev, [f.field_name]: e.target.value }))}
                  placeholder={f.field_name}
                />
              </div>
            ))}
            {getFields(itemCategoryId).some(f => f.field_type === "file") && (
              <p className="text-xs text-muted-foreground italic">
                📁 Upload de arquivos disponível após salvar o item.
              </p>
            )}
            <Button onClick={saveItem} className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fields Management Dialog */}
      <Dialog open={fieldsDialog} onOpenChange={setFieldsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Campos</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {getFields(fieldsCategoryId).map(f => (
              <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/20">
                <span className="text-sm flex-1 font-medium">{f.field_name}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {f.field_type === "password" ? "🔒 Senha" : f.field_type === "file" ? "📁 Arquivo" : "📝 Texto"}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteField(f.id)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <div className="border-t border-border/30 pt-3 space-y-2">
              <Label className="text-xs font-semibold">Novo Campo</Label>
              <div className="flex gap-2">
                <Input value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} placeholder="Nome do campo" className="flex-1" />
                <Select value={newFieldType} onValueChange={setNewFieldType}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="password">Senha</SelectItem>
                    <SelectItem value="file">Arquivo</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={addField}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Nome</Label>
              <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Ex: Fax, Roteador..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ícone</Label>
              <Select value={newCatIcon} onValueChange={setNewCatIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {getIcon(opt.value)} {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addCategory} className="w-full">Criar Categoria</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NetworkManager;
