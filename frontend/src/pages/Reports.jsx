import React, { useState, useContext } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import AuthContext from '../context/AuthContext';

const Reports = () => {
    const { user } = useContext(AuthContext);
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
        owner: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.owner) params.owner = filters.owner;
            // For exportDocuments, we can pass filters as body

            const res = await axios.post('/api/documents/export', {
                filters: {
                    ...filters
                    // date handling might need check in backend exportDocuments
                }
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'custom_report.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error(err);
            alert('Export failed');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <Container className="flex-grow pt-24 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                    <p>Only admins can access reports.</p>
                </Container>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow pt-24 pb-12">
                <Container>
                    <div className="bg-white rounded shadow p-6 max-w-3xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Custom Reports Builder</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Open">Open</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Pending Approval">Pending Approval</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Owner ID (Optional)</label>
                                <input
                                    type="text"
                                    name="owner"
                                    value={filters.owner}
                                    onChange={handleChange}
                                    placeholder="User ID"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleExport} disabled={loading} variant="primary">
                                {loading ? 'Generating...' : 'Download Report (CSV)'}
                            </Button>
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </div>
    );
};

export default Reports;
