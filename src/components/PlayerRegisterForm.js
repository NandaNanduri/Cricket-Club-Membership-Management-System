import React, { useState } from 'react';
import axios from 'axios';

function PlayerRegisterForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fname: '',
        sname: '',
        id_num: '',
        contact: '',
        dob: '',
        postal_add: '',
        residential_add: '',
        nationality: '',
        team_name: '',
        group: '',
        profile_photo: null,
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        // Email format
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = 'Enter a valid email address';
        }

        // First and last name
        if (!formData.fname.match(/^[A-Za-z]+$/)) {
            newErrors.fname = 'First name should contain only letters';
        }
        if (!formData.sname.match(/^[A-Za-z]+$/)) {
            newErrors.sname = 'Surname should contain only letters';
        }

        // Contact
        if (!formData.contact.match(/^7\d{7}$/)) {
            newErrors.contact = 'Contact must start with 7 and be 8 digits long';
        }

        // ID Number (assuming numbers or alphanumeric allowed)
        if (!formData.id_num.trim()) {
            newErrors.id_num = 'ID number is required';
        }

        // DOB range
        const dob = new Date(formData.dob);
        const year = dob.getFullYear();
        if (!formData.dob || year < 1940 || year > 2018) {
            newErrors.dob = 'Date of birth must be between 1940 and 2018';
        }

        // Profile photo
        if (!formData.profile_photo) {
            newErrors.profile_photo = 'Profile photo is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = e => {
        const { name, value, type, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!validate()) return;

        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            payload.append(key, value);
        });

        try {
            const res = await axios.post('http://127.0.0.1:8000/users/register/player/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert(res.data.message);
        } catch (err) {
            console.error(err);

            if (err.response?.data) {
                const serverErrors = {};
                if (err.response.data.email?.[0]?.includes('already exists')) {
                    serverErrors.email = 'Email already exists';
                }
                if (err.response.data.id_num?.[0]?.includes('already exists')) {
                    serverErrors.id_num = 'ID number already exists';
                }
                setErrors(serverErrors);
            } else {
                alert('Error registering player');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Player Registration</h2>
                        <p className="mt-2 text-sm text-gray-600">Please fill in your details to register</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                    placeholder='Email'
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                    placeholder='Password'
                                />
                            </div>

                            {/* FNAME */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    name="fname"
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                    placeholder='First Name'
                                />
                                {errors.fname && <p className="text-red-500 text-sm mt-1">{errors.fname}</p>}
                            </div>

                            {/* SNAME */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Surname</label>
                                <input
                                    type="text"
                                    name="sname"
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                    placeholder='Surname'
                                />
                                {errors.sname && <p className="text-red-500 text-sm mt-1">{errors.sname}</p>}
                            </div>

                            {/* ID NUMBER */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID Number</label>
                                <input
                                    type="text"
                                    name="id_num"
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                    placeholder='ID Number'
                                />
                                {errors.id_num && <p className="text-red-500 text-sm mt-1">{errors.id_num}</p>}
                            </div>

                            {/* CONTACT */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact</label>
                                <input
                                    type="text"
                                    name="contact"
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                    placeholder='Contact'
                                />
                                {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
                            </div>

                            {/* DOB */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                />
                                {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                            </div>

                            {/* POSTAL ADDRESS */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Postal Address</label>
                                <input
                                    type="text"
                                    name="postal_add"
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                    placeholder='Postal Address'
                                />
                            </div>

                            {/* RESIDENTIAL ADDRESS */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Residential Address</label>
                                <input
                                    type="text"
                                    name="residential_add"
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                    placeholder='Residential Address'
                                />
                            </div>

                            {/* NATIONALITY */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nationality</label>
                                <input
                                    type="text"
                                    name="nationality"
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                    placeholder='Nationality'
                                />
                            </div>

                            {/* TEAM */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Team</label>
                                <select
                                    name="team_name"
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
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

                            {/* GROUP */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Group</label>
                                <select
                                    name="group"
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                >
                                    <option value="">-- Select Group --</option>
                                    <option value="A">Group A</option>
                                    <option value="B">Group B</option>
                                    <option value="C">Group C</option>
                                    <option value="D">Group D</option>
                                </select>
                            </div>

                            {/* PROFILE PHOTO */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                                <input
                                    type="file"
                                    name="profile_photo"
                                    accept="image/*"
                                    onChange={handleChange}
                                    required
                                    className="mt-1"
                                />
                                {errors.profile_photo && <p className="text-red-500 text-sm mt-1">{errors.profile_photo}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
                        >
                            Register as Player
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PlayerRegisterForm;
