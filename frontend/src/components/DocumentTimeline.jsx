import React from 'react';

const DocumentTimeline = ({ history }) => {
    if (!history || history.length === 0) {
        return <div className="text-gray-500 italic">No history available.</div>;
    }

    // Sort history by timestamp descending (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div role="list" aria-label="Document activity timeline" className="relative border-l-2 border-gray-200 ml-3 space-y-6">
            {sortedHistory.map((event, index) => (
                <div key={index} role="listitem" className="mb-8 ml-6 relative">
                    <span className="absolute -left-9 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-4 ring-white">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </span>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-900">{event.action}</h3>
                            <div className="flex flex-col items-end">
                                <time className="block mb-1 text-sm font-normal leading-none text-gray-400">
                                    {new Date(event.timestamp).toLocaleString()}
                                </time>
                                {event.eventId && (
                                    <span className="text-xs text-gray-400">#{event.eventId}</span>
                                )}
                            </div>
                        </div>
                        <p className="mb-2 text-base font-normal text-gray-500">
                            {event.details}
                        </p>
                        { (event.performedBy || event.performedByName) && (
                            <p className="text-sm text-gray-400">
                                By: <span className="font-medium text-gray-700">
                                    { (typeof event.performedBy === 'string') 
                                        ? event.performedBy
                                        : (event.performedBy && (event.performedBy.username || event.performedBy._id)) 
                                            || event.performedByName || 'Unknown'
                                    }
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentTimeline;
