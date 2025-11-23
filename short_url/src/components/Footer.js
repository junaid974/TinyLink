export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 text-sm py-4 mt-8">
      <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <p>
          &copy; {new Date().getFullYear()} TinyLink | Built for Take-Home Assignment.
        </p>
        <p className="mt-1">
          <a href="/healthz" className="hover:text-indigo-400">System Health Check (/healthz)</a>
        </p>
      </div>
    </footer>
  );
}