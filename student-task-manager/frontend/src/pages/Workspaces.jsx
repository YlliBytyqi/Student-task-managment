import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function Workspaces() {
    const [workspaces, setWorkspaces] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) {
            const parsed = JSON.parse(u);
            setUser(parsed);
            loadWorkspaces(parsed.id);
        }
    }, []);

    const loadWorkspaces = async (userId) => {
        try {
            const res = await api.get(`/workspaces/${userId}`);
            setWorkspaces(res.data);
        } catch (err) {
            console.error("Gjatë tërheqjes së Workspaces:", err);
        }
    };

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        setError('');
        if (!name) return setError("Emri i Workspace është i detyrueshëm.");
        
        try {
            await api.post('/workspaces', { name, description, ownerId: user.id });
            setName('');
            setDescription('');
            loadWorkspaces(user.id);
            // Detyrojmë Navbarin të marrë rifreskim
            window.location.reload(); 
        } catch (err) {
            setError(err.response?.data?.error || "Krijimi dështoi.");
        }
    };

    const handleDeleteWorkspace = async (id) => {
        if (!window.confirm("A jeni i sigurt që doni të fshini këtë Workspace? Do të fshihen edhe të gjitha Task-et brenda saj!")) return;
        
        try {
            await api.delete(`/workspaces/${id}`);
            loadWorkspaces(user.id);
            window.location.reload(); 
        } catch (err) {
            console.error("Gabim gjatë fshirjes", err);
            alert("Nuk u fshi dot Workspace!");
        }
    };

    return (
        <Navbar>
            <div className="max-w-6xl">
                <h1 className="text-4xl font-extrabold text-[#0f172a] mb-10 tracking-tight">Workspaces</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista e Workspaces */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Your Workspaces</h2>
                        {workspaces.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
                                <p className="text-slate-500 font-medium">Nuk keni asnjë Workspace ende. Krijoni një më poshtë.</p>
                            </div>
                        ) : (
                            workspaces.map((ws) => (
                                <div key={ws.id} 
                                     onClick={() => window.location.href = `/workspace/${ws.id}/dashboard`}
                                     className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow flex justify-between items-start group cursor-pointer">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">{ws.name}</h3>
                                        {ws.description && <p className="text-sm text-slate-500 mt-2">{ws.description}</p>}
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteWorkspace(ws.id);
                                        }}
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                        title="Fshi Workspace"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Forma e krijimit form */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Create Workspace</h2>
                        
                        <form onSubmit={handleCreateWorkspace} className="space-y-4">
                            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
                            
                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="E.g. Laboratori 1"
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Description</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional description"
                                    rows="3"
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                />
                            </div>

                            <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 bg-[#0f172a] text-white py-3.5 px-4 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                                <Plus className="w-4 h-4" />
                                Create
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Navbar>
    );
}
