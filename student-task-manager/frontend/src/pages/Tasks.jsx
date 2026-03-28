import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);
    
    // Forma fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('todo'); // 'todo', 'in-progress', 'done'
    const [priority, setPriority] = useState('medium'); // 'low', 'medium', 'high'
    const [workspaceId, setWorkspaceId] = useState('');
    const [assignedToId, setAssignedToId] = useState(''); // Gjëja e re: Kujt i caktohet
    const [user, setUser] = useState(null);
    const [usersList, setUsersList] = useState([]); // Lista e personave
    const [error, setError] = useState('');

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) {
            const parsed = JSON.parse(u);
            setUser(parsed);
            loadWorkspaces(parsed.id);
            loadTasks();
            
            // Tërhiq gjithë users për dropdown e delegimit
            api.get('/auth/users')
               .then(res => setUsersList(res.data))
               .catch(err => console.error(err));
        }
    }, []);

    const loadWorkspaces = async (userId) => {
        try {
            const res = await api.get(`/workspaces/${userId}`);
            setWorkspaces(res.data);
            if (res.data.length > 0) {
                setWorkspaceId(res.data[0].id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error("Error load tasks:", err);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setError('');
        if (!title || !workspaceId) return setError("Titulli dhe Workspace janë të detyrueshëm.");

        try {
            await api.post('/tasks', { 
                title, 
                description, 
                status, 
                priority, 
                workspaceId,
                assignedToId: assignedToId || null, // Ndryshimi i ri 
                createdById: user.id 
            });
            setTitle('');
            setDescription('');
            setAssignedToId('');
            loadTasks();
        } catch (err) {
            setError(err.response?.data?.error || "Krijimi i task-ut dështoi.");
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm("A jeni i sigurt që doni të fshini këtë Task?")) return;
        
        try {
            await api.delete(`/tasks/${id}`);
            loadTasks();
        } catch (err) {
            console.error("Gabim gjatë fshirjes", err);
            alert("Nuk u fshi dot Task-u!");
        }
    };

    return (
        <Navbar>
            <div className="max-w-6xl">
                <h1 className="text-4xl font-extrabold text-[#0f172a] mb-10 tracking-tight">Manage Tasks</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* List of Latest Tasks */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Your Tasks</h2>
                        {tasks.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
                                <p className="text-slate-500 font-medium">No tasks found. Create one to get started.</p>
                            </div>
                        ) : (
                            tasks.map((t) => (
                                <div key={t.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex justify-between items-center hover:shadow-md transition-shadow group">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0f172a]">{t.title}</h3>
                                        <p className="text-sm text-slate-500 mt-1">{t.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                            ${t.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 
                                              t.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 
                                              'bg-blue-100 text-blue-700'}`}>
                                            {t.status}
                                        </span>
                                        <button 
                                            onClick={() => handleDeleteTask(t.id)}
                                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                            title="Fshi Task"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Forma e krijimit Task */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Create New Task</h2>
                        
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
                            
                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Title</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Task title"
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Workspace</label>
                                <select 
                                    value={workspaceId} 
                                    onChange={(e) => setWorkspaceId(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                                >
                                    {workspaces.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                    {workspaces.length === 0 && <option value="">Nuk ka workspaces</option>}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Assign To (Optional)</label>
                                <select 
                                    value={assignedToId} 
                                    onChange={(e) => setAssignedToId(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                                >
                                    <option value="">-- No one assigned --</option>
                                    {usersList.map(u => (
                                        <option key={u.id} value={u.id}>{u.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Description</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional details"
                                    rows="3"
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                />
                            </div>

                            <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 bg-[#0f172a] text-white py-3.5 px-4 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                                <Plus className="w-4 h-4" />
                                Add Task
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Navbar>
    );
}
