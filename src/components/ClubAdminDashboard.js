import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ClubAdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [selectedRole, setSelectedRole] = useState('all');
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [receipts, setReceipts] = useState([]);
    const [loadingReceipts, setLoadingReceipts] = useState(true);

    // Sort receipts by group and then by team name
    const sortedReceipts = [...receipts].sort((a, b) => {
        if (a.group < b.group) return -1;
        if (a.group > b.group) return 1;
        if (a.team_name < b.team_name) return -1;
        if (a.team_name > b.team_name) return 1;
        return 0;
    });

    // Group receipts by group and then by team
    const groupedReceipts = sortedReceipts.reduce((acc, receipt) => {
        const groupKey = receipt.group || 'No Group';
        const teamKey = receipt.team_name || 'No Team';

        if (!acc[groupKey]) {
            acc[groupKey] = {};
        }
        if (!acc[groupKey][teamKey]) {
            acc[groupKey][teamKey] = [];
        }

        acc[groupKey][teamKey].push(receipt);
        return acc;
    }, {});

    // Fetch the QR code
    useEffect(() => {
        const fetchQRCode = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://127.0.0.1:8000/users/player/qr-code/", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.qr_code) {
                    setQrCodeUrl(response.data.qr_code);
                }
            } catch (error) {
                console.error("Error fetching QR Code:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQRCode();
    }, []);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://127.0.0.1:8000/users/all-users/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(res.data);
            } catch (err) {
                console.error('Error fetching users:', err.response ? err.response.data : err.message);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    // Fetch receipts
    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://127.0.0.1:8000/users/receipts/all/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReceipts(res.data);
            } catch (err) {
                console.error('Error fetching receipts:', err.response ? err.response.data : err.message);
            } finally {
                setLoadingReceipts(false);
            }
        };
        fetchReceipts();
    }, []);

    const filteredUsers = selectedRole === 'all' ? users : users.filter(user => user.role === selectedRole);

    const handleVerifyReceipt = async (receiptId) => {
        if (!window.confirm('Are you sure you want to verify this receipt?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `http://127.0.0.1:8000/users/receipts/verify/${receiptId}/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setReceipts(prevReceipts =>
                prevReceipts.map(r => (r.id === res.data.id ? res.data : r))
            );
            alert('Receipt verified successfully!');
        } catch (err) {
            console.error('Error verifying receipt:', err.response ? err.response.data : err.message);
            alert('Failed to verify receipt.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Registration Links Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Registration Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Link
                        to="/register/team-admin"
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-center"
                    >
                        Team Admin
                    </Link>
                    <Link
                        to="/register/club-admin"
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition text-center"
                    >
                        Club Admin
                    </Link>
                    <Link
                        to="/register/umpire"
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-center"
                    >
                        Umpire
                    </Link>
                    <Link
                        to="/register/member"
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-center"
                    >
                        Member
                    </Link>
                    <Link
                        to="/register/player"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-center"
                    >
                        Player
                    </Link>
                </div>
            </div>

            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, Club Admin!</h1>
                <p className="text-gray-600">You can view all teams, verify receipts, and manage QR codes.</p>
            </div>

            {/* QR Code Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                {loading ? (
                    <p className="text-gray-600">Loading QR code information...</p>
                ) : qrCodeUrl ? (
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-semibold mb-4">Your Player QR Code</h2>
                        <img src={qrCodeUrl} alt="Player QR Code" className="w-48 h-48 mb-2" />
                        <p className="text-gray-600">Present this code for player verification</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Player Registration</h2>
                        <p className="text-gray-600 mb-4">No player QR code available</p>
                        <Link
                            to="/register-as-player"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
                        >
                            Register as Player
                        </Link>
                    </div>
                )}
            </div>

            {/* Users Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Users by Role</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'club_admin', 'team_admin', 'player', 'umpire', 'member'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${selectedRole === role
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {role === 'all' ? 'All' : role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                    ))}
                </div>

                {loadingUsers ? (
                    <p className="text-gray-600">Loading users...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['First Name', 'Surname', 'Role', 'ID Number', 'Contact', 'DOB', 'Nationality', 'Postal Address', 'Residential Address', 'Team Name'].map((header) => (
                                        <th
                                            key={header}
                                            scope="col"
                                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                                            No users found for this role.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <tr key={index}>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{user.fname}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{user.sname}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{user.id_num}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{user.contact}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.dob ? new Date(user.dob).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{user.nationality}</td>
                                            <td className="px-3 py-4 text-sm text-gray-900">
                                                {user.postal_add ? (
                                                    <div className="max-w-xs truncate" title={user.postal_add}>
                                                        {user.postal_add}
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-900">
                                                {user.residential_add ? (
                                                    <div className="max-w-xs truncate" title={user.residential_add}>
                                                        {user.residential_add}
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{user.team_name || '—'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Receipts Section - Now Grouped by Group first, then Team */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Receipts by Group and Team</h2>
                {loadingReceipts ? (
                    <p className="text-gray-600">Loading receipts...</p>
                ) : Object.keys(groupedReceipts).length === 0 ? (
                    <p className="text-gray-600">No receipts available.</p>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedReceipts).map(([groupName, teams]) => (
                            <div key={groupName} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-blue-800">Group {groupName}</h3>
                                </div>
                                {Object.entries(teams).map(([teamName, groupReceipts]) => (
                                    <div key={`${groupName}-${teamName}`} className="p-4 border-b border-gray-200 last:border-b-0">
                                        <h4 className="text-md font-medium text-gray-700 mb-3">{teamName}</h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {groupReceipts.map((receipt) => (
                                                        <tr key={receipt.id}>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{receipt.player_name}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{receipt.note || '—'}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{receipt.uploaded_by_name}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                                                                <a
                                                                    href={`http://127.0.0.1:8000${receipt.file}`}
                                                                    download={receipt.file.split('/').pop()}
                                                                    rel="noopener noreferrer"
                                                                    className="hover:underline"
                                                                >
                                                                    Download
                                                                </a>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                                {receipt.is_verified ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        Verified
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleVerifyReceipt(receipt.id)}
                                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                                    >
                                                                        Verify
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClubAdminDashboard;