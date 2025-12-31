import React from 'react';

const MetricsCard = ({ title, value, icon, color = 'purple', subtitle }) => {
    const colorClasses = {
        purple: 'bg-purple-500',
        gold: 'bg-gold-500',
        green: 'bg-green-500',
        blue: 'bg-blue-500',
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center text-white`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-gray-600 text-sm font-semibold mb-2">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
    );
};

export default MetricsCard;
