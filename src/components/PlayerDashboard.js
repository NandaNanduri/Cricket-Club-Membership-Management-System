import { useEffect, useState } from "react";
import axios from "axios";

const PlayerDashboard = () => {
    const [qrCodeUrl, setQrCodeUrl] = useState(null);

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
            }
        };

        fetchQRCode();
    }, []);

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-xl mt-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome, Player!</h1>
            <p className="text-gray-600 mb-6">
                You can upload receipts, view match schedules, and manage your profile.
            </p>

            {qrCodeUrl ? (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Your QR Code</h2>
                    <img
                        src={qrCodeUrl}
                        alt="Your QR Code"
                        className="w-48 h-48 mx-auto border border-gray-300 p-2 bg-white rounded"
                    />
                </div>
            ) : (
                <p className="text-red-500 font-medium">No QR Code available yet.</p>
            )}
        </div>
    );
};

export default PlayerDashboard;
