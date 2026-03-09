import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-retro-bg p-4 pb-24 flex flex-col items-center justify-center">
            <div className="bg-retro-paper border-4 border-retro-border p-8 shadow-retro max-w-md w-full text-center">
                {/* 404 Header */}
                <div className="font-mono mb-6">
                    <div className="text-8xl font-bold text-retro-primary mb-2" style={{ textShadow: '4px 4px 0 #000' }}>
                        404
                    </div>
                    <div className="text-xl uppercase tracking-wide font-bold">
                        FILE_NOT_FOUND
                    </div>
                </div>

                {/* Terminal Output */}
                <div className="bg-black text-green-400 p-4 font-mono text-sm text-left mb-6 border-2 border-gray-600">
                    <div className="text-gray-500 mb-1">C:\NUTRIVEGAN\</div>
                    <div className="text-yellow-400">&gt; DIR /S</div>
                    <div className="text-red-400 mt-2">
                        ERROR: The specified path was not found.
                    </div>
                    <div className="mt-2">
                        <span className="text-gray-500">Searched:</span> 1,337 files
                    </div>
                    <div>
                        <span className="text-gray-500">Result:</span> 0 matches
                    </div>
                    <div className="mt-2 animate-blink">_</div>
                </div>

                {/* Description */}
                <p className="font-mono text-sm text-retro-muted mb-6">
                    The page you're looking for doesn't exist or has been moved to a different directory.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="w-full bg-retro-secondary text-white border-2 border-black p-3 font-bold uppercase shadow-retro hover:translate-y-1 hover:shadow-none transition-all active:translate-y-1"
                    >
                        🏠 GO TO HOME
                    </Link>

                    <Link
                        href="/chat"
                        className="w-full bg-retro-accent text-black border-2 border-black p-3 font-bold uppercase shadow-retro-sm hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        💬 ASK AI FOR HELP
                    </Link>
                </div>

                {/* Footer */}
                <div className="mt-6 font-mono text-xs text-retro-muted">
                    Press F5 to retry • Press ESC to cancel
                </div>
            </div>
        </div>
    );
}
