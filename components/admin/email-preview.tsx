export type MailMeta = { fromName: string; from: string; to: string; cc?: string; replyTo?: string; subject: string };

/**
 * An email as it will arrive: who it is from and to, the subject, then the
 * message itself in a sandboxed frame (it runs no script).
 */
export function EmailPreview({ meta, src, height = 900 }: { meta: MailMeta; src: string; height?: number }) {
  const rows: [string, string | undefined][] = [
    ["From", `${meta.fromName} <${meta.from}>`],
    ["To", meta.to],
    ["Cc", meta.cc],
    ["Reply-To", meta.replyTo],
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <dl className="grid gap-1 border-b border-line px-5 py-4 text-[0.875rem]">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-20 shrink-0 text-ink-3">{k}</dt>
              <dd className="min-w-0 break-all">{v}</dd>
            </div>
          ))}
        <div className="mt-1 flex gap-3">
          <dt className="w-20 shrink-0 text-ink-3">Subject</dt>
          <dd className="min-w-0 font-semibold">{meta.subject}</dd>
        </div>
      </dl>
      <iframe src={src} title={`Preview: ${meta.subject}`} sandbox="" className="block w-full bg-[#f4f6f9]" style={{ height }} />
    </div>
  );
}
