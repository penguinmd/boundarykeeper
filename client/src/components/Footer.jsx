function Footer() {
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const buildTime = import.meta.env.VITE_BUILD_TIME || 'dev';

  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2">
          <div>
            Boundary Keeper v{version}
          </div>
          <div>
            Built: {buildTime === 'dev' ? 'Development' : new Date(buildTime).toLocaleString()}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
