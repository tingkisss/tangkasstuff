type HankoStampProps = {
  label?: string;
  sub?: string;
  size?: number;
  className?: string;
};

/**
 * The recurring signature mark of the site: a hand-stamped hanko seal,
 * cracked at the edges like real ink on washi paper. Used to mark
 * anything "verified" — a confirmed jastip order, a katalog item that's
 * actually in stock, a scan result the system is confident about.
 */
export default function HankoStamp({ label = "確", sub, size = 76, className = "" }: HankoStampProps) {
  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center hanko hanko-crack ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="font-display leading-none" style={{ fontSize: size * 0.42 }}>
        {label}
      </span>
      {sub && (
        <span className="mt-0.5 font-mono uppercase tracking-[0.2em]" style={{ fontSize: size * 0.1 }}>
          {sub}
        </span>
      )}
    </div>
  );
}
