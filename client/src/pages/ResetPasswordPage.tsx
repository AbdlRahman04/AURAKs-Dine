import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import aurakLogo from "@/assets/aurak-logo.png";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [token] = useState(() => new URLSearchParams(window.location.search).get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) window.history.replaceState(window.history.state, "", "/reset-password");
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await apiRequest("POST", "/api/auth/reset-password", { token, password });
      setLocation("/login?passwordReset=1");
    } catch {
      setError("This reset link is invalid or expired, or the password could not be changed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="public-shell auth-shell min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="auth-brand-mark"><img src={aurakLogo} alt="AURAK'S Dine logo" /></div>
          <div className="flex items-center justify-between">
            <Link href="/login"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to sign in</Button></Link>
            <UtensilsCrossed className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Choose a new password</CardTitle>
          <CardDescription>Use at least 6 characters. This reset link expires after 30 minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? <p role="alert" className="text-sm text-destructive">This reset link is invalid or expired. Request a new one from the sign-in page.</p> : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" autoComplete="new-password" minLength={6} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input id="confirm-password" type="password" autoComplete="new-password" minLength={6} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              </div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Updating…" : "Reset password"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
