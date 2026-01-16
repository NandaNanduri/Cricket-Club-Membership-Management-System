import React, { useState } from 'react';
import axios from 'axios';

function UmpireRegisterForm() {
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
        umpire_certification_id: ''
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

        // Umpire certification ID
        if (!formData.umpire_certification_id.trim()) {
            newErrors.umpire_certification_id = 'Certification ID is required';
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

            const res = await axios.post('http://127.0.0.1:8000/users/register/umpire/', payload, {
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
                if (err.response.data.umpire_certification_id?.[0]?.includes('already exists')) {
                    serverErrors.umpire_certification_id = 'Certification ID already exists';
                }
                setErrors(serverErrors);
            } else {
                alert('Error registering umpire');
            }
        }
    };

    const fieldLabels = {
        email: 'Email',
        password: 'Password',
        fname: 'First Name',
        sname: 'Surname',
        id_num: 'ID Number',
        contact: 'Contact Number',
        dob: 'Date of Birth',
        postal_add: 'Postal Address',
        residential_add: 'Residential Address',
        nationality: 'Nationality',
        umpire_certification_id: 'Umpire Certification ID'
    };

    const getInputType = (key) => {
        if (key === 'dob') return 'date';
        if (key === 'password') return 'password';
        if (key === 'email') return 'email';
        return 'text';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Umpire Registration</h2>
                        <p className="mt-2 text-sm text-gray-600">Please fill in the umpire details</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {Object.keys(formData).map(key => (
                                <div key={key}>
                                    <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                                        {fieldLabels[key]}
                                    </label>
                                    <input
                                        type={getInputType(key)}
                                        id={key}
                                        name={key}
                                        value={formData[key]}
                                        onChange={handleChange}
                                        required
                                        className={`mt-1 block w-full border ${errors[key] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder={fieldLabels[key]}
                                    />
                                    {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key]}</p>}
                                </div>
                            ))}
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Register Umpire
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UmpireRegisterForm;