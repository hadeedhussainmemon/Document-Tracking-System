import React, { useContext, useRef, useEffect, useMemo, useState } from 'react';
import DocumentContext from '../context/document/DocumentContext.js';

const DocumentFilter = ({ useServerFilter = false, onFilterChange }) => {
    const documentContext = useContext(DocumentContext);
    const text = useRef('');
    const tagsRef = useRef('');
    const metadataRef = useRef('');
    const docRefShortRef = useRef('');
    const statusRef = useRef(null);
    const ownerRef = useRef(null);
    const assignedRef = useRef(null);
    // const [showAdvanced, setShowAdvanced] is defined inside

    const { filterDocuments, clearFilter, filtered, documents } = documentContext;

    useEffect(() => {
        if (filtered === null && !useServerFilter) {
            // Only reset inputs if we are in client mode and filter was cleared externally
            if (text.current) text.current.value = '';
            if (tagsRef.current) tagsRef.current.value = '';
            if (metadataRef.current) metadataRef.current.value = '';
            if (docRefShortRef.current) docRefShortRef.current.value = '';
        }
    });

    const owners = useMemo(() => {
        if (!documents) return [];
        const seen = new Map();
        documents.forEach(d => {
            const owner = d.owner;
            if (owner) seen.set(owner._id || owner, owner.username || owner.fullName || owner._id);
        });
        return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
    }, [documents]);

    const assignedToList = useMemo(() => {
        if (!documents) return [];
        const seen = new Map();
        documents.forEach(d => {
            const a = d.assignedTo;
            if (a) seen.set(a._id || a, d.assignedToName || (a.username || a._id));
        });
        return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
    }, [documents]);



    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const startDateRef = useRef('');
    const endDateRef = useRef('');

    const onChange = (e) => {
        if (e) e.preventDefault();
        const filters = {};
        if (text.current.value) filters.search = text.current.value;
        if (tagsRef.current.value) filters.tags = tagsRef.current.value;
        if (metadataRef.current.value) filters.metadata = metadataRef.current.value;
        if (docRefShortRef.current.value) filters.docRefShort = docRefShortRef.current.value;
        if (statusRef.current && statusRef.current.value && statusRef.current.value !== 'all') filters.status = statusRef.current.value;
        if (ownerRef.current && ownerRef.current.value && ownerRef.current.value !== 'all') filters.owner = ownerRef.current.value;
        if (assignedRef.current && assignedRef.current.value && assignedRef.current.value !== 'all') filters.assignedTo = assignedRef.current.value;

        if (startDateRef.current && startDateRef.current.value) filters.startDate = startDateRef.current.value;
        if (endDateRef.current && endDateRef.current.value) filters.endDate = endDateRef.current.value;

        if (Object.keys(filters).length > 0) {
            if (useServerFilter && typeof onFilterChange === 'function') {
                onFilterChange(filters);
            } else {
                filterDocuments(filters);
            }
        } else {
            clearFilter();
            if (useServerFilter && typeof onFilterChange === 'function') {
                onFilterChange({});
            }
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onChange(); }} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className='flex gap-2 mb-2'>
                <input
                    ref={text}
                    type='text'
                    placeholder='Search title or content...'
                    onChange={onChange} // keep simple text search specific
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="whitespace-nowrap px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium transition-colors"
                >
                    {showAdvanced ? 'Hide Filters' : 'Advanced Filters'}
                </button>
            </div>

            {showAdvanced && (
                <div className="animate-fade-in mt-4 space-y-4">
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                        <input
                            ref={tagsRef}
                            type='text'
                            placeholder='Tags (comma-separated)...'
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <input
                            ref={metadataRef}
                            type='text'
                            placeholder='Metadata (key:value)...'
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <input
                            ref={docRefShortRef}
                            placeholder='Doc ID (e.g., DOC-0012)'
                            onChange={onChange}
                            className='shadow border rounded w-full py-2 px-3'
                        />
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                        <select onChange={onChange} name='status' id='status' ref={el => { window.statusRef = el }} className='shadow border rounded w-full py-2 px-3'>
                            <option value='all'>All Status</option>
                            <option value='Open'>Open</option>
                            <option value='Closed'>Closed</option>
                        </select>
                        <select onChange={onChange} name='owner' id='owner' ref={ownerRef} className='shadow border rounded w-full py-2 px-3'>
                            <option value='all'>All Owners</option>
                            {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                        <select onChange={onChange} name='assignedTo' id='assignedTo' ref={assignedRef} className='shadow border rounded w-full py-2 px-3'>
                            <option value='all'>All Assigned</option>
                            {assignedToList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Created After</label>
                            <input type='date' ref={startDateRef} onChange={onChange} className='shadow border rounded w-full py-2 px-3 text-gray-700' />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Created Before</label>
                            <input type='date' ref={endDateRef} onChange={onChange} className='shadow border rounded w-full py-2 px-3 text-gray-700' />
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default DocumentFilter;
