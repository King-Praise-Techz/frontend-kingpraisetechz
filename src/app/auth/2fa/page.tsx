"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Copy, Crown } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function TwoFactorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams?.get("setup") === "true";

  const { verify2FA, enable2FA, isLoading, setupToken, user } = useAuthStore();

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [qrCode, setQrCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [step, setStep] = useState<"qr" | "verify">(isSetup ? "qr" : "verify");
  const [loadingQR, setLoadingQR] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (isSetup && setupToken) {
      setLoadingQR(true);
      fetch(`${API_BASE_URL}/auth/2fa/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setQrCode(res.data.qrCode);
            setManualKey(res.data.manualKey);
          } else {
            toast.error("Failed to load 2FA setup. Please login again.");
            router.push("/auth/login");
          }
        })
        .catch(() => {
          toast.error("Failed to initialize 2FA setup");
          router.push("/auth/login");
        })
        .finally(() => setLoadingQR(false));
    }
  }, [isSetup, setupToken, router]);

  const handleInput = (index: number, value: string) => {
    const newCode = [...code];
    if (value.length > 1) {
      value.slice(0, 6).split("").forEach((char, i) => {
        if (index + i < 6) newCode[index + i] = char;
      });
      setCode(newCode);
      inputRefs.current[Math.min(index + value.length, 5)]?.focus();
      return;
    }
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;

    try {
      if (isSetup && setupToken) {
        await enable2FA?.(setupToken, fullCode);
      } else {
        await verify2FA(fullCode);
      }
      const currentUser = useAuthStore.getState().user;
      if (currentUser) router.push(`/dashboard/${currentUser.role}`);
    } catch {
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(manualKey);
      toast.success("Secret key copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const OTPInputs = () => (
    <div className="flex justify-center gap-3 mb-6">
      {code.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { inputRefs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInput(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={cn(
            "w-11 h-14 text-center text-xl font-bold rounded-xl border transition-all input-dark",
            digit ? "border-brand-500/50 text-brand-300" : "border-white/10"
          )}
        />
      ))}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
      <div className="flex items-center justify-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl btn-glow flex items-center justify-center">
          <Crown size={20} className="text-white" />
        </div>
        <span className="font-display font-bold text-xl text-white">King Praise Techz</span>
      </div>

      <div className="glass-card p-8">
        {isSetup && step === "qr" ? (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mx-auto mb-3">
                <Shield size={22} className="text-brand-400" />
              </div>
              <h2 className="font-display font-bold text-xl text-white mb-2">Set up 2-Factor Authentication</h2>
              <p className="text-slate-400 text-sm">Scan the QR code below with Google Authenticator or Authy</p>
            </div>

            {loadingQR ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin" />
              </div>
            ) : qrCode ? (
              <>
                <div className="flex justify-center mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 rounded-xl border border-white/10" />
                </div>
                <div className="p-3 rounded-xl bg-white/3 border border-white/8 mb-4">
                  <p className="text-xs text-slate-500 mb-1">Manual entry key</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-brand-300 font-mono flex-1 break-all">{manualKey}</code>
                    <button onClick={copyKey} className="text-slate-400 hover:text-white transition-colors shrink-0">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setStep("verify")}
                  className="w-full py-3 rounded-xl font-semibold text-white btn-glow"
                >
                  I&apos;ve scanned it — Continue
                </button>
              </>
            ) : (
              <p className="text-center text-slate-500 text-sm">Failed to load QR code.</p>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mx-auto mb-3">
                <Shield size={22} className="text-brand-400" />
              </div>
              <h2 className="font-display font-bold text-xl text-white mb-2">
                {isSetup ? "Enter verification code" : "Two-Factor Authentication"}
              </h2>
              <p className="text-slate-400 text-sm">
                {isSetup
                  ? "Enter the 6-digit code from your authenticator app"
                  : "Enter the 6-digit code from your authenticator app to sign in"}
              </p>
            </div>

            <OTPInputs />

            <button
              onClick={handleVerify}
              disabled={isLoading || code.join("").length !== 6}
              className="w-full py-3.5 rounded-xl font-semibold text-white btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                isSetup ? "Enable 2FA & Login" : "Verify & Sign In"
              )}
            </button>

            {isSetup && (
              <button onClick={() => setStep("qr")} className="w-full mt-3 text-sm text-slate-400 hover:text-white transition-colors">
                ← Back to QR code
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function TwoFactorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(26,77,255,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)" }} />
      </div>
      <Suspense fallback={<div className="text-slate-400">Loading...</div>}>
        <TwoFactorContent />
      </Suspense>
    </div>
  );
}
