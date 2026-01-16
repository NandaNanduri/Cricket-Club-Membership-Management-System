import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('http://127.0.0.1:8000/users/login/', {
                email,
                password,
            });

            const { access, user } = res.data;
            localStorage.setItem('token', res.data.access);
            localStorage.setItem('userRole', JSON.stringify(res.data.user));

            alert(`Login successful! Welcome ${user.email || user.role}`);

            switch (user.role) {
                case 'player':
                    window.location.href = '/dashboard/player';
                    break;
                case 'team_admin':
                    window.location.href = '/dashboard/team-admin';
                    break;
                case 'club_admin':
                    window.location.href = '/dashboard/club-admin';
                    break;
                case 'umpire':
                    window.location.href = '/dashboard/umpire';
                    break;
                default:
                    window.location.href = '/dashboard/member';
                    break;
            }
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            alert('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/30">
                <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Sign In</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-md bg-white/70 placeholder-gray-500 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-md bg-white/70 placeholder-gray-500 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
