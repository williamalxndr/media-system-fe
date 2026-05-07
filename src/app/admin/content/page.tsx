"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { api } from "@/shared/lib/apiFetch";

interface Content {
  id: number;
  name: string;
  event: { id: number; name: string };
}

export default function ContentPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ results: Content[] }>("/api/contents/")
      .then((res) => setContents(res.results))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Content</h1>
        <Link href="/admin/content/create">
          <Button>Upload Content</Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : contents.length === 0 ? (
        <p className="text-slate-600">No content yet</p>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Event</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((content) => (
                  <tr key={content.id} className="border-b hover:bg-slate-50">
                    <td className="py-2">{content.name}</td>
                    <td className="py-2">{content.event.name}</td>
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
