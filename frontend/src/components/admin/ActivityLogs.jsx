import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Container from './ui/Container';
import Header from './Header';
import Footer from './Footer';

const ActivityLogs = () => {
    const authContext = useContext(AuthContext);
    const { user } = authContext;
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const fetchLogs = async (pageNum) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/logs?page=${pageNum}&limit=50`);
            setLogs(res.data.logs);
            setTotalPages(res.data.totalPages);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch logs', err);
            setLoading(false);
        }
    };

    const downloadCsv = async () => {
        try {
            const res = await axios.get('/api/admin/logs/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'system_logs.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error('Download failed', err);
            alert('Failed to download CSV');
        }
    };

    if (loading && logs.length === 0) {
        return <div className="p-8 text-center">Loading logs...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-20 md:pt-24">
                <Container className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">System Activity Logs</h1>
                        <a
                            href={`/api/admin/logs/export?token=${localStorage.getItem('token')}`} // Since it's a direct link, we'd need to handle auth token in query or use axios blob download. Direct link is simpler if token is in cookie or not required for simple test, but this is protected backend. Let's use a function.
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                downloadCsv();
                            }}
                        >
                            Export CSV
                        </a>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <ul className="divide-y divide-gray-200">
                            {logs.map((log) => (
                                <li key={log._id} className="p-4 hover:bg-gray-50">
                                    <div className="flex space-x-3">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-gray-900 capitalize">
                                                    {log.action.replace(/_/g, ' ')}
                                                </h3>
                                                <p className="text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Performed by: <span className="font-semibold">{log.performedBy ? (log.performedBy.username || log.performedBy.email) : 'System/Unknown'}</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Target: {log.targetModel} ({log.targetId})
                                            </p>
                                            {log.details && (
                                                <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pagination */}
                    <div className="mt-6 flex justify-between items-center">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className={`px-4 py-2 border rounded text-sm font-medium ${page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className={`px-4 py-2 border rounded text-sm font-medium ${page >= totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Next
                        </button>
                    </div>
                </Container>
            </main>
            <Footer />
        </div>
    );
};

export default ActivityLogs;
