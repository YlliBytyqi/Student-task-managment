import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Users as UsersIcon } from 'lucide-react';

export default function Users() {
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Personi B do e përdorë këtë endpoint shpesh për të ditur se kujt t'i kalojë tasket
        api.get('/auth/users')
            .then(res => {
                setUsersList(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Gabim në tërheqjen e përdoruesve:", err);
                setError("Nuk mund të ngarkonim përdoruesit.");
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
                        <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight">System Users</h1>
                        <p className="text-slate-500 mt-2 font-medium max-w-2xl">
                            Kjo faqe liston të gjithë përdoruesit e regjistruar në sistem. 
                            <strong> Pse shërben?</strong> Personi B (Menaxheri i organizatës) do të përdorë këtë listë për të parë ID-të e sakta dhe emrat e personave, në mënyrë që t'i caktojë si përgjegjës tek task-et e ndryshme në të ardhmen.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mt-10">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500 font-bold">Duke u ngarkuar...</div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500 font-bold">{error}</div>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-100 text-left">
                            <thead className="bg-[#f8fafc]">
                                <tr>
                                    <th className="py-4 pl-8 pr-3 text-[11px] uppercase tracking-wider font-bold text-slate-400">User ID</th>
                                    <th className="px-3 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">Full Name</th>
                                    <th className="px-3 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">Email Address</th>
                                    <th className="px-3 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">Role</th>
                                    <th className="px-3 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">Joined</th>
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
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10 uppercase tracking-widest">
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
