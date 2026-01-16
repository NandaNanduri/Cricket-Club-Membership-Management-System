import React, { useState } from "react";
import axios from "axios";

const BecomePlayerForm = () => {
    const [teamName, setTeamName] = useState("");
    const [group, setGroup] = useState("");
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [isTeamAdmin, setIsTeamAdmin] = useState(false);
    const [message, setMessage] = useState("");

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) {
            throw new Error("No refresh token available. Please log in again.");
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/token/refresh/",
                { refresh: refreshToken },
                { headers: { "Content-Type": "application/json" } }
            );
            localStorage.setItem("token", response.data.access);
            return response.data.access;
        } catch (error) {
            throw new Error("Failed to refresh token. Please log in again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!teamName || !group || !profilePhoto) {
            setMessage("All fields are required.");
            return;
        }

        const formData = new FormData();
        formData.append("team_name", teamName);
        formData.append("group", group);
        formData.append("profile_photo", profilePhoto);
        formData.append("is_team_admin", isTeamAdmin);

        try {
            let token = localStorage.getItem("token");
            if (!token) {
                setMessage("You must be logged in to submit this form.");
                return;
            }

            const makeRequest = async (accessToken) => {
                return axios.post("http://127.0.0.1:8000/users/become-player/", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            };

            let response = await makeRequest(token);
            setMessage(response.data.message || "Successfully registered as a player.");
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    const newToken = await refreshAccessToken();
                    const retryResponse = await axios.post(
                        "http://127.0.0.1:8000/users/become-player/",
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                                Authorization: `Bearer ${newToken}`,
                            },
                        }
                    );
                    setMessage(retryResponse.data.message || "Successfully registered as a player.");
                } catch (refreshError) {
                    setMessage(refreshError.message);
                }
            } else if (error.response && error.response.data) {
                setMessage(JSON.stringify(error.response.data));
            } else {
                setMessage("Something went wrong. Try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Become a Player / Team Admin</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                            <select
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">-- Select Team --</option>
                                <option value="Thunder Cats">Thunder Cats</option>
                                <option value="Black Mambas 1">Black Mambas 1</option>
                                <option value="Forvis Mazars A">Forvis Mazars A</option>
                                <option value="Motozone">Motozone</option>
                                <option value="Lobatse Cricket Club">Lobatse Cricket Club</option>
                                <option value="Pioneers">Pioneers</option>
                                <option value="United Gymkhana">United Gymkhana</option>
                                <option value="All Stars">All Stars</option>
                                <option value="SH Tyre City">SH Tyre City</option>
                                <option value="Gujarat Strikers B">Gujarat Strikers B</option>
                                <option value="Phoenix">Phoenix</option>
                                <option value="Ceylon Cricket Club">Ceylon Cricket Club</option>
                                <option value="DJ Devils">DJ Devils</option>
                                <option value="BD Cricket Club">BD Cricket Club</option>
                                <option value="SKY XI">SKY XI</option>
                                <option value="Cubs XI">Cubs XI</option>
                                <option value="Nawabz Boys">Nawabz Boys</option>
                                <option value="Auto World">Auto World</option>
                                <option value="FD Titans">FD Titans</option>
                                <option value="Pulse Cricket Stallion">Pulse Cricket Stallion</option>
                                <option value="Elite Sports">Elite Sports</option>
                                <option value="Excel Strikers">Excel Strikers</option>
                                <option value="PWC">PWC</option>
                                <option value="Black Mambas 2">Black Mambas 2</option>
                                <option value="Moremi Kings (Chennai)">Moremi Kings (Chennai)</option>
                                <option value="Forvis Mazars Juniors">Forvis Mazars Juniors</option>
                                <option value="Sefalana">Sefalana</option>
                                <option value="Friends">Friends</option>
                                <option value="A-One">A-One</option>
                                <option value="Cheetas">Cheetas</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                            <select
                                value={group}
                                onChange={(e) => setGroup(e.target.value)}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select Group</option>
                                <option value="A">Group A</option>
                                <option value="B">Group B</option>
                                <option value="C">Group C</option>
                                <option value="D">Group D</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                            <div className="mt-1 flex items-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProfilePhoto(e.target.files[0])}
                                    required
                                    className="py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isTeamAdmin}
                                onChange={(e) => setIsTeamAdmin(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">Become a Team Admin</label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Submit
                            </button>
                        </div>

                        {message && (
                            <div className={`mt-4 text-sm ${message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}`}>
                                {message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BecomePlayerForm;