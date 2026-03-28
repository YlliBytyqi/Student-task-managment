import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Users() {
    const { logout, user } = useContext(AuthContext);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Personi B do e përdorë këtë endpoint shpesh
        axios.get('http://localhost:5000/api/auth/users')
            .then(res => {
                setUsersList(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Gabim në tërheqjen e përdoruesve:", err);
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* NavBar ose Header */}
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Task Manager</h1>
                        <p className="text-sm text-gray-500 mt-1">Mirësevjen, {user?.fullName}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-gray-50"
                    >
                        Dil (Log Out)
                    </button>
                </div>
            </header>

            <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Të gjithë Përdoruesit
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Lista e plotë e përdoruesve në sistem. Kjo sasi përmban rolet dhe ID-të thelbësore (Identity - Person A).
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center my-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <div className="mt-8 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-300 text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3.5 pl-4 pr-3 text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
                                                <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">Emri i Plotë</th>
                                                <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">Email</th>
                                                <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">Roli</th>
                                                <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">Krijuar më</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {usersList.map((u) => (
                                                <tr key={u.id} className="hover:bg-gray-50">
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                        #{u.id}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <div className="font-medium text-gray-900">{u.fullName}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{u.email}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 uppercase">
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {new Date(u.createdAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
