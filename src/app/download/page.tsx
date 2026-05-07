"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { api } from "@/shared/lib/apiFetch";

interface AccessData {
  content: {
    id: number;
    name: string;
    file_url: string;
  };
  event: {
    id: number;
    name: string;
  };
  expires_at: string;
}

export default function DownloadPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [data, setData] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No access token provided");
      setLoading(false);
      return;
    }

    api
      .get<AccessData>(`/api/access/?token=${token}`)
      .then(setData)
      .catch(() => setError("Invalid or expired token"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">Loading...</CardContent>
        </Card>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error || "Unable to access this content"}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const expiresAt = new Date(data.expires_at);
  const isExpired = expiresAt < new Date();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{data.content.name}</CardTitle>
          <CardDescription>{data.event.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-600">
            <p>
              <strong>Expires:</strong> {expiresAt.toLocaleString()}
            </p>
            {isExpired && <p className="text-destructive mt-2">This link has expired</p>}
          </div>
          <Button
            className="w-full"
            disabled={isExpired}
            onClick={() => {
              const link = document.createElement("a");
              link.href = data.content.file_url;
              link.download = data.content.name;
              link.click();
            }}
          >
            {isExpired ? "Link Expired" : "Download"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
