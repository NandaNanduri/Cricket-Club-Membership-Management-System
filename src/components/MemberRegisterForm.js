import React, { useState } from 'react';
import axios from 'axios';

function MemberRegisterForm() {
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
        nationality: ''
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        // Email format
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = 'Enter a valid email address';
        }

        // Password strength (minimum 8 characters)
        if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!validate()) return;

        try {
            const payload = {
                ...formData,
                dob: formData.dob && !isNaN(new Date(formData.dob)) ? new Date(formData.dob).toISOString() : null,
            };

            const res = await axios.post('http://127.0.0.1:8000/users/register/member/', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            alert(res.data.message);
        } catch (err) {
            console.error("Registration error:", err.response?.data || err.message);

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
                alert('Error registering member');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Member Registration</h2>
                        <p className="mt-2 text-sm text-gray-600">Please fill in your details to register as a member</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
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
                                    type="password"
                                    name="password"
                                    onChange={handleChange}
                                    required
                                    className={`mt-1 block w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="Password"
                                />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="fname" className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
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
                                        type="text"
                                        name="sname"
                                        onChange={handleChange}
                                        required
                                        className={`mt-1 block w-full border ${errors.sname ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder="Surname"
                                    />
                                    {errors.sname && <p className="text-red-500 text-sm mt-1">{errors.sname}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="id_num" className="block text-sm font-medium text-gray-700">ID Number</label>
                                <input
                                    type="text"
                                    name="id_num"
                                    onChange={handleChange}
                                    required
                                    className={`mt-1 block w-full border ${errors.id_num ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="ID Number"
                                />
                                {errors.id_num && <p className="text-red-500 text-sm mt-1">{errors.id_num}</p>}
                            </div>

                            <div>
                                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact Number</label>
                                <input
                                    type="text"
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
                                    type="date"
                                    name="dob"
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border ${errors.dob ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                />
                                {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                            </div>

                            <div>
                                <label htmlFor="postal_add" className="block text-sm font-medium text-gray-700">Postal Address</label>
                                <input
                                    type="text"
                                    name="postal_add"
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border ${errors.postal_add ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="Postal Address"
                                />
                                {errors.postal_add && <p className="text-red-500 text-sm mt-1">{errors.postal_add}</p>}
                            </div>

                            <div>
                                <label htmlFor="residential_add" className="block text-sm font-medium text-gray-700">Residential Address</label>
                                <input
                                    type="text"
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
                                    type="text"
                                    name="nationality"
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border ${errors.nationality ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    placeholder="Nationality"
                                />
                                {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Register as Member
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MemberRegisterForm;