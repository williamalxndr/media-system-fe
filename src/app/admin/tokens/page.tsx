"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { api } from "@/shared/lib/apiFetch";

interface Token {
  id: number;
  token: string;
  content: { id: number; name: string };
  expires_at: string;
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = () => {
    api
      .get<{ results: Token[] }>("/api/tokens/")
      .then((res) => setTokens(res.results))
      .finally(() => setLoading(false));
  };

  const handleRevoke = async (id: number) => {
    if (!confirm("Revoke this token?")) return;
    try {
      await api.post(`/api/tokens/${id}/revoke/`, {});
      setTokens(tokens.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to revoke token");
    }
  };

  const handleCopyUrl = (token: string) => {
    const url = `${window.location.origin}/download?token=${token}`;
    navigator.clipboard.writeText(url);
    alert("Download URL copied!");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Access Tokens</h1>
        <Link href="/admin/tokens/create">
          <Button>Create Token</Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : tokens.length === 0 ? (
        <p className="text-slate-600">No tokens yet</p>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Content</th>
                  <th className="text-left py-2">Expires</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr key={token.id} className="border-b hover:bg-slate-50">
                    <td className="py-2">{token.content.name}</td>
                    <td className="py-2">{new Date(token.expires_at).toLocaleDateString()}</td>
                    <td className="py-2 space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyUrl(token.token)}
                      >
                        Copy URL
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevoke(token.id)}
                      >
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
