"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Secure Media Access</CardTitle>
          <CardDescription>Time-restricted private media sharing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share media with time-limited access tokens. Create events, upload content, and manage access with ease.
          </p>
          <div className="space-y-2">
            <Link href="/admin" className="block">
              <Button className="w-full">Admin Dashboard</Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              Log in to manage events, content, and access tokens
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
