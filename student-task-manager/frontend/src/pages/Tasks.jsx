import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('todo');
    const [priority, setPriority] = useState('medium');
    const [workspaceId, setWorkspaceId] = useState('');
    const [assignedToId, setAssignedToId] = useState('');
    const [error, setError] = useState('');
    const [loadingTasks, setLoadingTasks] = useState(false);

    useEffect(() => {
        loadWorkspaces();
    }, []);

    useEffect(() => {
        if (workspaceId) {
            loadTasks(workspaceId);
        } else {
            setTasks([]);
        }
    }, [workspaceId]);

    const loadWorkspaces = async () => {
        try {
            const res = await api.get('/workspaces');
            const data = res.data || [];
            setWorkspaces(data);

            if (data.length > 0) {
                setWorkspaceId(String(data[0].id));
            }
        } catch (err) {
            console.error('Error loading workspaces:', err);
        }
    };

    const loadTasks = async (selectedWorkspaceId) => {
        try {
            setLoadingTasks(true);
            const res = await api.get(`/tasks/workspace/${selectedWorkspaceId}`);
            setTasks(res.data || []);
        } catch (err) {
            console.error('Error loading tasks:', err);
            setTasks([]);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim() || !workspaceId) {
            setError('Title and workspace are required.');
            return;
        }

        try {
            await api.post('/tasks', {
                title: title.trim(),
                description: description.trim(),
                status,
                priority,
                workspaceId: Number(workspaceId),
                assignedToId: assignedToId ? Number(assignedToId) : null,
            });

            setTitle('');
            setDescription('');
            setAssignedToId('');
            setStatus('todo');
            setPriority('medium');

            await loadTasks(workspaceId);
        } catch (err) {
            setError(err.response?.data?.error || 'Task creation failed.');
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            await api.delete(`/tasks/${id}`);
            await loadTasks(workspaceId);
        } catch (err) {
            console.error('Delete task error:', err);
            alert(err.response?.data?.error || 'Could not delete task.');
        }
    };

    return (
        <Navbar>
            <div className="max-w-6xl">
                <h1 className="text-4xl font-extrabold text-[#0f172a] mb-10 tracking-tight">
                    Manage Tasks
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Tasks in Workspace</h2>

                        {!workspaceId ? (
                            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
                                <p className="text-slate-500 font-medium">
                                    No workspace available. Create a workspace first.
                                </p>
                            </div>
                        ) : loadingTasks ? (
                            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
                                <p className="text-slate-500 font-medium">Loading tasks...</p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
                                <p className="text-slate-500 font-medium">
                                    No tasks found in this workspace. Create one to get started.
                                </p>
                            </div>
                        ) : (
                            tasks.map((t) => (
                                <div
                                    key={t.id}
                                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex justify-between items-center hover:shadow-md transition-shadow group"
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0f172a]">{t.title}</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {t.description || 'No description'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                t.status === 'done'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : t.status === 'in-progress'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}
                                        >
                                            {t.status}
                                        </span>

                                        <button
                                            onClick={() => handleDeleteTask(t.id)}
                                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Task"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                            Create New Task
                        </h2>

                        <form onSubmit={handleCreateTask} className="space-y-4">
                            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                    Title
                                </label>
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
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                    Workspace
                                </label>
                                <select
                                    value={workspaceId}
                                    onChange={(e) => setWorkspaceId(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                                >
                                    {workspaces.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.name}
                                        </option>
                                    ))}
                                    {workspaces.length === 0 && <option value="">No workspaces</option>}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                    Assigned User ID
                                </label>
                                <input
                                    type="number"
                                    value={assignedToId}
                                    onChange={(e) => setAssignedToId(e.target.value)}
                                    placeholder="Optional user id"
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                    Priority
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional details"
                                    rows="3"
                                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#0f172a] text-white py-3.5 px-4 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                            >
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