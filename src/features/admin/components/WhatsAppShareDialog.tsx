"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field } from "./FormCard";

interface WhatsAppShareDialogProps {
  tokenUrl: string;
  /** Pre-filled customer name from the linked order. */
  customerName?: string | null;
  /** Pre-filled phone number from the linked order (raw or already-normalized). */
  phoneNumber?: string | null;
  triggerLabel?: string;
  triggerClassName?: string;
  /** When true, the dialog opens automatically on mount. */
  defaultOpen?: boolean;
  /** Called when the dialog closes. Useful when defaultOpen is set. */
  onClose?: () => void;
  /** When true, render no trigger button (controlled-only mode). */
  triggerless?: boolean;
}

const UU_ITE_WARNING =
  "Mohon untuk tidak menyebarluaskan link atau konten ini. Penyebaran konten tanpa izin dapat melanggar UU ITE No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik.";

function buildMessage(name: string, url: string): string {
  return [
    `Halo, ${name}. Berikut ini adalah link untuk mengakses konten yang anda pesan:`,
    url,
    "",
    UU_ITE_WARNING,
    "",
    "Terima kasih sudah memercayai kami!",
  ].join("\n");
}

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

function openWhatsApp(phoneE164: string, message: string) {
  const url = `https://wa.me/${phoneE164}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function WhatsAppShareDialog({
  tokenUrl,
  customerName,
  phoneNumber,
  triggerLabel = "WhatsApp",
  triggerClassName,
  defaultOpen = false,
  onClose,
  triggerless = false,
}: WhatsAppShareDialogProps) {
  const presetName = (customerName ?? "").trim();
  const presetPhone = normalizePhone(phoneNumber ?? "");
  const hasPreset = presetName.length > 0 && presetPhone.length >= 8;

  const [open, setOpen] = useState(defaultOpen);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setName("");
      setPhone("");
      onClose?.();
    }
  };

  const handlePresetSend = () => {
    openWhatsApp(presetPhone, buildMessage(presetName, tokenUrl));
    handleOpenChange(false);
  };

  const manualNormalized = normalizePhone(phone);
  const canManualSend =
    name.trim().length > 0 && manualNormalized.length >= 8;
  const manualPreview = buildMessage(
    name.trim() || "{nama}",
    tokenUrl
  );

  const handleManualSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManualSend) return;
    openWhatsApp(manualNormalized, buildMessage(name.trim(), tokenUrl));
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!triggerless && (
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={`text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 ${
              triggerClassName ?? ""
            }`}
          >
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send via WhatsApp</DialogTitle>
          <DialogDescription>
            {hasPreset
              ? "Open WhatsApp with the pre-filled message for this order."
              : "Open WhatsApp with a pre-filled message containing the access link."}
          </DialogDescription>
        </DialogHeader>

        {hasPreset ? (
          <div className="space-y-4">
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm">
              <div className="text-[var(--color-ink-muted)]">Akan dikirim ke</div>
              <div className="mt-0.5 font-semibold text-[var(--color-ink)]">
                {presetName}
              </div>
              <div className="mt-0.5 font-mono text-xs text-[var(--color-ink-muted)]">
                +{presetPhone}
              </div>
            </div>

            <div>
              <div className="h-section mb-1.5">Message Preview</div>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 font-sans text-xs leading-relaxed text-zinc-700">
                {buildMessage(presetName, tokenUrl)}
              </pre>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="pill"
                className="rounded-full bg-[#25d366] text-white hover:bg-[#1ebe5d]"
                onClick={handlePresetSend}
              >
                Open WhatsApp
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleManualSend} className="space-y-4">
            <Field label="Customer Name" htmlFor="wa-name">
              <Input
                id="wa-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Budi Santoso"
                required
              />
            </Field>

            <Field
              label="WhatsApp Number"
              htmlFor="wa-phone"
              hint={
                manualNormalized
                  ? `Will dial: +${manualNormalized}`
                  : "Indonesian number (e.g. 081234567890) or international (e.g. 6281234567890)."
              }
            >
              <Input
                id="wa-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                required
              />
            </Field>

            <div>
              <div className="h-section mb-1.5">Message Preview</div>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 font-sans text-xs leading-relaxed text-zinc-700">
                {manualPreview}
              </pre>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="pill"
                className="rounded-full bg-[#25d366] text-white hover:bg-[#1ebe5d]"
                disabled={!canManualSend}
              >
                Open WhatsApp
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
