import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

export type ApiKeyData = {
  id: string;
  name: string;
  service: string;
  environment: string;
  key: string;
  createdAt: string;
  tags: string;
  notes: string;
  expiresAt?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<ApiKeyData, "id" | "createdAt">) => void;
  editData?: ApiKeyData | null;
};

const AddKeyDialog = ({ open, onClose, onSave, editData }: Props) => {
  const [name, setName] = useState(editData?.name ?? "");
  const [service, setService] = useState(editData?.service ?? "Other");
  const [environment, setEnvironment] = useState(editData?.environment ?? "Production");
  const [key, setKey] = useState(editData?.key ?? "");
  const [tags, setTags] = useState(editData?.tags ?? "");
  const [notes, setNotes] = useState(editData?.notes ?? "");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    editData?.expiresAt ? new Date(editData.expiresAt) : undefined
  );

  const handleSave = () => {
    if (!name.trim() || !key.trim()) return;
    onSave({
      name: name.trim(),
      service,
      environment,
      key: key.trim(),
      tags: tags.trim(),
      notes: notes.trim(),
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
    });
    setName(""); setService("Other"); setEnvironment("Production"); setKey(""); setTags(""); setNotes(""); setExpiresAt(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border/60 max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit API key" : "Add new API key"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. OpenAI Production" className="bg-muted/50" maxLength={100} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Service</label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["OpenAI", "Google", "AWS", "Stripe", "Other"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Environment</label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Production", "Staging", "Dev"].map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">API key *</label>
            <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-..." className="bg-muted/50 font-mono text-sm" maxLength={500} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Expires (optional)</label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-muted/50">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {expiresAt ? format(expiresAt, "PPP") : <span className="text-muted-foreground">No expiry date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiresAt}
                    onSelect={setExpiresAt}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {expiresAt && (
                <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10" onClick={() => setExpiresAt(undefined)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tags</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. backend, critical" className="bg-muted/50" maxLength={200} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." className="bg-muted/50 resize-none" rows={2} maxLength={500} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !key.trim()} className="bg-gradient-primary border-0">{editData ? "Save changes" : "Add key"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddKeyDialog;
