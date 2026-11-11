"use client";
// 휴대폰 화면 아래 고정 메뉴 (앱처럼)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/nav";

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-soil bg-hanji/95 backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV_ITEMS.map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${
                  active ? "font-display text-skin" : "text-soil-soft"
                }`}
              >
                {n.primary ? (
                  <span className="-mt-5 grid h-11 w-11 place-items-center rounded-full border-2 border-soil bg-skin text-xl text-white shadow-[2px_3px_0_var(--color-soil)]">
                    {n.icon}
                  </span>
                ) : (
                  <span className={`text-xl ${active ? "" : "grayscale-[60%]"}`}>{n.icon}</span>
                )}
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
