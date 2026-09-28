import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import aurakLogo from "@/assets/aurak-logo.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "";
      const jsonStart = rawMessage.indexOf("{");
      let serverMessage: string | undefined;
      if (jsonStart >= 0) {
        try {
          serverMessage = JSON.parse(rawMessage.slice(jsonStart)).message;
        } catch {
          // Keep the generic message for unexpected or malformed responses.
        }
      }
      setError(serverMessage || "We could not process your request right now. Please try again later.");
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
          <CardTitle className="text-2xl">Forgot your password?</CardTitle>
          <CardDescription>Enter the email address on your account and we’ll send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p role="status" className="text-sm text-muted-foreground">If an account exists for that email, a reset link has been sent.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Sending…" : "Send reset link"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
