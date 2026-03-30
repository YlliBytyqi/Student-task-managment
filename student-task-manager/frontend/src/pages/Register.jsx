import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import api from '../services/api';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/register', { fullName, email, password });
            setSuccess(res.data.message || "U regjistruat me sukses!");
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.error || "Gabim gjatë regjistrimit");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[2rem] border border-slate-100 flex flex-col items-center">
                    
                    {}
                    <div className="bg-[#0f172a] p-3 rounded-2xl mb-6">
                        <LayoutDashboard className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-[#0f172a] mb-2">Create an Account</h2>
                    <p className="text-sm text-slate-500 mb-8">Sign up to manage your workspaces.</p>

                    <form className="w-full space-y-5" onSubmit={handleRegister}>
                        {error && <div className="text-red-600 text-sm font-medium text-center bg-red-50 py-2 rounded-lg">{error}</div>}
                        {success && <div className="text-green-600 text-sm font-medium text-center bg-green-50 py-2 rounded-lg">{success}</div>}
                        
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Student Studenti"
                                className="block w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="student@university.edu"
                                className="block w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="block w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-xl bg-[#0f172a] py-3.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
