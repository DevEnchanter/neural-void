import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black">
      <h1 className="mb-4 font-mono text-6xl font-bold tracking-widest text-[#00E0FF] text-glow-cyan">
        SIGNAL LOST
      </h1>
      <p className="mb-8 font-mono text-sm tracking-[0.3em] text-[#00E0FF80]">
        NODE NOT FOUND IN NEURAL VOID
      </p>
      <Link
        href="/"
        className="border border-[#00E0FF33] bg-[#00E0FF0A] px-8 py-3 font-mono text-xs tracking-[0.3em] text-[#00E0FF] transition-all duration-300 hover:border-[#00E0FF] hover:bg-[#00E0FF15] border-glow"
      >
        RECONNECT
      </Link>
      <div className="absolute bottom-8 font-mono text-[10px] tracking-widest text-[#00E0FF22]">
        ERR::404 // VOID_NODE_MISSING
      </div>
    </div>
  );
}
