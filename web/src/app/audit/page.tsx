'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuditTrailPage() {
  const router = useRouter();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <ScrollText className="h-5 w-5 text-primary" />
              Audit Trail Viewer
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The full audit trail viewer will be available in a future release.
            This page will display a searchable, filterable log of all system
            activity including data changes, approvals, and user actions.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
