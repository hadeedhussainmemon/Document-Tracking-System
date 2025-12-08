import React, { Fragment, useContext, useEffect } from 'react';
import DocumentItem from './DocumentItem';
import DocumentContext from '../context/document/DocumentContext.js';
import Spinner from './Spinner';

const Documents = ({ skipFetch = false, selectable = false, selectedIds = [], onToggle = () => {} }) => {
    const documentContext = useContext(DocumentContext);

    const { documents, filtered, getDocuments, loading } = documentContext;

    useEffect(() => {
        if (!skipFetch) getDocuments();
        // eslint-disable-next-line
    }, [skipFetch]);

    if (documents !== null && documents.length === 0 && !loading) {
        return (
            <div className="text-center py-10">
                <h4 className="text-xl font-semibold mb-2">No documents yet</h4>
                <p className="text-gray-600 mb-4">Start by adding your first document.</p>
                <button onClick={() => { const el = document.getElementById('document-form'); if (el) { el.scrollIntoView({ behavior: 'smooth' }); el.querySelector('input, textarea')?.focus(); } }} className="btn-primary">Add Document</button>
            </div>
        );
    }

    return (
        <Fragment>
            {documents !== null && !loading ? (
                (
                    filtered !== null
                        ? filtered.map(document => (
                            <DocumentItem key={document._id} document={document} selectable={selectable} checked={(selectedIds || []).includes(document._id)} onToggle={onToggle} />
                        ))
                        : documents.map(document => (
                            <DocumentItem key={document._id} document={document} selectable={selectable} checked={(selectedIds || []).includes(document._id)} onToggle={onToggle} />
                        ))
                )
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 shadow-md animate-pulse h-40"></div>
                    ))}
                </div>
            )}
        </Fragment>
    );
};

export default Documents;
