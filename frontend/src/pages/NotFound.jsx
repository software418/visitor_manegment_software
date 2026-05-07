const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">404</h1>
        <p className="mt-2 text-slate-500">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
};

export default NotFound;