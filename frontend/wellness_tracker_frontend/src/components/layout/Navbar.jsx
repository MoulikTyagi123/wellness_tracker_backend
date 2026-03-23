function Navbar() {
  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">User</span>
      </div>
    </div>
  );
}

export default Navbar;