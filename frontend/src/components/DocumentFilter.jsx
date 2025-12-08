import React, { useContext, useRef, useEffect, useMemo } from 'react';
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

    const { filterDocuments, clearFilter, filtered } = documentContext;

    useEffect(() => {
        if (filtered === null) {
            text.current.value = '';
            tagsRef.current.value = '';
            metadataRef.current.value = '';
            docRefShortRef.current.value = '';
        }
    });

    const { documents } = documentContext;
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

    const onChange = () => {
        const filters = {};
        if (text.current.value) filters.text = text.current.value;
        if (tagsRef.current.value) filters.tags = tagsRef.current.value;
        if (metadataRef.current.value) filters.metadata = metadataRef.current.value;
        if (docRefShortRef.current.value) filters.docRefShort = docRefShortRef.current.value;
        if (statusRef.current && statusRef.current.value && statusRef.current.value !== 'all') filters.status = statusRef.current.value;
        if (ownerRef.current && ownerRef.current.value && ownerRef.current.value !== 'all') filters.owner = ownerRef.current.value;
        if (assignedRef.current && assignedRef.current.value && assignedRef.current.value !== 'all') filters.assignedTo = assignedRef.current.value;

        if (Object.keys(filters).length > 0) {
            if (useServerFilter && typeof onFilterChange === 'function') {
                onFilterChange(filters);
            } else {
                filterDocuments(filters);
            }
        } else {
            clearFilter();
        }
    };

    return (
        <form>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4'>
                <input
                ref={text}
                type='text'
                placeholder='Filter by title/content...'
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            />
                <input
                ref={tagsRef}
                type='text'
                placeholder='Filter by tags (comma-separated)...'
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            />
                <input
                ref={metadataRef}
                type='text'
                placeholder='Filter by metadata (key:value,key:value)...'
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <input ref={docRefShortRef} placeholder='Doc ID (e.g., DOC-000012)' onChange={onChange} className='shadow border rounded w-full py-2 px-3 mb-2'/>
                <select onChange={onChange} name='status' id='status' ref={el => { window.statusRef = el }} className='shadow border rounded w-full py-2 px-3 mb-2'>
                    <option value='all'>All Status</option>
                    <option value='Open'>Open</option>
                    <option value='Closed'>Closed</option>
                </select>
                <select onChange={onChange} name='owner' id='owner' ref={ownerRef} className='shadow border rounded w-full py-2 px-3 mb-2'>
                    <option value='all'>All Owners</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3'>
                <select onChange={onChange} name='assignedTo' id='assignedTo' ref={assignedRef} className='shadow border rounded w-full py-2 px-3 mb-2'>
                    <option value='all'>All Assigned</option>
                    {assignedToList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </div>
        </form>
    );
};

export default DocumentFilter;
