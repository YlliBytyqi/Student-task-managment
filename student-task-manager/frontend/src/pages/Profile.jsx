import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Profile() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) {
            const parsed = JSON.parse(u);
            setUser(parsed);
            setFullName(parsed.fullName || '');
            setEmail(parsed.email || '');
        }
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user) return;

        try {
            const res = await api.put(`/auth/users/${user.id}`, { fullName, email });
            
            const updatedProfile = { ...user, ...res.data.updatedUser };
            localStorage.setItem('user', JSON.stringify(updatedProfile));
            setUser(updatedProfile);
            setSuccess("Profili u përditësua me sukses!");
        } catch (err) {
            setError(err.response?.data?.error || "Përditësimi dështoi.");
        }
    };

    return (
        <Navbar>
            <div className="max-w-3xl">
                <h1 className="text-4xl font-extrabold text-[#0f172a] mb-8 tracking-tight">Your Profile</h1>
                
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Personal Information</h2>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl">{error}</div>}
                        {success && <div className="text-emerald-500 text-sm font-medium bg-emerald-50 p-3 rounded-xl">{success}</div>}
                        
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Full Name</label>
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Role</label>
                            <input 
                                type="text" 
                                value={user?.role?.toUpperCase() || ''}
                                disabled
                                className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-400 cursor-not-allowed"
                            />
                            <p className="text-[10px] uppercase font-bold text-slate-400 mt-2 ml-1">Roles cannot be changed manually.</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button type="submit" className="w-auto flex items-center justify-center gap-2 bg-[#0f172a] text-white py-3.5 px-8 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Navbar>
    );
}
