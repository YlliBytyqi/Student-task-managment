import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Hash, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Navbar({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [workspaces, setWorkspaces] = useState([]);

    useEffect(() => {
        const loadNavbarData = async () => {
            const storedUser = localStorage.getItem('user');

            if (!storedUser) {
                navigate('/login');
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            try {
                const res = await api.get('/workspaces');
                setWorkspaces(res.data || []);
            } catch (err) {
                console.error('Failed to load workspaces:', err);
            }
        };

        loadNavbarData();
    }, [navigate, location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
            <div className="w-64 bg-white border-r border-[#e5e7eb] flex flex-col justify-between shadow-sm z-10 shrink-0">
                <div className="overflow-y-auto">
                    <div
                        className="flex items-center gap-3 px-6 py-8 border-b border-transparent cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <div className="bg-[#0f172a] p-2 rounded-xl group-hover:bg-blue-600 transition-colors">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-[#0f172a] group-hover:text-blue-600 transition-colors">
                            TaskFlow
                        </span>
                    </div>

                    <div className="px-4 py-6">
                        <div className="mb-8">
                            <div className="flex items-center justify-between px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                <span>Workspaces</span>
                                <Plus
                                    className="w-4 h-4 cursor-pointer hover:text-slate-600"
                                    onClick={() => navigate('/workspaces')}
                                />
                            </div>

                            <div className="space-y-1">
                                {workspaces.length === 0 ? (
                                    <div className="px-3 py-2 text-xs text-slate-400 italic">
                                        No workspaces yet.
                                    </div>
                                ) : (
                                    workspaces.map((ws) => (
                                        <Link
                                            key={ws.id}
                                            to={`/workspace/${ws.id}/dashboard`}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                                                location.pathname.startsWith(`/workspace/${ws.id}`)
                                                    ? 'bg-[#0f172a] text-white shadow-md'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Hash
                                                className={`w-4 h-4 ${
                                                    location.pathname.startsWith(`/workspace/${ws.id}`)
                                                        ? 'text-slate-300'
                                                        : 'text-slate-400'
                                                }`}
                                            />
                                            <span className="truncate">{ws.name}</span>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-t border-[#e5e7eb] flex justify-between items-center group cursor-pointer hover:bg-slate-50 rounded-xl transition-colors m-2">
                    <div
                        className="flex items-center gap-3 overflow-hidden flex-1"
                        onClick={() => navigate('/profile')}
                    >
                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-[#f1f5f9] flex items-center justify-center border border-slate-200">
                            <span className="text-slate-600 font-bold text-sm">
                                {user?.fullName?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                                {user?.fullName || 'Student'}
                            </p>
                            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 truncate">
                                {user?.role || 'student'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleLogout();
                        }}
                        className="text-xs text-red-500 font-bold hover:text-red-700 px-2"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-20 border-b border-[#e5e7eb] bg-white flex items-center justify-end px-8 z-10 sticky top-0 shrink-0">

                    <div className="flex items-center gap-4">
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="flex items-center gap-2 bg-[#0f172a] text-white px-5 py-2.5 rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                            >
                                <Users className="w-4 h-4" />
                                Admin Dashboard
                            </button>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-[#f8fafc] p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}