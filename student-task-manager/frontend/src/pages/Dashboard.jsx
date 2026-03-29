import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
    Pencil,
    X,
    ArrowLeft,
    Users,
    Trash2,
    UserPlus,
    Mail,
    Plus,
    GripVertical,
} from 'lucide-react';
import { DndContext, closestCorners, useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function TaskCard({ task, openEditModal, memberMap }) {
    const assignedName = task.assignedToId ? memberMap[task.assignedToId] : null;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id.toString(),
        data: task,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white p-5 rounded-3xl border ${
                isDragging
                    ? 'border-blue-300 shadow-2xl'
                    : 'border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md'
            } transition-shadow relative group`}
        >
            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => openEditModal(task)}
                    className="text-slate-300 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-xl transition-colors"
                    title="Edit Task"
                >
                    <Pencil className="w-4 h-4" />
                </button>

                <div
                    {...listeners}
                    {...attributes}
                    className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-1.5 rounded-xl"
                    title="Drag Task"
                >
                    <GripVertical className="w-4 h-4" />
                </div>
            </div>

            <h4
                className={`font-bold text-[#0f172a] text-sm pr-16 ${
                    task.status === 'done' ? 'line-through text-slate-400' : ''
                }`}
            >
                {task.title}
            </h4>

            {task.description && (
                <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Description
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {task.description}
                    </p>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-2">
                <span
                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                        task.priority === 'high'
                            ? 'bg-red-50 text-red-600'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-100 text-slate-500'
                    }`}
                >
                    {task.priority}
                </span>

                {assignedName && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 truncate max-w-[140px]">
                        {assignedName}
                    </span>
                )}
            </div>
        </div>
    );
}

function Column({ id, title, dotColor, tasks, openEditModal, memberMap }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
                <h2 className="text-sm font-bold text-[#0f172a]">{title}</h2>
                <span className="px-2 py-0.5 rounded-md bg-[#f1f5f9] text-xs font-bold text-slate-500">
                    {tasks.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={`flex flex-col gap-4 min-h-[300px] p-2 -m-2 rounded-2xl transition-colors ${
                    isOver ? 'bg-slate-100' : ''
                }`}
            >
                {tasks.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center py-16 bg-slate-50/50">
                        <p className="text-sm font-semibold text-slate-400">Drop tasks here</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            openEditModal={openEditModal}
                            memberMap={memberMap}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState(null);
    const [tasks, setTasks] = useState({
        todo: [],
        inProgress: [],
        completed: [],
    });

    const [editingTask, setEditingTask] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignedToId: '',
    });

    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignedToId: '',
    });

    const [error, setError] = useState('');
    const [createError, setCreateError] = useState('');

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [memberEmail, setMemberEmail] = useState('');
    const [teamError, setTeamError] = useState('');
    const [teamSuccess, setTeamSuccess] = useState('');

    const assignableUsers = useMemo(() => {
        return [...teamMembers];
    }, [teamMembers]);

    const memberMap = useMemo(() => {
        return assignableUsers.reduce((acc, member) => {
            acc[member.id] = member.fullName;
            return acc;
        }, {});
    }, [assignableUsers]);

    const loadWorkspace = async () => {
        try {
            const workspaceRes = await api.get(`/workspaces/single/${workspaceId}`);
            setWorkspace(workspaceRes.data);
        } catch (err) {
            console.error('Could not fetch workspace', err);
        }
    };

    const loadTasks = async () => {
        try {
            const tasksRes = await api.get(`/tasks/workspace/${workspaceId}`);
            const fetchedTasks = tasksRes.data || [];

            setTasks({
                todo: fetchedTasks.filter((t) => t.status === 'todo'),
                inProgress: fetchedTasks.filter((t) => t.status === 'in-progress'),
                completed: fetchedTasks.filter((t) => t.status === 'done'),
            });
        } catch (err) {
            console.error('Could not fetch tasks', err);
        }
    };

    const loadTeam = async () => {
        try {
            const memRes = await api.get(`/workspaces/${workspaceId}/members`);
            setTeamMembers(memRes.data || []);
        } catch (err) {
            console.error('Could not fetch team members', err);
        }
    };

    const loadAllData = async () => {
        if (!workspaceId) return;
        await Promise.all([loadWorkspace(), loadTasks(), loadTeam()]);
    };

    useEffect(() => {
        loadAllData();
    }, [workspaceId]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        setTeamError('');
        setTeamSuccess('');

        if (!memberEmail.trim()) {
            setTeamError('Email is required.');
            return;
        }

        try {
            await api.post(`/workspaces/${workspaceId}/members`, {
                email: memberEmail.trim(),
            });
            setMemberEmail('');
            setTeamSuccess('Member added successfully.');
            await loadTeam();
            setTimeout(() => setTeamSuccess(''), 2500);
        } catch (err) {
            setTeamError(err.response?.data?.error || 'Error adding member');
            setTimeout(() => setTeamError(''), 3000);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member from the workspace?')) {
            return;
        }

        try {
            await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
            await loadTeam();
            await loadTasks();
        } catch (err) {
            console.error('Error removing member:', err);
        }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setEditForm({
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'todo',
            priority: task.priority || 'medium',
            assignedToId: task.assignedToId ? String(task.assignedToId) : '',
        });
        setError('');
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();

        try {
            await api.put(`/tasks/${editingTask.id}`, {
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                status: editForm.status,
                priority: editForm.priority,
                assignedToId: editForm.assignedToId ? Number(editForm.assignedToId) : null,
            });

            setEditingTask(null);
            await loadTasks();
        } catch (err) {
            setError(err.response?.data?.error || 'Task update failed.');
            console.error(err);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setCreateError('');

        if (!createForm.title.trim()) {
            setCreateError('Task title is required.');
            return;
        }

        try {
            await api.post('/tasks', {
                title: createForm.title.trim(),
                description: createForm.description.trim(),
                status: createForm.status,
                priority: createForm.priority,
                workspaceId: Number(workspaceId),
                assignedToId: createForm.assignedToId ? Number(createForm.assignedToId) : null,
            });

            setCreateForm({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                assignedToId: '',
            });

            setIsCreateTaskModalOpen(false);
            await loadTasks();
        } catch (err) {
            setCreateError(err.response?.data?.error || 'Task creation failed.');
            console.error(err);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const taskId = Number(active.id);
        const newStatus = over.id;

        const allTasks = [...tasks.todo, ...tasks.inProgress, ...tasks.completed];
        const draggedTask = allTasks.find((t) => t.id === taskId);

        if (!draggedTask || draggedTask.status === newStatus) return;

        const oldKey =
            draggedTask.status === 'done'
                ? 'completed'
                : draggedTask.status === 'in-progress'
                ? 'inProgress'
                : 'todo';

        const newKey =
            newStatus === 'done'
                ? 'completed'
                : newStatus === 'in-progress'
                ? 'inProgress'
                : 'todo';

        const updatedTask = { ...draggedTask, status: newStatus };

        setTasks((prev) => ({
            ...prev,
            [oldKey]: prev[oldKey].filter((t) => t.id !== taskId),
            [newKey]: [updatedTask, ...prev[newKey]],
        }));

        try {
            await api.put(`/tasks/${taskId}`, {
                title: updatedTask.title,
                description: updatedTask.description,
                status: updatedTask.status,
                priority: updatedTask.priority,
                assignedToId: updatedTask.assignedToId || null,
            });
        } catch (err) {
            console.error('Drag and drop update failed:', err);
            await loadTasks();
        }
    };

    const totalTasks = tasks.todo.length + tasks.inProgress.length + tasks.completed.length;

    return (
        <Navbar>
            <div className="max-w-6xl">
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase text-slate-400 mb-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-1 hover:text-blue-500 transition-colors bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm"
                            >
                                <ArrowLeft className="w-3 h-3" /> Back
                            </button>
                            <span className="text-slate-300">/</span>
                            <span>Workspaces</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-[#0f172a]">
                                {workspace ? workspace.name : 'Loading...'}
                            </span>
                        </div>

                        <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight">
                            {workspace ? workspace.name : '...'}
                        </h1>

                        {workspace?.description && (
                            <p className="text-slate-500 mt-2">{workspace.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setIsCreateTaskModalOpen(true);
                                setCreateError('');
                            }}
                            className="flex items-center gap-2 bg-[#0f172a] text-white px-5 py-3 rounded-2xl text-sm font-extrabold hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> New Task
                        </button>

                        {workspace && currentUser && workspace.ownerId === currentUser.id && (
                            <button
                                onClick={() => {
                                    setIsTeamModalOpen(true);
                                    loadTeam();
                                }}
                                className="flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-3 rounded-2xl text-sm font-extrabold hover:bg-blue-600 hover:text-white transition-colors border border-blue-100 shadow-sm"
                            >
                                <Users className="w-4 h-4" /> Manage Team
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">
                            Total Tasks
                        </h3>
                        <div className="text-5xl font-black text-[#0f172a] tracking-tighter">
                            {totalTasks}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">
                            To Do
                        </h3>
                        <div className="text-5xl font-black text-blue-500 tracking-tighter">
                            {tasks.todo.length}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">
                            In Progress
                        </h3>
                        <div className="text-5xl font-black text-amber-500 tracking-tighter">
                            {tasks.inProgress.length}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">
                            Completed
                        </h3>
                        <div className="text-5xl font-black text-emerald-500 tracking-tighter">
                            {tasks.completed.length}
                        </div>
                    </div>
                </div>

                <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Column
                            id="todo"
                            title="To Do"
                            dotColor="bg-blue-500"
                            tasks={tasks.todo}
                            openEditModal={openEditModal}
                            memberMap={memberMap}
                        />
                        <Column
                            id="in-progress"
                            title="In Progress"
                            dotColor="bg-amber-500"
                            tasks={tasks.inProgress}
                            openEditModal={openEditModal}
                            memberMap={memberMap}
                        />
                        <Column
                            id="done"
                            title="Done"
                            dotColor="bg-emerald-500"
                            tasks={tasks.completed}
                            openEditModal={openEditModal}
                            memberMap={memberMap}
                        />
                    </div>
                </DndContext>

                {isCreateTaskModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-bold text-[#0f172a]">Create Task</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1">
                                        {workspace?.name || 'Current Workspace'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsCreateTaskModalOpen(false)}
                                    className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTask} className="p-6 space-y-6">
                                {createError && (
                                    <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">
                                        {createError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.title}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, title: e.target.value })
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={createForm.description}
                                        onChange={(e) =>
                                            setCreateForm({
                                                ...createForm,
                                                description: e.target.value,
                                            })
                                        }
                                        rows="4"
                                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                        Assign To
                                    </label>
                                    <select
                                        value={createForm.assignedToId}
                                        onChange={(e) =>
                                            setCreateForm({
                                                ...createForm,
                                                assignedToId: e.target.value,
                                            })
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">Unassigned</option>
                                        {assignableUsers.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.fullName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={createForm.status}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, status: e.target.value })
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
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
                                        value={createForm.priority}
                                        onChange={(e) =>
                                            setCreateForm({
                                                ...createForm,
                                                priority: e.target.value,
                                            })
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 px-4 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Task
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {editingTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-bold text-[#0f172a]">Update Task</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1 truncate max-w-[300px]">
                                        {editingTask.title}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEditingTask(null)}
                                    className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateTask} className="p-6 space-y-6">
                                {error && (
                                    <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, title: e.target.value })
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                description: e.target.value,
                                            })
                                        }
                                        rows="4"
                                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                        Assign To
                                    </label>
                                    <select
                                        value={editForm.assignedToId}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                assignedToId: e.target.value,
                                            })
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">Unassigned</option>
                                        {assignableUsers.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.fullName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, status: e.target.value })
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
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
                                        value={editForm.priority}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                priority: e.target.value,
                                            })
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 px-4 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isTeamModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-xl">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-extrabold text-[#0f172a]">
                                            Manage Team Access
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium mt-1">
                                            Add or remove members from this workspace.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsTeamModalOpen(false)}
                                    className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors shadow-sm"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto w-full">
                                {teamError && (
                                    <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl mb-4">
                                        {teamError}
                                    </div>
                                )}

                                {teamSuccess && (
                                    <div className="text-emerald-500 text-sm font-bold bg-emerald-50 p-3 rounded-xl mb-4">
                                        {teamSuccess}
                                    </div>
                                )}

                                <div className="mb-8">
                                    <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-3">
                                        Add Member by Email
                                    </label>

                                    <form onSubmit={handleAddMember} className="space-y-3">
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                            <input
                                                type="email"
                                                value={memberEmail}
                                                onChange={(e) => setMemberEmail(e.target.value)}
                                                placeholder="Enter user email..."
                                                className="w-full bg-[#f8fafc] border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Add Member
                                        </button>
                                    </form>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-3">
                                        Current Members ({assignableUsers.length})
                                    </label>

                                    {assignableUsers.length === 0 ? (
                                        <div className="text-center bg-slate-50 rounded-2xl p-6 border border-slate-100 border-dashed">
                                            <p className="text-sm text-slate-400 font-medium">
                                                No members in this workspace yet.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {assignableUsers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                                            {member.fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">
                                                                {member.fullName}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500">
                                                                {member.email || ''}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {workspace?.ownerId !== member.id && (
                                                        <button
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                            title="Remove Member"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Navbar>
    );
}