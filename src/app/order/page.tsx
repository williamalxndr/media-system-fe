"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Fraunces, Inter } from "next/font/google";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field } from "@/features/admin/components/FormCard";
import { api, type ApiError } from "@/shared/lib/apiFetch";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  display: "swap",
});

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

interface OrderResponse {
  id: number;
  status: string;
  created_at: string;
}

interface PublicContent {
  id: number;
  title: string | null;
  event_name: string;
  price: number | null;
}

type Stage = "form" | "payment" | "done";
type PaymentMethod = "qris" | "bank" | "ewallet";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "qris",
    label: "QRIS",
    description: "Scan dari aplikasi mana pun",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01" />
      </svg>
    ),
  },
  {
    id: "bank",
    label: "Transfer Bank",
    description: "BCA, Mandiri, BNI",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10l9-6 9 6" />
        <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
        <path d="M3 20h18" />
      </svg>
    ),
  },
  {
    id: "ewallet",
    label: "E-wallet",
    description: "GoPay, OVO, DANA",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
        <circle cx="17" cy="14.5" r="1" />
      </svg>
    ),
  },
];

const FALLBACK_AMOUNT = 150000;
const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export default function OrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderPageInner />
    </Suspense>
  );
}

function OrderPageInner() {
  const searchParams = useSearchParams();
  const contentId = searchParams.get("content");

  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMounted, setPaymentMounted] = useState(false);
  const [content, setContent] = useState<PublicContent | null>(null);

  useEffect(() => {
    if (!contentId) return;
    api
      .get<{ results: PublicContent[] }>("/contents/public/")
      .then((res) => {
        const match = res.results.find((c) => String(c.id) === contentId);
        if (match) setContent(match);
      })
      .catch(() => {});
  }, [contentId]);

  useEffect(() => {
    if (stage === "payment") {
      const id = requestAnimationFrame(() => setPaymentMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setPaymentMounted(false);
  }, [stage]);

  const amount = content?.price ?? FALLBACK_AMOUNT;
  const itemTitle = content?.title || content?.event_name || "Akses Konten";

  const normalized = normalizePhone(phone);
  const canContinue =
    name.trim().length > 0 && normalized.length >= 8 && !paying;

  const handleContinue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canContinue) return;
    setError(null);
    setStage("payment");
  };

  const handlePay = async () => {
    if (!method || paying) return;
    setPaying(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 1200));
    if (!contentId) {
      setError("Konten tidak ditemukan. Silakan ulangi dari halaman katalog.");
      setPaying(false);
      return;
    }
    try {
      await api.post<OrderResponse>("/orders/", {
        customer_name: name.trim(),
        whatsapp_number: phone.trim(),
        content_id: Number(contentId),
      });
      setStage("done");
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 429) {
        setError(
          "Terlalu banyak pesanan dari perangkat ini. Coba lagi sebentar lagi."
        );
      } else if (apiErr.detail) {
        setError(apiErr.detail);
      } else if (apiErr.whatsapp_number) {
        setError("Nomor WhatsApp tidak valid.");
      } else {
        setError("Pembayaran gagal diproses. Coba lagi.");
      }
    } finally {
      setPaying(false);
    }
  };

  const handleBack = () => {
    if (paying) return;
    setError(null);
    setStage("form");
  };

  const showPair = stage === "payment";

  return (
    <main
      className={`${inter.className} relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f4ef] px-4 py-12`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.18) 1px, transparent 0)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),transparent_70%)]"
      />

      <div
        className={`relative mx-auto w-full transition-[max-width] duration-500 ease-out ${
          showPair ? "max-w-[56rem]" : "max-w-md"
        }`}
      >
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-zinc-400" />
            <span
              className={`${fraunces.className} text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500`}
              style={{ fontVariationSettings: '"opsz" 9' }}
            >
              Est. Order
            </span>
            <span className="h-px w-10 bg-zinc-400" />
          </div>
          <h1 className="mt-3 text-[2.25rem] font-extrabold uppercase leading-[1] tracking-tight text-zinc-950">
            HahahaCorp
          </h1>
          <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.34em] text-zinc-500">
            Order
          </p>
        </header>

        {stage === "done" ? (
          <div className="mx-auto max-w-md">
            <SuccessCard />
          </div>
        ) : (
          <div
            className={`flex flex-col items-stretch gap-6 md:flex-row md:items-start md:justify-center ${
              showPair ? "md:gap-6" : "md:gap-0"
            }`}
          >
            <div
              className={`mx-auto w-full transition-all duration-500 ease-out md:mx-0 ${
                showPair ? "md:flex-1 md:max-w-md" : "md:max-w-md"
              }`}
            >
              <FormCard
                name={name}
                phone={phone}
                normalized={normalized}
                disabled={stage === "payment"}
                canContinue={canContinue}
                error={stage === "form" ? error : null}
                onName={setName}
                onPhone={setPhone}
                onSubmit={handleContinue}
              />
            </div>

            {showPair && (
              <div
                className={`w-full transition-all duration-500 ease-out md:flex-1 md:max-w-md ${
                  paymentMounted
                    ? "translate-y-0 opacity-100 md:translate-x-0"
                    : "translate-y-2 opacity-0 md:translate-y-0 md:translate-x-4"
                }`}
              >
                <PaymentCard
                  customerName={name}
                  itemTitle={itemTitle}
                  amount={amount}
                  method={method}
                  paying={paying}
                  error={error}
                  onSelect={setMethod}
                  onPay={handlePay}
                  onBack={handleBack}
                />
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-[11px] uppercase tracking-[0.28em] text-zinc-500">
          © Hahaha Corp · All Rights Reserved
        </p>
      </div>
    </main>
  );
}

function SuccessCard() {
  return (
    <div className="relative rounded-2xl border border-zinc-200/80 bg-white p-8 text-center shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_60px_-30px_rgba(0,0,0,0.18)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-zinc-900"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7l8 6 8-6" />
          <rect x="4" y="6" width="16" height="13" rx="1.5" />
        </svg>
      </div>
      <h2
        className={`${fraunces.className} mt-5 text-2xl tracking-tight text-zinc-950`}
        style={{ fontWeight: 500 }}
      >
        Pesanan diterima
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        Tim kami akan menghubungi anda via WhatsApp untuk mengirim link akses.
        Terima kasih sudah memercayai kami.
      </p>
    </div>
  );
}

interface FormCardProps {
  name: string;
  phone: string;
  normalized: string;
  disabled: boolean;
  canContinue: boolean;
  error: string | null;
  onName: (v: string) => void;
  onPhone: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

function FormCard({
  name,
  phone,
  normalized,
  disabled,
  canContinue,
  error,
  onName,
  onPhone,
  onSubmit,
}: FormCardProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_60px_-30px_rgba(0,0,0,0.18)]"
    >
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent"
      />
      <div className="px-7 pt-7 pb-6">
        <span className="label-mono text-[10px] tracking-[0.28em]">
          Formulir
        </span>
        <h2
          className={`${fraunces.className} mt-2 text-[1.6rem] leading-tight tracking-tight text-zinc-950`}
          style={{ fontWeight: 500 }}
        >
          Buat pesanan
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Isi formulir berikut. Link akses akan dikirim via WhatsApp.
        </p>
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="space-y-6 px-7 py-7">
        <Field label="Nama Lengkap" htmlFor="order-name">
          <Input
            id="order-name"
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="Ernest Prakasa"
            required
            disabled={disabled}
            className="h-11 rounded-lg border-zinc-200 bg-zinc-50/60 text-[15px] shadow-none focus-visible:border-zinc-900 focus-visible:bg-white focus-visible:ring-0"
          />
        </Field>

        <Field
          label="Nomor WhatsApp"
          htmlFor="order-phone"
          hint={
            normalized
              ? `Akan dihubungi: +${normalized}`
              : "Contoh: 081234567890"
          }
        >
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[13px] font-medium text-zinc-400">
              +62
            </span>
            <Input
              id="order-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => onPhone(e.target.value)}
              placeholder="81234567890"
              required
              disabled={disabled}
              className="h-11 rounded-lg border-zinc-200 bg-zinc-50/60 pl-12 text-[15px] tracking-wide tabular-nums shadow-none focus-visible:border-zinc-900 focus-visible:bg-white focus-visible:ring-0"
            />
          </div>
        </Field>

        {error && <ErrorBlock>{error}</ErrorBlock>}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/60 px-7 py-4">
        <span className="text-xs text-zinc-500">Aman & terenkripsi</span>
        <Button
          type="submit"
          disabled={!canContinue || disabled}
          className="group h-10 rounded-full bg-zinc-950 px-5 text-[13px] font-medium tracking-wide text-white shadow-sm transition-all hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500"
        >
          <span>Lanjut ke Pembayaran</span>
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Button>
      </div>
    </form>
  );
}

interface PaymentCardProps {
  customerName: string;
  itemTitle: string;
  amount: number;
  method: PaymentMethod | null;
  paying: boolean;
  error: string | null;
  onSelect: (m: PaymentMethod) => void;
  onPay: () => void;
  onBack: () => void;
}

function PaymentCard({
  customerName,
  itemTitle,
  amount,
  method,
  paying,
  error,
  onSelect,
  onPay,
  onBack,
}: PaymentCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_60px_-30px_rgba(0,0,0,0.18)]">
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent"
      />
      <div className="px-7 pt-7 pb-6">
        <span className="label-mono text-[10px] tracking-[0.28em]">
          Pembayaran
        </span>
        <h2
          className={`${fraunces.className} mt-2 text-[1.6rem] leading-tight tracking-tight text-zinc-950`}
          style={{ fontWeight: 500 }}
        >
          Selesaikan pembayaran
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Pilih metode pembayaran. Link akses dikirim setelah pembayaran
          dikonfirmasi.
        </p>
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="space-y-5 px-7 py-7">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50/60 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              {itemTitle}
            </div>
            <div className="mt-0.5 truncate text-sm text-zinc-800">
              Pesanan untuk {customerName || "—"}
            </div>
          </div>
          <div
            className={`${fraunces.className} shrink-0 text-base tracking-tight text-zinc-950 tabular-nums`}
            style={{ fontWeight: 500 }}
          >
            {formatRupiah(amount)}
          </div>
        </div>

        <div className="space-y-2">
          {PAYMENT_METHODS.map((m) => (
            <MethodOption
              key={m.id}
              option={m}
              selected={method === m.id}
              disabled={paying}
              onSelect={() => onSelect(m.id)}
            />
          ))}
        </div>

        {error && <ErrorBlock>{error}</ErrorBlock>}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/60 px-7 py-4">
        <button
          type="button"
          onClick={onBack}
          disabled={paying}
          className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-50"
        >
          ← Kembali
        </button>
        <Button
          type="button"
          onClick={onPay}
          disabled={!method || paying}
          className="group h-10 rounded-full bg-zinc-950 px-5 text-[13px] font-medium tracking-wide text-white shadow-sm transition-all hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500"
        >
          <span>
            {paying ? "Memproses…" : `Bayar ${formatRupiah(amount)}`}
          </span>
          {!paying && (
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}

interface MethodOptionProps {
  option: (typeof PAYMENT_METHODS)[number];
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function MethodOption({ option, selected, disabled, onSelect }: MethodOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all disabled:opacity-50 ${
        selected
          ? "border-zinc-900 bg-zinc-50"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/60"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
          selected ? "border-zinc-900 text-zinc-900" : "border-zinc-200 text-zinc-600"
        }`}
      >
        <span className="block h-4 w-4">{option.icon}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-zinc-900">
          {option.label}
        </span>
        <span className="block text-xs text-zinc-500">{option.description}</span>
      </span>
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-zinc-900" : "border-zinc-300"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-zinc-900" />}
      </span>
    </button>
  );
}

function ErrorBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50/70 px-3 py-2.5 text-sm text-rose-800">
      <svg
        viewBox="0 0 24 24"
        className="mt-0.5 h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <span>{children}</span>
    </div>
  );
}
