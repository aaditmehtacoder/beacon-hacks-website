"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** Print the record, or delete it after a second click. */
export function WaiverActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [arming, setArming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    const res = await fetch(`/api/admin/waivers?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setDeleting(false);
      setArming(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button type="button" variant="ink" size="sm" onClick={() => window.print()}>
        Print or save PDF
      </Button>
      {arming ? (
        <>
          <Button type="button" variant="outline" size="sm" onClick={remove} loading={deleting} className="border-danger text-danger hover:border-danger">
            Delete {name}&rsquo;s waiver
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setArming(false)}>
            Keep
          </Button>
        </>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setArming(true)}>
          Delete
        </Button>
      )}
    </div>
  );
}
