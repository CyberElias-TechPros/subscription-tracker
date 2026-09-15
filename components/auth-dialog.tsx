"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Sparkles, Shield, Zap } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80).optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthDialog({
  open,
  onOpenChange,
  initialMode = "login",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "login" | "register";
}) {
  const [mode, setMode] = React.useState<"login" | "register">(initialMode);
  const { login, register, status } = useAuth();

  React.useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onLogin = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
      toast.success("Welcome back", { description: "Your subscriptions are synced." });
      onOpenChange(false);
      loginForm.reset();
    } catch (err: any) {
      toast.error("Login failed", { description: err.message || "Check your credentials" });
    }
  };

  const onRegister = async (values: RegisterValues) => {
    try {
      await register(values.email, values.password, values.name);
      toast.success("Account created", { description: "You're all set — your data now syncs everywhere." });
      onOpenChange(false);
      registerForm.reset();
    } catch (err: any) {
      toast.error("Registration failed", { description: err.message || "Try a different email" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[440px] border-0 bg-transparent shadow-none">
        <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0e181b]/90 backdrop-blur-2xl">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-teal-400/15 blur-[60px]" />

          <div className="relative p-7 sm:p-8">
            <DialogHeader className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                  <Sparkles className="size-4 text-emerald-300" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </span>
              </div>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-white">
                {mode === "login" ? "Sign in to sync everywhere" : "Start tracking — free forever"}
              </DialogTitle>
              <DialogDescription className="text-[14px] leading-relaxed text-white/60">
                {mode === "login"
                  ? "Access your subscriptions on any device. Private, encrypted, yours."
                  : "No credit card. Your data stays yours — sync across devices, export anytime."}
              </DialogDescription>
            </DialogHeader>

            {/* Benefits */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { icon: Shield, label: "Private" },
                { icon: Zap, label: "Instant sync" },
                { icon: Sparkles, label: "Free" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                  <Icon className="size-3 text-emerald-300" />
                  <span className="text-[11px] font-medium text-white/70">{label}</span>
                </div>
              ))}
            </div>

            {mode === "login" ? (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="mt-7 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white/80">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@domain.com"
                    autoComplete="email"
                    className="h-11 border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:ring-emerald-400/50"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-red-300">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white/80">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:ring-emerald-400/50"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-red-300">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="h-11 w-full bg-white text-black hover:bg-white/90 font-medium" disabled={loginForm.formState.isSubmitting}>
                  {loginForm.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Sign in
                </Button>

                <p className="text-center text-sm text-white/50">
                  No account?{" "}
                  <button type="button" onClick={() => setMode("register")} className="font-medium text-white hover:underline">
                    Create one
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="mt-7 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="text-white/80">Name</Label>
                  <Input
                    id="reg-name"
                    placeholder="Alex"
                    autoComplete="name"
                    className="h-11 border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:ring-emerald-400/50"
                    {...registerForm.register("name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-white/80">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@domain.com"
                    autoComplete="email"
                    className="h-11 border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:ring-emerald-400/50"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-red-300">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-white/80">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="h-11 border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:ring-emerald-400/50"
                    {...registerForm.register("password")}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-red-300">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="h-11 w-full bg-white text-black hover:bg-white/90 font-medium" disabled={registerForm.formState.isSubmitting}>
                  {registerForm.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Create account
                </Button>

                <p className="text-center text-sm text-white/50">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("login")} className="font-medium text-white hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            <p className="mt-6 text-center text-[11px] leading-relaxed text-white/30">
              By continuing, you agree to our Terms and acknowledge our Privacy Policy.
              Your financial data is encrypted and never sold.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
