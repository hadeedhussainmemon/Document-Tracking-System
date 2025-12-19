import React, { useState } from 'react';
import axios from 'axios';

const CommentsSection = ({ documentId, comments = [], currentUser }) => {
    const [localComments, setLocalComments] = useState(comments);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        try {
            const res = await axios.post(`/api/documents/${documentId}/comments`, { text });
            // API returns the updated comments array
            setLocalComments(res.data);
            setText('');
        } catch (err) {
            console.error('Failed to add comment', err);
            // Could add error toast here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                Comments ({localComments.length})
            </h3>

            {/* Comment List */}
            <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2">
                {localComments.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No comments yet. Start the discussion!</p>
                ) : (
                    localComments.map((comment, index) => (
                        <div key={index} className="flex space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                    {(comment.authorName || comment.author?.username || '?').charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="flex-grow bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {comment.authorName || comment.author?.username || 'Unknown'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-shadow"
                    rows="3"
                    placeholder="Write a comment..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={loading}
                ></textarea>
                <div className="mt-2 text-right">
                    <button
                        type="submit"
                        disabled={loading || !text.trim()}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${loading || !text.trim()
                                ? 'bg-indigo-300 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
                            }`}
                    >
                        {loading ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommentsSection;
