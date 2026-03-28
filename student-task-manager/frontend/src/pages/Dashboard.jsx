import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Dashboard() {
    // Placeholder states for now
    const [tasks, setTasks] = useState({
        total: 0,
        todo: 0,
        inProgress: 0,
        completed: 0
    });

    useEffect(() => {
        // Fetch tasks for the dashboard here in the future
        // api.get('/tasks').then(...)
    }, []);

    return (
        <Navbar>
            <div className="max-w-6xl">
                
                {/* Dashboard Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase text-slate-400 mb-3">
                        <span>Workspaces</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-[#0f172a]">Laboratori 1</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight">Laboratori 1</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {/* Total Tasks */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">Total Tasks</h3>
                        <div className="text-5xl font-black text-[#0f172a] tracking-tighter">
                            {tasks.total}
                        </div>
                    </div>

                    {/* To Do */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">To Do</h3>
                        <div className="text-5xl font-black text-blue-500 tracking-tighter">
                            {tasks.todo}
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">In Progress</h3>
                        <div className="text-5xl font-black text-amber-500 tracking-tighter">
                            {tasks.inProgress}
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center">
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">Completed</h3>
                        <div className="text-5xl font-black text-emerald-500 tracking-tighter">
                            {tasks.completed}
                        </div>
                    </div>
                </div>

                {/* Kanban Columns (Empty State Preview) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Column TO DO */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            <h2 className="text-sm font-bold text-[#0f172a]">To Do</h2>
                            <span className="px-2 py-0.5 rounded-md bg-[#f1f5f9] text-xs font-bold text-slate-500">{tasks.todo}</span>
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center py-20 bg-slate-50/50">
                            <p className="text-sm font-semibold text-slate-400">No tasks</p>
                        </div>
                    </div>

                    {/* Column IN PROGRESS */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            <h2 className="text-sm font-bold text-[#0f172a]">In Progress</h2>
                            <span className="px-2 py-0.5 rounded-md bg-[#f1f5f9] text-xs font-bold text-slate-500">{tasks.inProgress}</span>
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center py-20 bg-slate-50/50">
                            <p className="text-sm font-semibold text-slate-400">No tasks</p>
                        </div>
                    </div>

                    {/* Column DONE */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            <h2 className="text-sm font-bold text-[#0f172a]">Done</h2>
                            <span className="px-2 py-0.5 rounded-md bg-[#f1f5f9] text-xs font-bold text-slate-500">{tasks.completed}</span>
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center py-20 bg-slate-50/50">
                            <p className="text-sm font-semibold text-slate-400">No tasks</p>
                        </div>
                    </div>

                </div>

            </div>
        </Navbar>
    );
}
