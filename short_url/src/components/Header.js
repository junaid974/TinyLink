import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-indigo-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-white text-2xl font-bold tracking-wider">
              🔗 TinyLink
            </Link>
          </div>
          
          <nav className="hidden md:block">
            <Link href="/" className="text-indigo-200 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}