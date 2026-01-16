import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UmpireDashboard = () => {
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scanResult, setScanResult] = useState(null);
    const [scanError, setScanError] = useState('');
    const [teamPlayers, setTeamPlayers] = useState([]);
    const [receiptFiles, setReceiptFiles] = useState({});
    const [receiptNotes, setReceiptNotes] = useState({});
    const [message, setMessage] = useState("");

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

        const fetchTeamPlayers = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://127.0.0.1:8000/users/team-players/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setTeamPlayers(res.data);
            } catch (err) {
                console.error("Failed to fetch team players:", err);
            }
        };

        fetchQRCode();
        fetchTeamPlayers();
    }, []);

    const handleQRScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('qr_code', file);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://127.0.0.1:8000/users/scan-qr/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            setScanResult(res.data);
            setScanError('');
        } catch (err) {
            console.error(err);
            setScanError('QR scan failed or QR code is invalid.');
            setScanResult(null);
        }
    };

    const handleFileChange = (playerId, file) => {
        setReceiptFiles({ ...receiptFiles, [playerId]: file });
    };

    const handleNoteChange = (playerId, note) => {
        setReceiptNotes({ ...receiptNotes, [playerId]: note });
    };

    const handleUpload = async (playerId) => {
        const file = receiptFiles[playerId];
        const note = receiptNotes[playerId] || "";

        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("player", playerId);
        formData.append("note", note);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://127.0.0.1:8000/users/receipts/upload/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            setMessage(`Receipt uploaded for player ${playerId}`);
            setReceiptFiles(prev => ({ ...prev, [playerId]: null }));
            setReceiptNotes(prev => ({ ...prev, [playerId]: "" }));
        } catch (error) {
            console.error("Upload failed:", error);
            setMessage("Upload failed.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Umpire Dashboard</h1>
                <p className="text-gray-600">Manage player verification and team administration</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* QR Code Scanner Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">QR Code Scanner</h2>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-gray-700 mb-2 block">Upload QR Code Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleQRScan}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                            />
                        </label>

                        {scanError && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{scanError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {scanResult && (
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <h3 className="text-lg font-medium text-gray-800 mb-3">Player Verification</h3>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={scanResult.profile_photo_url}
                                            alt="Profile"
                                            className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-800 text-sm">
                                            <span className="font-medium">Name:</span> {scanResult.fname} {scanResult.sname}
                                        </p>
                                        <p className="text-gray-800 text-sm">
                                            <span className="font-medium">Team:</span> {scanResult.team_name}
                                        </p>
                                        <p className="text-gray-800 text-sm">
                                            <span className="font-medium">Status:</span>
                                            <span className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scanResult.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {scanResult.payment_status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Your QR Code Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your QR Code</h2>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : qrCodeUrl ? (
                        <div className="flex flex-col items-center">
                            <img
                                src={qrCodeUrl}
                                alt="Player QR Code"
                                className="w-48 h-48 border-4 border-blue-100 rounded-lg p-2"
                            />
                            <p className="mt-3 text-gray-600 text-center">Present this QR code for player verification at matches</p>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">No player QR code available. Register as a player to get one.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Team Members Section */}
            {teamPlayers.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Team Members</h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {teamPlayers.length} players
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {teamPlayers.map((player, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-medium">{player.fname.charAt(0)}{player.sname.charAt(0)}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{player.fname} {player.sname}</div>
                                                    <div className="text-sm text-gray-500">{player.nationality}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{player.id_num}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{player.contact}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${player.is_team_admin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                {player.is_team_admin ? 'Admin' : 'Player'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <input
                                                    type="file"
                                                    accept="application/pdf,image/*"
                                                    onChange={(e) => handleFileChange(player.id, e.target.files[0])}
                                                    className="text-sm"
                                                    id={`file-upload-${player.id}`}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Note"
                                                    value={receiptNotes[player.id] || ""}
                                                    onChange={(e) => handleNoteChange(player.id, e.target.value)}
                                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleUpload(player.id)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                                            >
                                                Upload
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {message && (
                        <div className={`mt-4 p-4 rounded-md ${message.includes("failed") ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {message.includes("failed") ? (
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm">{message}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Player Registration CTA */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Not registered as a player?</h3>
                    <p className="mt-1 text-sm text-gray-500">Register now to participate in matches and access player features.</p>
                    <div className="mt-6">
                        <Link
                            to="/register-as-player"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Register as Player
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UmpireDashboard;