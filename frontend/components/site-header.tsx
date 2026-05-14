import Link from "next/link";

const navItems = [
  { label: "Events", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Partners", href: "/#privacy" }
];

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 2C16 2 6 8 6 17C6 22.5228 10.4772 27 16 27C21.5228 27 26 22.5228 26 17C26 8 16 2 16 2Z"
        fill="#F5C430"
      />
      <path
        d="M16 10C16 10 11 13.5 11 18C11 20.7614 13.2386 23 16 23C18.7614 23 21 20.7614 21 18C21 13.5 16 10 16 10Z"
        fill="#111111"
        opacity="0.25"
      />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#EFEFEF]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <div>
            <p className="font-[family-name:var(--font-zen-dots)] text-[14px] text-ink leading-none">EFindr</p>
            <p className="text-[10px] font-medium text-ink/40 leading-none mt-0.5 tracking-wide">Event Search</p>
          </div>
        </Link>

        <nav className="hidden items-center md:flex">
          {navItems.map((item, i) => (
            <span key={item.href} className="flex items-center">
              {i > 0 && <span className="mx-3 text-ink/30 text-sm select-none">·</span>}
              <Link href={item.href} className="text-sm font-medium text-ink/65 hover:text-ink transition-colors">
                {item.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:inline text-sm font-semibold text-ink/70 hover:text-ink transition-colors">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-ink hover:bg-gold/90 transition-colors"
          >
            Book Event — It's Free
          </Link>
        </div>
      </div>
    </header>
  );
}
