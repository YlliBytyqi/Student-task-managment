import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Pencil, X, ArrowLeft, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DND-KIT Imports ---
import { DndContext, closestCorners, useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- KanBan Kolona (Droppable Area) ---
function KanbanColumn({ id, title, dotColor, tasks, openEditModal }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
                <h2 className="text-sm font-bold text-[#0f172a]">{title}</h2>
                <span className="px-2 py-0.5 rounded-md bg-[#f1f5f9] text-xs font-bold text-slate-500">{tasks.length}</span>
            </div>
            
            <div 
                ref={setNodeRef} 
                className={`flex flex-col gap-4 min-h-[400px] p-2 -m-2 rounded-2xl transition-colors ${isOver ? 'bg-slate-100' : ''}`}
            >
                {tasks.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center py-16 bg-slate-50/50">
                        <p className="text-sm font-semibold text-slate-400">Tërhiq Punë Këtu</p>
                    </div>
                ) : (
                    tasks.map(t => <TaskCard key={t.id} task={t} openEditModal={openEditModal} />)
                )}
            </div>
        </div>
    );
}

// --- Karta e Taskut (Draggable Element) ---
function TaskCard({ task, openEditModal }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id.toString(),
        data: task
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 999 : undefined,
        opacity: isDragging ? 0.8 : 1
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={`bg-white p-5 rounded-3xl border ${isDragging ? 'border-blue-400 shadow-2xl scale-105' : 'border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md'} transition-shadow relative group`}
        >
            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Butoni Edit - Mbron drag-in kur klikohet! */}
                <button 
                    onPointerDown={(e) => e.stopPropagation()} 
                    onClick={() => openEditModal(task)}
                    className="text-slate-300 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-xl transition-colors"
                    title="Edit Task"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                {/* Doreza (Drag Handle) për ta kapur lehtësisht */}
                <div 
                    {...listeners} {...attributes}
                    className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-1.5 rounded-xl"
                >
                    <GripVertical className="w-4 h-4" />
                </div>
            </div>
            
            <h4 className={`font-bold text-[#0f172a] text-sm pr-16 ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                {task.title}
            </h4>
            
            {task.description && (
                <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Detyra</p>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{task.description}</p>
                </div>
            )}

            {task.progressNotes && (
                <div className="mt-2 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Ditar Progresi</p>
                    <p className="text-xs text-blue-700 line-clamp-2 leading-relaxed italic">{task.progressNotes}</p>
                </div>
            )}
            
            <div className="mt-4 flex items-center justify-between gap-2">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${task.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {task.priority}
                </span>
                
                {task.assignedToName && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 truncate max-w-[100px]" title={task.assignedToName}>
                        👤 {task.assignedToName.split(' ')[0]}
                    </span>
                )}
            </div>
        </div>
    );
}


// --- Main Dashboard Component ---
export default function Dashboard() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    
    const [workspace, setWorkspace] = useState(null);
    const [tasks, setTasks] = useState({
        todo: [],
        inProgress: [],
        completed: []
    });

    const [editingTask, setEditingTask] = useState(null);
    const [editForm, setEditForm] = useState({ progressNotes: '', status: '' });
    const [error, setError] = useState('');

    const loadData = () => {
        if (!workspaceId) return;

        api.get(`/workspaces/single/${workspaceId}`)
            .then(res => setWorkspace(res.data))
            .catch(err => console.error("Could not fetch workspace", err));

        api.get(`/tasks/workspace/${workspaceId}`)
            .then(res => {
                const fTasks = res.data;
                setTasks({
                    todo: fTasks.filter(t => t.status === 'todo'),
                    inProgress: fTasks.filter(t => t.status === 'in-progress'),
                    completed: fTasks.filter(t => t.status === 'done')
                });
            })
            .catch(err => console.error("Could not fetch tasks", err));
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    // Hap dritaren Edit (Modalin)
    const openEditModal = (task) => {
        setEditingTask(task);
        setEditForm({
            progressNotes: task.progressNotes || '',
            status: task.status || 'todo'
        });
        setError('');
    };

    // Përditëso Task rrotullimit në edit modal
    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/tasks/${editingTask.id}`, {
                ...editingTask,
                progressNotes: editForm.progressNotes,
                status: editForm.status
            });
            setEditingTask(null);
            loadData();
        } catch (err) {
            setError("Gjatë përditësimit pati një gabim.");
            console.error(err);
        }
    };

    // Eventi kryesor Zvarrit-e-Lësho (Drag and Drop)
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return; // U lëshua jashtë zonave

        const taskId = parseInt(active.id);
        const newStatus = over.id; // over.id mban id e kolonës ('todo', 'in-progress', 'done')

        // E gjejmë Taskun që u tërhoq nga memorja aktuale
        const allLocal = [...tasks.todo, ...tasks.inProgress, ...tasks.completed];
        const draggedTask = allLocal.find(t => t.id === taskId);

        // Nëse vërtet u zhvendos në një kolonë tjetër, bëjmë ndryshimin vizual e Serveror
        if (draggedTask && draggedTask.status !== newStatus) {
            
            const oldKey = draggedTask.status === 'done' ? 'completed' : (draggedTask.status === 'in-progress' ? 'inProgress' : 'todo');
            const newKey = newStatus === 'done' ? 'completed' : (newStatus === 'in-progress' ? 'inProgress' : 'todo');

            const taskUpdated = { ...draggedTask, status: newStatus };

            // Përditësojmë pamjen direkt (Optimistic UI) pa pritur serverin
            setTasks(prev => ({
                ...prev,
                [oldKey]: prev[oldKey].filter(t => t.id !== taskId),
                [newKey]: [taskUpdated, ...prev[newKey]] // E lëshon të parën në listë
            }));

            // Godasim API për ta siguruar
            try {
                await api.put(`/tasks/${taskId}`, { ...taskUpdated, assignedToId: taskUpdated.assignedToId || null });
            } catch (err) {
                console.error("Gabim në Drag&Drop Update:", err);
                // Në rast gabimi duhet ta rikthejmë (loadData rifreskon realitetin)
                loadData();
            }
        }
    };

    const totalTasks = tasks.todo.length + tasks.inProgress.length + tasks.completed.length;

    return (
        <Navbar>
            <div className="max-w-6xl relative">
                
                {/* Dashboard Header me Back Button */}
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
                            <span className="text-[#0f172a]">{workspace ? workspace.name : "Loading..."}</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight">{workspace ? workspace.name : "..."}</h1>
                        {workspace?.description && <p className="text-slate-500 mt-2">{workspace.description}</p>}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">Total Tasks</h3>
                        <div className="text-5xl font-black text-[#0f172a] tracking-tighter">{totalTasks}</div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">To Do</h3>
                        <div className="text-5xl font-black text-blue-500 tracking-tighter">{tasks.todo.length}</div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">In Progress</h3>
                        <div className="text-5xl font-black text-amber-500 tracking-tighter">{tasks.inProgress.length}</div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">Completed</h3>
                        <div className="text-5xl font-black text-emerald-500 tracking-tighter">{tasks.completed.length}</div>
                    </div>
                </div>

                {/* DND Context Për Kanban Columns */}
                <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {/* Kolona 1 */}
                        <KanbanColumn id="todo" title="To Do" dotColor="bg-blue-500" tasks={tasks.todo} openEditModal={openEditModal} />
                        
                        {/* Kolona 2 */}
                        <KanbanColumn id="in-progress" title="In Progress" dotColor="bg-amber-500" tasks={tasks.inProgress} openEditModal={openEditModal} />
                        
                        {/* Kolona 3 */}
                        <KanbanColumn id="done" title="Done" dotColor="bg-emerald-500" tasks={tasks.completed} openEditModal={openEditModal} />
                    </div>
                </DndContext>

                {/* Edit Modal me Framer Motion (Animime Smooth) */}
                <AnimatePresence>
                    {editingTask && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }} 
                                animate={{ scale: 1, y: 0 }} 
                                exit={{ scale: 0.9, y: 20 }}
                                transition={{ type: "spring", duration: 0.4 }}
                                className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0f172a]">Update Task</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-1 truncate max-w-[300px]">{editingTask.title}</p>
                                    </div>
                                    <button 
                                        onClick={() => setEditingTask(null)}
                                        className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleUpdateTask} className="p-6 space-y-6">
                                    {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">{error}</div>}

                                    {editingTask.description && (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                                            <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Detyra Fillestare (Kërkesa)</label>
                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{editingTask.description}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[11px] font-bold tracking-wider text-blue-500 uppercase mb-2">Ditar Progresi (Çfarë ke bërë?)</label>
                                        <textarea 
                                            value={editForm.progressNotes}
                                            onChange={(e) => setEditForm({...editForm, progressNotes: e.target.value})}
                                            className="w-full appearance-none rounded-xl border border-blue-200 px-4 py-3 text-sm text-blue-900 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/30 placeholder-blue-300"
                                            placeholder="Shkruaj progresin ose komentet e tua këtu..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Statusi i ri</label>
                                        <select 
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                            className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="todo">To Do (E pafilluar)</option>
                                            <option value="in-progress">In Progress (Në proces)</option>
                                            <option value="done">Done (E përfunduar)</option>
                                        </select>
                                    </div>

                                    <div className="pt-2">
                                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 px-4 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </Navbar>
    );
}
