'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingChatButton() {
  const pathname = usePathname();

  // Hide on chat page itself
  if (pathname === '/chat') return null;

  return (
    <div className="fixed right-4 bottom-24 z-50">
      <Link href="/chat" aria-label="Chat with NutriVegan AI">
        <button
          className="group relative flex items-center justify-center w-[55px] h-[55px] rounded-full border-[3px] border-black bg-[#FF004D] pt-[3px] shadow-[4px_4px_0_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.8)] active:translate-y-0.5 active:shadow-[2px_2px_0_rgba(0,0,0,0.8)]"
          type="button"
        >
          <svg height="1.6em" fill="white" xmlSpace="preserve" viewBox="0 0 1000 1000" y="0px" x="0px" version="1.1">
            <path d="M881.1,720.5H434.7L173.3,941V720.5h-54.4C58.8,720.5,10,671.1,10,610.2v-441C10,108.4,58.8,59,118.9,59h762.2C941.2,59,990,108.4,990,169.3v441C990,671.1,941.2,720.5,881.1,720.5L881.1,720.5z M935.6,169.3c0-30.4-24.4-55.2-54.5-55.2H118.9c-30.1,0-54.5,24.7-54.5,55.2v441c0,30.4,24.4,55.1,54.5,55.1h54.4h54.4v110.3l163.3-110.2H500h381.1c30.1,0,54.5-24.7,54.5-55.1V169.3L935.6,169.3z M717.8,444.8c-30.1,0-54.4-24.7-54.4-55.1c0-30.4,24.3-55.2,54.4-55.2c30.1,0,54.5,24.7,54.5,55.2C772.2,420.2,747.8,444.8,717.8,444.8L717.8,444.8z M500,444.8c-30.1,0-54.4-24.7-54.4-55.1c0-30.4,24.3-55.2,54.4-55.2c30.1,0,54.4,24.7,54.4,55.2C554.4,420.2,530.1,444.8,500,444.8L500,444.8z M282.2,444.8c-30.1,0-54.5-24.7-54.5-55.1c0-30.4,24.4-55.2,54.5-55.2c30.1,0,54.4,24.7,54.4,55.2C336.7,420.2,312.3,444.8,282.2,444.8L282.2,444.8z" />
          </svg>
          <span className="absolute -top-10 flex items-center justify-center px-2.5 py-1.5 opacity-0 bg-[#FF004D] text-white text-xs font-bold font-mono tracking-wide uppercase border-2 border-black transition duration-300 pointer-events-none group-hover:opacity-100 whitespace-nowrap">
            AI CHAT
          </span>
        </button>
      </Link>
    </div>
  );
}
