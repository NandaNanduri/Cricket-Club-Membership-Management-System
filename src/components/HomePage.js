import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const slides = [
    {
        title: 'Welcome to GCC!',
        description: 'Manage your team, players, and matches efficiently.',
        image: '/images/slide1.jpg',
    },
    {
        title: 'Join as a Player',
        description: 'Get verified, scan your QR, and enjoy the game!',
        image: '/images/slide2.jpg',
    },
    {
        title: 'Captains Organize Easily',
        description: 'Upload receipts and manage your players smoothly.',
        image: '/images/slide3.jpg',
    },
];

const roles = [
    { title: 'Member', image: '/images/member.jpeg' },
    { title: 'Player', image: '/images/player.jpeg' },
    { title: 'Team Captain', image: '/images/captain.jpeg' },
    { title: 'Umpire', image: '/images/umpire.jpeg' },
];

function HomePage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center pt-10 pb-20 px-4">
            {/* Slideshow */}
            <div className="w-full max-w-6xl mb-20">
                <div className="bg-white/40 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-700 hover:scale-[1.015] border border-white/30">
                    <img
                        src={slides[currentSlide].image}
                        alt="slide"
                        className="w-full md:w-1/2 h-64 md:h-96 object-cover"
                    />
                    <div className="p-10 flex flex-col justify-center bg-white/20 backdrop-blur-md w-full md:w-1/2">
                        <h2 className="text-4xl font-bold text-blue-700 mb-4 drop-shadow">
                            {slides[currentSlide].title}
                        </h2>
                        <p className="text-gray-800 text-lg">{slides[currentSlide].description}</p>
                        <div className="flex mt-6 space-x-2">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-4 h-4 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-blue-600 scale-110' : 'bg-blue-200'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Cards */}
            <h1 className="text-5xl font-extrabold text-blue-800 mb-12 text-center">
                Select Your <span className="text-blue-600">Role</span>
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 w-full max-w-7xl px-4">
                {roles.map((role) => (
                    <Link
                        key={role.title}
                        to="/login"
                        className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center group hover:bg-white/80 transform hover:-translate-y-2"
                    >
                        <div className="mb-6 p-2 rounded-full ring-4 ring-blue-100 group-hover:ring-blue-300 transition-all">
                            <img
                                src={role.image}
                                alt={role.title}
                                className="w-32 h-32 object-cover rounded-full shadow-md border border-white"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                            {role.title}
                        </h2>
                        <div className="mt-3 text-blue-500 font-semibold hover:text-blue-700 transition-colors">
                            Sign in →
                        </div>
                    </Link>
                ))}
            </div>

            {/* Club Admin CTA */}
            <div className="mt-20 text-center">
                <p className="text-gray-700 text-lg mb-4">Are you a club administrator?</p>
                <Link
                    to="/register/club-admin"
                    className="inline-block px-10 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-semibold rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                    Register as Club Admin
                </Link>
            </div>
        </div>
    );
}

export default HomePage;
