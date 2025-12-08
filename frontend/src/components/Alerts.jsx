import React, { useContext } from 'react';
import AlertContext from '../context/alert/AlertContext.js';

const Alerts = () => {
    const alertContext = useContext(AlertContext);
    const { alerts } = alertContext;

    const getAlertClasses = (type) => {
        let baseClasses = 'p-4 mb-4 rounded-lg flex justify-between items-center';
        if (type === 'danger') {
            return `${baseClasses} bg-red-100 border border-red-400 text-red-700`;
        }
        if (type === 'success') {
            return `${baseClasses} bg-green-100 border border-green-400 text-green-700`;
        }
        return `${baseClasses} bg-blue-100 border border-blue-400 text-blue-700`;
    };

    return (
        <div className="fixed top-20 md:top-24 right-5 w-full max-w-sm z-50 space-y-2">
            {alerts && alerts.length > 0 &&
                alerts.map(alert => (
                    <div key={alert.id} className={`${getAlertClasses(alert.type)} transform transition-all duration-300 ease-in-out`} role="alert">
                        <div className="flex justify-between items-center w-full">
                            <span className="block sm:inline">{alert.msg}</span>
                            <button onClick={() => alertContext.removeAlert(alert.id)} className="ml-4 text-gray-600 hover:text-gray-800" aria-label="Close alert">&times;</button>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default Alerts;
