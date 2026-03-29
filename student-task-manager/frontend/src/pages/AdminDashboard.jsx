import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Users as UsersIcon, LayoutDashboard, Trash2, Edit2, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'workspaces'
    const [usersList, setUsersList] = useState([]);
    const [workspacesList, setWorkspacesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
            setError('You are not logged in.');
            setLoading(false);
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);

        if (parsedUser.role !== 'admin') {
            setError('Only admins can access this page.');
            setLoading(false);
            return;
        }

        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [usersRes, workspacesRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/workspaces/all')
            ]);
            setUsersList(usersRes.data);
            setWorkspacesList(workspacesRes.data);
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError(err.response?.data?.error || 'Could not load admin data.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (user.id === currentUser.id) {
            alert('You cannot delete your own account.');
            return;
        }
        if (!window.confirm(`Are you sure you want to delete the user "${user.fullName}"? This action cannot be undone and will delete all their owned workspaces and tasks.`)) {
            return;
        }

        try {
            await api.delete(`/auth/users/${user.id}`);
            setUsersList(usersList.filter(u => u.id !== user.id));
            // Reload workspaces in case the deleted user owned any
            const workspacesRes = await api.get('/workspaces/all');
            setWorkspacesList(workspacesRes.data);
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.response?.data?.error || 'Failed to delete user.');
        }
    };

    const handleToggleRole = async (user) => {
        if (user.id === currentUser.id) {
            alert('You cannot change your own role.');
            return;
        }
        
        const newRole = user.role === 'admin' ? 'student' : 'admin';
        if (!window.confirm(`Change role of "${user.fullName}" to ${newRole.toUpperCase()}?`)) {
            return;
        }

        try {
            const res = await api.put(`/auth/users/${user.id}/role`, { role: newRole });
            setUsersList(usersList.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Error updating role:', err);
            alert(err.response?.data?.error || 'Failed to update user role.');
        }
    };

    const handleDeleteWorkspace = async (ws) => {
        if (!window.confirm(`Are you sure you want to delete the workspace "${ws.name}"? This will delete all associated tasks and members.`)) {
            return;
        }

        try {
            await api.delete(`/workspaces/${ws.id}`);
            setWorkspacesList(workspacesList.filter(w => w.id !== ws.id));
        } catch (err) {
            console.error('Error deleting workspace:', err);
            alert(err.response?.data?.error || 'Failed to delete workspace.');
        }
    };

    return (
        <Navbar>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-[#0f172a] p-3 rounded-2xl shadow-lg">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium max-w-2xl">
                            Manage all system users and workspaces.
                        </p>
                    </div>
                </div>

                {error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold border border-red-100 mb-8">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="flex space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit mb-6">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                    activeTab === 'users'
                                        ? 'bg-[#0f172a] text-white shadow-md'
                                        : 'text-slate-500 hover:text-[#0f172a] hover:bg-slate-50'
                                }`}
                            >
                                <UsersIcon className="w-4 h-4" />
                                All Users
                            </button>
                            <button
                                onClick={() => setActiveTab('workspaces')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                    activeTab === 'workspaces'
                                        ? 'bg-[#0f172a] text-white shadow-md'
                                        : 'text-slate-500 hover:text-[#0f172a] hover:bg-slate-50'
                                }`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                All Workspaces
                            </button>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                            {loading ? (
                                <div className="p-16 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0f172a] rounded-full animate-spin"></div>
                                    <p className="text-slate-500 font-bold animate-pulse">Loading system data...</p>
                                </div>
                            ) : activeTab === 'users' ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-100 text-left">
                                        <thead className="bg-[#f8fafc]">
                                            <tr>
                                                <th className="py-4 pl-8 pr-3 text-[11px] uppercase tracking-wider font-bold text-slate-400">User</th>
                                                <th className="px-3 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">Role</th>
                                                <th className="px-3 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">Joined Date</th>
                                                <th className="px-3 py-4 pr-8 text-[11px] uppercase tracking-wider font-bold text-slate-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {usersList.map((u) => (
                                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="whitespace-nowrap py-5 pl-8 pr-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                                                {u.fullName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-[#0f172a]">{u.fullName}</div>
                                                                <div className="text-xs font-medium text-slate-500">{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                                            u.role === 'admin'
                                                                ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10'
                                                                : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10'
                                                        }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm font-medium text-slate-500">
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 pr-8 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleToggleRole(u)}
                                                                disabled={u.id === currentUser.id}
                                                                className="p-2 bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Change Role"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u)}
                                                                disabled={u.id === currentUser.id}
                                                                className="p-2 bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {usersList.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="py-8 text-center text-slate-500 font-medium">No users found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-100 text-left">
                                        <thead className="bg-[#f8fafc]">
                                            <tr>
                                                <th className="py-4 pl-8 pr-3 text-[11px] uppercase tracking-wider font-bold text-slate-400">Workspace</th>
                                                <th className="px-3 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">Owner</th>
                                                <th className="px-3 py-4 pr-8 text-[11px] uppercase tracking-wider font-bold text-slate-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {workspacesList.map((ws) => (
                                                <tr key={ws.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="whitespace-nowrap py-5 pl-8 pr-3">
                                                        <div className="text-sm font-bold text-[#0f172a]">{ws.name}</div>
                                                        {ws.description && (
                                                            <div className="text-xs font-medium text-slate-500 truncate max-w-xs">{ws.description}</div>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5">
                                                        <div className="text-sm font-bold text-slate-700">{ws.ownerName || 'Unknown'}</div>
                                                        <div className="text-xs font-medium text-slate-500">{ws.ownerEmail || 'No email'}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 pr-8 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleDeleteWorkspace(ws)}
                                                                className="p-2 bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                                title="Delete Workspace"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {workspacesList.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="py-8 text-center text-slate-500 font-medium">No workspaces found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Navbar>
    );
}
