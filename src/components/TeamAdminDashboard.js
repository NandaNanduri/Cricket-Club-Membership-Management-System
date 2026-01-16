import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const TeamAdminDashboard = () => {
    const [teamPlayers, setTeamPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [receiptFiles, setReceiptFiles] = useState({});
    const [receiptNotes, setReceiptNotes] = useState({});
    const [message, setMessage] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState(null);

    useEffect(() => {
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
            } finally {
                setLoading(false);
            }
        };

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
            }
        };

        fetchTeamPlayers();
        fetchQRCode();
    }, []);

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
        <div className="container mx-auto px-4 py-8">
            {/* Player Registration Link Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Player Registration Link</h2>
                <p className="text-gray-600 mb-4">Share this link with players to register for your team:</p>
                <Link
                    to="/register/player"
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-200"
                >
                    Player Registration
                </Link>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Team Members</h2>

            {qrCodeUrl && (
                <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">Your Team Admin QR Code</h3>
                    <img
                        src={qrCodeUrl}
                        alt="Team Admin QR Code"
                        className="mx-auto"
                        width={200}
                        height={200}
                    />
                    <p className="text-center mt-2 text-gray-600">This QR code verifies your team admin status</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <p className="text-gray-600">Loading...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="py-3 px-4 text-left">First Name</th>
                                <th className="py-3 px-4 text-left">Surname</th>
                                <th className="py-3 px-4 text-left">ID</th>
                                <th className="py-3 px-4 text-left">Contact</th>
                                <th className="py-3 px-4 text-left">DOB</th>
                                <th className="py-3 px-4 text-left">Nationality</th>
                                <th className="py-3 px-4 text-left">Group</th>
                                <th className="py-3 px-4 text-left">Team Admin</th>
                                <th className="py-3 px-4 text-left">Receipt File</th>
                                <th className="py-3 px-4 text-left">Special Note</th>
                                <th className="py-3 px-4 text-left">Upload Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {teamPlayers.map((player, i) => (
                                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                    <td className="py-3 px-4">{player.fname}</td>
                                    <td className="py-3 px-4">{player.sname}</td>
                                    <td className="py-3 px-4">{player.id_num}</td>
                                    <td className="py-3 px-4">{player.contact}</td>
                                    <td className="py-3 px-4">{player.dob}</td>
                                    <td className="py-3 px-4">{player.nationality}</td>
                                    <td className="py-3 px-4">{player.group}</td>
                                    <td className="py-3 px-4">{player.is_team_admin ? "Yes" : "No"}</td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="file"
                                            accept="application/pdf,image/*"
                                            onChange={(e) =>
                                                handleFileChange(player.id, e.target.files[0])
                                            }
                                            className="text-sm"
                                        />
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            placeholder="Note (e.g. individual, lump sum)"
                                            value={receiptNotes[player.id] || ""}
                                            onChange={(e) => handleNoteChange(player.id, e.target.value)}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => handleUpload(player.id)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-200"
                                        >
                                            Upload
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {message && (
                <div className={`mt-4 p-3 rounded ${message.includes("failed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default TeamAdminDashboard;