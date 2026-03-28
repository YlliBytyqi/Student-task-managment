import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FolderKanban, Users, Activity, CheckCircle2 } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ workspaces: 0, users: 0, completedTasks: 0 });
    const [recentWorkspaces, setRecentWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const u = localStorage.getItem('user');
                if (!u) return navigate('/login');
                const userObj = JSON.parse(u);

                // Fetch data in parallel
                const [workspacesRes, usersRes, tasksRes] = await Promise.all([
                    api.get(`/workspaces/${userObj.id}`),
                    api.get('/auth/users'),
                    api.get('/tasks') // Note: if backend allows getting all tasks for stats
                ]);

                const workspaces = workspacesRes.data;
                const users = usersRes.data;
                const allTasks = tasksRes.data || [];
                
                setStats({
                    workspaces: workspaces.length,
                    users: users.length,
                    completedTasks: allTasks.filter(t => t.status === 'done').length
                });

                setRecentWorkspaces(workspaces.slice(0, 4)); // Show recent 4
                setLoading(false);
            } catch (err) {
                console.error("Home Dashboard data fetch error:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    return (
        <Navbar>
            <div className="max-w-6xl">
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight">System Overview</h1>
                    <p className="text-slate-500 mt-2 font-medium">Një pamje analitike e të gjitha hapësirave të tua dhe aktivitetit të platformës.</p>
                </motion.div>

                {loading ? (
                    <div className="flex animate-pulse space-x-4 h-32 items-center justify-center">
                        <div className="text-slate-400 font-bold">Duke ngarkuar të dhënat...</div>
                    </div>
                ) : (
                    <>
                        {/* Stat Cards - Animated individually */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }}
                                className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => navigate('/workspaces')}
                            >
                                <div>
                                    <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2">Total Workspaces</h3>
                                    <div className="text-4xl font-black text-[#0f172a]">{stats.workspaces}</div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FolderKanban className="w-8 h-8" />
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.4 }}
                                className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => navigate('/users')}
                            >
                                <div>
                                    <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2">Registered Users</h3>
                                    <div className="text-4xl font-black text-[#0f172a]">{stats.users}</div>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-2xl text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Users className="w-8 h-8" />
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.4 }}
                                className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => navigate('/tasks')}
                            >
                                <div>
                                    <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2">Tasks Completed</h3>
                                    <div className="text-4xl font-black text-[#0f172a]">{stats.completedTasks}</div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Recent Workspaces Quick Jump */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-slate-400" />
                                Shko tek Krijimet e Fundit
                            </h2>
                            {recentWorkspaces.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-500">
                                    Nuk ka të dhëna. Shto një Workspace!
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {recentWorkspaces.map((ws, i) => (
                                        <motion.div 
                                            key={ws.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate(`/workspace/${ws.id}/dashboard`)}
                                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer hover:border-blue-200 transition-colors flex justify-between items-center"
                                        >
                                            <div>
                                                <h4 className="font-bold text-[#0f172a] flex items-center gap-2 text-lg">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                                                    {ws.name}
                                                </h4>
                                                <p className="text-xs text-slate-400 mt-2 line-clamp-1">{ws.description || "Asnjë përshkrim."}</p>
                                            </div>
                                            <div className="text-slate-300">→</div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </div>
        </Navbar>
    );
}
