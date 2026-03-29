import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function Workspaces() {
    const navigate = useNavigate();

    const [workspaces, setWorkspaces] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorkspaces();
    }, []);

    const loadWorkspaces = async () => {
        try {
            setLoading(true);
            const res = await api.get('/workspaces');
            setWorkspaces(res.data);
        } catch (err) {
            console.error('Error loading workspaces:', err);
            setError('Could not load workspaces.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Workspace name is required.');
            return;
        }

        try {
            await api.post('/workspaces', {
                name: name.trim(),
                description: description.trim(),
            });

            setName('');
            setDescription('');
            await loadWorkspaces();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create workspace.');
        }
    };

    const handleDeleteWorkspace = async (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this workspace? All tasks inside it will also be deleted.'
        );

        if (!confirmed) return;

        try {
            await api.delete(`/workspaces/${id}`);
            await loadWorkspaces();
        } catch (err) {
            console.error('Delete workspace error:', err);
            alert(err.response?.data?.error || 'Could not delete workspace.');
        }
    };

    return (
        <Navbar>
            <div className="max-w-6xl">
                <h1 className="text-4xl font-extrabold text-[#0f172a] mb-10 tracking-tight">
                    Workspaces
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Your Workspaces</h2>

                        {loading ? (
                            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
                                <p className="text-slate-500 font-medium">Loading workspaces...</p>
                            </div>
                        ) : workspaces.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
                                <p className="text-slate-500 font-medium">
                                    You do not have any workspaces yet. Create one below.
                                </p>
                            </div>
                        ) : (
                            workspaces.map((ws) => (
                                <div
                                    key={ws.id}
                                    onClick={() => navigate(`/workspace/${ws.id}/dashboard`)}
                                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow flex justify-between items-start group cursor-pointer"
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">
                                            {ws.name}
                                        </h3>
                                        {ws.description && (
                                            <p className="text-sm text-slate-500 mt-2">{ws.description}</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteWorkspace(ws.id);
                                        }}
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Workspace"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                            Create Workspace
                        </h2>

                        <form onSubmit={handleCreateWorkspace} className="space-y-4">
                            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="E.g. Frontend Project"
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional description"
                                    rows="3"
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#0f172a] text-white py-3.5 px-4 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                            >
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