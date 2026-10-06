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
      <DialogContent className="overflow-hidden p-0 sm:max-w-[440px]">
        <div className="relative p-7 sm:p-8">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-accent-soft">
                <Sparkles className="size-4 text-accent" />
              </div>
              <span className="label-caps text-muted-foreground">
                {mode === "login" ? "Welcome back" : "Create account"}
              </span>
            </div>
            <DialogTitle className="text-[26px]">
              {mode === "login" ? "Sign in to sync everywhere" : "Start tracking — free forever"}
            </DialogTitle>
            <DialogDescription>
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
              <div key={label} className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5">
                <Icon className="size-3 text-accent" />
                <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {mode === "login" ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="mt-7 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@domain.com"
                  autoComplete="email"
                  className="h-11"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="h-11 w-full" disabled={loginForm.formState.isSubmitting}>
                {loginForm.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Sign in
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                No account?{" "}
                <button type="button" onClick={() => setMode("register")} className="font-medium text-accent hover:underline">
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="mt-7 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Name</Label>
                <Input
                  id="reg-name"
                  placeholder="Alex"
                  autoComplete="name"
                  className="h-11"
                  {...registerForm.register("name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@domain.com"
                  autoComplete="email"
                  className="h-11"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="h-11"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="h-11 w-full" disabled={registerForm.formState.isSubmitting}>
                {registerForm.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Create account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")} className="font-medium text-accent hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground/70">
            By continuing, you agree to our Terms and acknowledge our Privacy Policy.
            Your financial data is encrypted and never sold.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
