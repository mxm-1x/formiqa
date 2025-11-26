import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navItems = [
        { label: "Sessions", path: "/presenter", icon: "📊" },
        { label: "Settings", path: "/presenter/settings", icon: "⚙️" },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-gray-100">
                    <div className="text-2xl font-bold tracking-tighter text-primary">Formiqa.</div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== "/presenter" && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                                    ? "bg-primary/5 text-primary"
                                    : "text-gray-600 hover:bg-orange-50 hover:text-gray-900"
                                    }`}
                            >
                                <span className="mr-3 text-lg">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center mb-4 px-2">
                        <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-primary font-bold mr-3">
                            {user?.email?.[0].toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-red-600 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {navItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
                    </h2>
                    <Link to="/presenter/create" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                        + New Session
                    </Link>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
