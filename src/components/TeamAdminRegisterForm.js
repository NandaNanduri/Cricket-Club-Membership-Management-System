import React, { useState } from 'react';
import axios from 'axios';

function TeamAdminRegisterForm() {
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
        group: 'A',
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

        // Contact validation
        if (!formData.contact.match(/^7\d{7}$/)) {
            newErrors.contact = 'Contact must start with 7 and be 8 digits long';
        }

        // ID Number validation
        if (!formData.id_num.trim()) {
            newErrors.id_num = 'ID number is required';
        }

        // DOB validation
        if (formData.dob) {
            const dob = new Date(formData.dob);
            const year = dob.getFullYear();
            if (year < 1940 || year > 2018) {
                newErrors.dob = 'Date of birth must be between 1940 and 2018';
            }
        } else {
            newErrors.dob = 'Date of birth is required';
        }

        // Team selection
        if (!formData.team_name) {
            newErrors.team_name = 'Please select a team';
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
            const res = await axios.post('http://127.0.0.1:8000/users/register/team-admin/', payload, {
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
                alert('Error registering team admin');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Team Admin Registration</h2>
                        <p className="mt-2 text-sm text-gray-600">Please fill in the admin details</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    onChange={handleChange}
                                    required
                                    className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="Email"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    onChange={handleChange}
                                    required
                                    className={`mt-1 block w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="Password"
                                />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label htmlFor="fname" className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    name="fname"
                                    onChange={handleChange}
                                    required
                                    className={`mt-1 block w-full border ${errors.fname ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="First Name"
                                />
                                {errors.fname && <p className="text-red-500 text-sm mt-1">{errors.fname}</p>}
                            </div>

                            <div>
                                <label htmlFor="sname" className="block text-sm font-medium text-gray-700">Surname</label>
                                <input
                                    name="sname"
                                    onChange={handleChange}
                                    required
                                    className={`mt-1 block w-full border ${errors.sname ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="Surname"
                                />
                                {errors.sname && <p className="text-red-500 text-sm mt-1">{errors.sname}</p>}
                            </div>

                            <div>
                                <label htmlFor="id_num" className="block text-sm font-medium text-gray-700">ID Number</label>
                                <input
                                    name="id_num"
                                    onChange={handleChange}
                                    required
                                    className={`mt-1 block w-full border ${errors.id_num ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="ID Number"
                                />
                                {errors.id_num && <p className="text-red-500 text-sm mt-1">{errors.id_num}</p>}
                            </div>

                            <div>
                                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
                                <input
                                    name="contact"
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border ${errors.contact ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="Contact"
                                />
                                {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
                            </div>

                            <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input
                                    name="dob"
                                    type="date"
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border ${errors.dob ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                />
                                {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                            </div>

                            <div>
                                <label htmlFor="postal_add" className="block text-sm font-medium text-gray-700">Postal Address</label>
                                <input
                                    name="postal_add"
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border ${errors.postal_add ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="Postal Address"
                                />
                                {errors.postal_add && <p className="text-red-500 text-sm mt-1">{errors.postal_add}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="residential_add" className="block text-sm font-medium text-gray-700">Residential Address</label>
                                <input
                                    name="residential_add"
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border ${errors.residential_add ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="Residential Address"
                                />
                                {errors.residential_add && <p className="text-red-500 text-sm mt-1">{errors.residential_add}</p>}
                            </div>

                            <div>
                                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality</label>
                                <input
                                    name="nationality"
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border ${errors.nationality ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="Nationality"
                                />
                                {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                            </div>

                            <div>
                                <label htmlFor="team_name" className="block text-sm font-medium text-gray-700">Team</label>
                                <select
                                    name="team_name"
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border ${errors.team_name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
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
                                {errors.team_name && <p className="text-red-500 text-sm mt-1">{errors.team_name}</p>}
                            </div>

                            <div>
                                <label htmlFor="group" className="block text-sm font-medium text-gray-700">Group</label>
                                <select
                                    name="group"
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">-- Select Group --</option>
                                    <option value="A">Group A</option>
                                    <option value="B">Group B</option>
                                    <option value="C">Group C</option>
                                    <option value="D">Group D</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="profile_photo" className="block text-sm font-medium text-gray-700">Profile Photo</label>
                                <div className="mt-1 flex items-center">
                                    <input
                                        type="file"
                                        name="profile_photo"
                                        onChange={handleChange}
                                        accept="image/*"
                                        required
                                        className={`py-2 px-3 border ${errors.profile_photo ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                    />
                                </div>
                                {errors.profile_photo && <p className="text-red-500 text-sm mt-1">{errors.profile_photo}</p>}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Register Team Admin
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default TeamAdminRegisterForm;