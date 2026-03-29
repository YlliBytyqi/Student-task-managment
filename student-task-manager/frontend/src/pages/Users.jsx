import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Users as UsersIcon } from 'lucide-react';

export default function Users() {
    const [usersList, setUsersList] = useState([]);
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

        api.get('/auth/users')
            .then((res) => {
                setUsersList(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching users:', err);
                setError(err.response?.data?.error || 'Could not load users.');
                setLoading(false);
            });
    }, []);

    return (
        <Navbar>
            <div className="max-w-6xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#0f172a] p-3 rounded-2xl">
                        <UsersIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight">
                            System Users
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium max-w-2xl">
                            Admin view of all registered users in the system.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mt-10">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500 font-bold">
                            Loading...
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500 font-bold">
                            {error}
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-100 text-left">
                            <thead className="bg-[#f8fafc]">
                                <tr>
                                    <th className="py-4 pl-8 pr-3 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                                        User ID
                                    </th>
                                    <th className="px-3 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                                        Full Name
                                    </th>
                                    <th className="px-3 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                                        Email Address
                                    </th>
                                    <th className="px-3 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                                        Role
                                    </th>
                                    <th className="px-3 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {usersList.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="whitespace-nowrap py-5 pl-8 pr-3 text-sm font-bold text-[#0f172a]">
                                            #{u.id}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm font-bold text-slate-700">
                                            {u.fullName}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm font-medium text-slate-500">
                                            {u.email}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm">
                                            <span
                                                className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                                    u.role === 'admin'
                                                        ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10'
                                                        : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10'
                                                }`}
                                            >
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-xs font-semibold text-slate-400">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </Navbar>
    );
}