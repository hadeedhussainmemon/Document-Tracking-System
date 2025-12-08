import React, { useState, useContext, useEffect } from 'react';
import DocumentContext from '../context/document/DocumentContext.js';
import AlertContext from '../context/alert/AlertContext.js';
import Button from './ui/Button';

const DocumentForm = () => {
    const documentContext = useContext(DocumentContext);
    const alertContext = useContext(AlertContext);

    const { addDocument, updateDocument, clearCurrent, current } = documentContext;
    const { setAlert } = alertContext;

    const [document, setDocument] = useState({
        title: '',
        content: '',
        tags: '',
        status: 'Open'
    });
    const [heads, setHeads] = useState([]);
    const [metadataRows, setMetadataRows] = useState([{ key: '', value: '' }]);

    useEffect(() => {
        if (current !== null) {
            setDocument({
                title: current.title || '',
                content: current.content || '',
                tags: current.tags ? current.tags.join(', ') : '',
                status: current.status || 'Open',
                assignedTo: current.assignedTo ? (typeof current.assignedTo === 'string' ? current.assignedTo : (current.assignedTo._id || '')) : ''
            });
            if (current.metadata && Object.keys(current.metadata).length > 0) {
                setMetadataRows(Object.entries(current.metadata).map(([key, value]) => ({ key, value })));
            } else {
                setMetadataRows([{ key: '', value: '' }]);
            }
        } else {
            setDocument({
                title: '',
                content: '',
                tags: '',
                status: 'Open'
            });
            setMetadataRows([{ key: '', value: '' }]);
        }
        // fetch heads for assignment dropdown
        const fetchHeads = async () => {
            try {
                const res = await (await import('axios')).default.get('/api/users/heads');
                setHeads(res.data.users || []);
            } catch (err) {
                console.error('Failed to load heads', err);
            }
        };
        fetchHeads();
    }, [current]);


    const { title, content, tags, status, assignedTo } = document;

    const onChange = e =>
        setDocument({ ...document, [e.target.name]: e.target.value });

    const handleMetadataChange = (index, field, value) => {
        const newRows = [...metadataRows];
        newRows[index][field] = value;
        setMetadataRows(newRows);
    };

    const addMetadataRow = () => {
        setMetadataRows([...metadataRows, { key: '', value: '' }]);
    };

    const removeMetadataRow = (index) => {
        const newRows = metadataRows.filter((_, i) => i !== index);
        setMetadataRows(newRows);
    };

    const [saving, setSaving] = useState(false);

    const onSubmit = async e => {
        e.preventDefault();
        
        if (title.trim() === '' || content.trim() === '') {
            setAlert('Please fill in all required fields', 'danger');
            return;
        }

        try {
            const metadataObj = metadataRows.reduce((acc, row) => {
                if (row.key.trim()) {
                    acc[row.key.trim()] = row.value;
                }
                return acc;
            }, {});

            const documentData = {
                title,
                content,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                metadata: metadataObj,
                status
            };
            if (assignedTo) {
                documentData.assignedTo = assignedTo;
                const head = heads.find(h => h._id === assignedTo);
                documentData.assignedToName = head ? head.username || head.fullName : '';
            }

            setSaving(true);
            if (current === null) {
                await addDocument(documentData);
                setAlert('Document Added', 'success');
            } else {
                await updateDocument({ ...documentData, _id: current._id });
                setAlert('Document Updated', 'success');
            }
            setSaving(false);
            clearAll();
        } catch (err) {
            console.error(err);
            setSaving(false);
            setAlert('Error saving document', 'danger');
        }
    };

    const clearAll = () => {
        clearCurrent();
    };

    return (
        <form onSubmit={onSubmit} id="document-form">
            <h2 className='text-2xl mb-4'>{current ? 'Edit Document' : 'Add Document'}</h2>
            <input
                type='text'
                placeholder='Title *'
                name='title'
                value={title}
                onChange={onChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            />
            <textarea
                placeholder='Content *'
                name='content'
                value={content}
                onChange={onChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            />
                <input
                type='text'
                placeholder='Tags (comma-separated)'
                name='tags'
                value={tags}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            />
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Assign to (Concern Head)</label>
                    <select name="assignedTo" value={assignedTo || ''} onChange={onChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none mb-4 bg-white">
                        <option value="">None</option>
                        {heads.map(h => <option key={h._id} value={h._id}>{h.fullName || h.username} ({h.role})</option>)}
                    </select>
                </div>
            {current && (
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                    <select
                        name="status"
                        value={status}
                        onChange={onChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                    >
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            )}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Other Fields (Optional)</label>
                {metadataRows.map((row, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Key (e.g. Priority)"
                            value={row.key}
                            onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
                            className="shadow appearance-none border rounded w-full sm:w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <input
                            type="text"
                            placeholder="Value (e.g. High)"
                            value={row.value}
                            onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                            className="shadow appearance-none border rounded w-full sm:w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <button
                            type="button"
                            onClick={() => removeMetadataRow(index)}
                            className="text-red-500 hover:text-red-700 px-2 font-bold text-xl"
                            title="Remove"
                        >
                            &times;
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addMetadataRow}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Metadata Field
                </button>
            </div>

            <div>
                <Button type="submit" variant="primary" className={`w-full ${saving ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={saving}>
                    {saving ? 'Saving...' : (current ? 'Update Document' : 'Add Document')}
                </Button>
            </div>
            {current && (
                <div>
                    <button type="button" className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4' onClick={(e) => { e.preventDefault(); clearAll(); }}>
                        Clear
                    </button>
                </div>
            )}
        </form>
    );
};

export default DocumentForm;
