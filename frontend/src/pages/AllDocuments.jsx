import React, { useContext, useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Container from '../components/ui/Container';
import DocumentFilter from '../components/DocumentFilter';
import Documents from '../components/Documents';
import DocumentContext from '../context/document/DocumentContext';
import Button from '../components/ui/Button';

const AllDocuments = () => {
    const documentContext = useContext(DocumentContext);
    const { getDocuments, documents = [], page = 1, totalPages = 1, total = 0, exportDocuments, bulkAction } = documentContext;
    const [filters, setFilters] = useState({});
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const pageSize = 20;

    useEffect(() => {
        getDocuments({ page: 1, limit: pageSize, filters: {} });
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        getDocuments({ page: 1, limit: pageSize, filters });
        setSelectedIds([]);
        setSelectAll(false);
    }, [filters]);

    const onFilterChange = (f) => setFilters(f);

    const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleSelectAll = () => {
        if (selectAll) { setSelectedIds([]); setSelectAll(false); }
        else { setSelectedIds((documents || []).map(d => d._id)); setSelectAll(true); }
    };

    const handleExport = async () => {
        if (!selectedIds.length) return;
        try {
            const blob = await exportDocuments({ ids: selectedIds });
            const finalBlob = blob instanceof Blob ? blob : new Blob([blob]);
            const url = URL.createObjectURL(finalBlob);
            const a = document.createElement('a');
            a.href = url; a.download = 'documents.csv'; a.click(); URL.revokeObjectURL(url);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col overflow-x-hidden">
            <Header />
            <main className="flex-grow p-6 pt-20 md:pt-24">
                <Container className="max-w-7xl mx-auto">
                    <div className='flex items-center justify-between mb-6'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-800'>All Documents</h1>
                            <p className='text-sm text-gray-600 mt-1'>Browse and filter all documents across the system.</p>
                        </div>
                        <div className='w-full sm:w-60'>
                            <DocumentFilter useServerFilter={true} onFilterChange={onFilterChange} />
                        </div>
                    </div>

                    <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
                        <div className='mb-4 flex items-center justify-between gap-4'>
                            <div className='flex items-center gap-2'>
                                <input type='checkbox' checked={selectAll} onChange={toggleSelectAll} title='Select All' />
                                <Button variant='secondary' onClick={handleExport} disabled={selectedIds.length === 0}>Export CSV</Button>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button variant='secondary' onClick={() => getDocuments({ page: page - 1, limit: pageSize, filters })} disabled={page <= 1}>Prev</Button>
                                <Button variant='secondary' onClick={() => getDocuments({ page: page + 1, limit: pageSize, filters })} disabled={page >= totalPages}>Next</Button>
                                <div className='text-sm text-gray-600'>Page {page} / {totalPages}</div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-gray-500'>Total: {total || 0}</span>
                                <span className='text-sm ml-2 text-gray-500'>Selected: {selectedIds.length}</span>
                            </div>
                        </div>
                        <Documents skipFetch selectable selectedIds={selectedIds} onToggle={toggleSelect} />
                    </div>
                </Container>
            </main>
            <Footer />
        </div>
    );
};

export default AllDocuments;
