import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Container from '../components/ui/Container';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DocumentContext from '../context/document/DocumentContext';
import AuthContext from '../context/AuthContext';
import AlertContext from '../context/alert/AlertContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DocumentTimeline from '../components/DocumentTimeline';
import ForwardModal from '../components/ForwardModal';
import Button from '../components/ui/Button';
import CloseModal from '../components/CloseModal';
import CommentsSection from '../components/CommentsSection';

const DocumentPage = () => {
    const { id } = useParams();
    const documentContext = useContext(DocumentContext);
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const { getDocument, current: document, loading, deleteDocument, setCurrent, forwardDocument, updateDocument } = documentContext;
    const alertContext = useContext(AlertContext);
    const { setAlert } = alertContext;
    const { user } = authContext;
    const [forwardOpen, setForwardOpen] = useState(false);
    const [closeOpen, setCloseOpen] = useState(false);
    const [showMetadata, setShowMetadata] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        getDocument(id);
        // eslint-disable-next-line
    }, [id]);

    const submitDoc = async () => {
        try {
            await axios.put(`/api/documents/${document._id}/submit`);
            getDocument(id);
        } catch (err) {
            setAlert(err.response?.data?.msg || 'Submission failed', 'danger');
        }
    };

    const approveDoc = async () => {
        try {
            await axios.put(`/api/documents/${document._id}/approve`);
            getDocument(id);
        } catch (err) {
            setAlert(err.response?.data?.msg || 'Approval failed', 'danger');
        }
    };

    const rejectDoc = async () => {
        const reason = window.prompt('Enter rejection reason:');
        if (reason === null) return;
        try {
            await axios.put(`/api/documents/${document._id}/reject`, { reason });
            getDocument(id);
        } catch (err) {
            setAlert(err.response?.data?.msg || 'Rejection failed', 'danger');
        }
    };

    if (loading || !document) {
        return (
            <div>
                <Header />
                <main className="p-8 text-center">
                    <Container className="animate-fade-in">
                        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow animate-pulse">
                            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4" />
                            <div className="h-4 bg-gray-300 rounded mb-3" />
                            <div className="h-4 bg-gray-300 rounded mb-3" />
                            <div className="h-48 bg-gray-300 rounded mb-3" />
                        </div>
                    </Container>
                </main>
                <Footer />
                {document && <ForwardModal isOpen={forwardOpen} onClose={() => setForwardOpen(false)} onConfirm={async (toUserId) => {
                    try {
                        await forwardDocument(document._id, toUserId);
                        setForwardOpen(false);
                        // reload the document to reflect changes
                        getDocument(id);
                    } catch (err) {
                        console.error(err);
                    }
                }} />}
                {document && <CloseModal isOpen={closeOpen} onClose={() => setCloseOpen(false)} onConfirm={async (closingMessage) => {
                    try {
                        await forwardDocument(document._id, document.assignedTo ? document.assignedTo._id || document.assignedTo : undefined); // ensure assigned structure remains
                    } catch (err) {
                        // ignore
                    }
                    try {
                        // call updateDocument with status closed and closingMessage (via context)
                        await updateDocument({ _id: document._id, title: document.title, content: document.content, tags: document.tags, metadata: document.metadata, status: 'Closed', closingMessage });
                        setCloseOpen(false);
                        getDocument(id);
                    } catch (err) {
                        console.error(err);
                    }
                }} />}
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen overflow-x-hidden">
            <Header />
            <main className="p-8 pt-20 md:pt-24">
                <Container className="animate-fade-in">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-7xl mx-auto transition-opacity duration-300 ease-in-out opacity-100">
                        <div className='flex items-center justify-between mb-6'>
                            <Link to="/dashboard" className="text-blue-500 hover:underline">&larr; Back to Dashboard</Link>
                            <div className='flex flex-col sm:flex-row gap-2 items-center'>
                                {/* Copy docRef */}
                                {document.docRef && (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard?.writeText(document.docRef);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className='text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded border border-gray-200 w-full sm:w-auto transition-colors duration-200'
                                    >
                                        {copied ? 'Copied!' : 'Copy ID'}
                                    </button>
                                )}
                                {/* Edit */}
                                {(user && (user.role === 'admin' || String(user._id) === String(document.owner._id))) && (
                                    <Button variant='secondary' size='sm' onClick={() => { setCurrent(document); navigate('/dashboard'); }} className='w-full sm:w-auto'>Edit</Button>
                                )}
                                {/* Forward */}
                                {(user && (user.role === 'admin' || String(user._id) === String(document.owner._id) || (document.assignedTo && String(user._id) === String(document.assignedTo._id)))) && (
                                    <Button variant='primary' size='sm' onClick={() => setForwardOpen(true)} className='w-full sm:w-auto'>Forward</Button>
                                )}
                                {/* Delete */}
                                {(user && (user.role === 'admin' || String(user._id) === String(document.owner._id))) && (
                                    <Button variant='danger' size='sm' onClick={async () => { const ok = await deleteDocument(document._id); if (ok) navigate('/dashboard'); else setAlert('Failed to delete', 'danger'); }} className='w-full sm:w-auto'>Delete</Button>
                                )}
                                {/* Workflow Actions */}
                                {user && document.status === 'Draft' && String(user._id) === String(document.owner._id) && (
                                    <Button variant='primary' size='sm' onClick={submitDoc} className='w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700'>Submit Approval</Button>
                                )}
                                {user && document.status === 'Pending Approval' && ['admin', 'technical-admin', 'manager', 'ceo'].includes(user.role) && (
                                    <>
                                        <Button variant='secondary' size='sm' onClick={approveDoc} className='w-full sm:w-auto bg-green-600 text-white hover:bg-green-700'>Approve</Button>
                                        <Button variant='danger' size='sm' onClick={rejectDoc} className='w-full sm:w-auto'>Reject</Button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="mb-2">
                            <div className='flex items-start justify-between gap-6'>
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{document.title}</h1>
                                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                                        {document.docRef && (
                                            <div>Document ID: <span className="font-medium text-gray-700">{document.docRef}</span></div>
                                        )}
                                        <div>Created: <span className='font-medium text-gray-700'>{new Date(document.createdAt).toLocaleString()}</span></div>
                                        <div>Updated: <span className='font-medium text-gray-700'>{new Date(document.updatedAt).toLocaleString()}</span></div>
                                    </div>
                                    <div className='my-2 text-sm text-gray-600'>Owner: <span className='font-medium text-gray-700'>{document.owner && (document.owner.username || document.owner._id)}</span>{document.owner && document.owner.role ? ` (${document.owner.role})` : ''}</div>
                                    {document.assignedTo && (
                                        <div className='text-sm text-gray-600'>Assigned to: <span className='font-medium text-gray-700'>{document.assignedToName || (document.assignedTo.username || document.assignedTo._id)}</span></div>
                                    )}
                                </div>
                                <div className='flex flex-col items-end'>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium 
                                        ${document.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                                        ${document.status === 'Pending Approval' ? 'bg-amber-100 text-amber-800' : ''}
                                        ${document.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                                        ${document.status === 'Closed' ? 'bg-slate-100 text-slate-800' : ''}
                                        ${document.status === 'Draft' ? 'bg-gray-100 text-gray-800' : ''}
                                        ${!document.status || document.status === 'Open' ? 'bg-blue-100 text-blue-800' : ''}
                                    `}>{document.status || 'Open'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className='lg:col-span-2'>
                                <div className='mb-4 p-4 bg-white border rounded shadow-sm'>
                                    <p className="text-gray-700 whitespace-pre-wrap">{document.content}</p>
                                </div>
                                {document.metadata && Object.keys(document.metadata).length > 0 && (
                                    <div className='mb-4 p-4 bg-white border rounded shadow-sm'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <h3 className="text-lg font-semibold text-gray-800 ">Metadata</h3>
                                            <button className='text-xs text-gray-500' onClick={() => setShowMetadata(!showMetadata)}>{showMetadata ? 'Hide' : 'Show'}</button>
                                        </div>
                                        {showMetadata && (
                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                                {Object.entries(document.metadata).map(([k, v]) => (
                                                    <div key={k} className='bg-gray-50 p-2 rounded border'>
                                                        <div className='text-xs text-gray-500'>{k}</div>
                                                        <div className='text-sm font-medium text-gray-700'>{String(v)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {document.versionHistory && document.versionHistory.length > 0 && (
                                    <div className='mb-4 p-4 bg-white border rounded shadow-sm'>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Version History</h3>
                                        <div className='space-y-4'>
                                            {document.versionHistory.map((version, index) => (
                                                <div key={index} className='border rounded p-3'>
                                                    <div className='flex items-center justify-between'><div className='text-sm font-semibold'>Version {document.versionHistory.length - index}</div><div className='text-xs text-gray-500'>{new Date(version.editedAt).toLocaleString()}</div></div>
                                                    <div className='text-sm text-gray-700 mt-2 whitespace-pre-wrap'>{version.content}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className='lg:col-span-1'>
                                <div className='bg-white border rounded p-4 shadow-sm'>
                                    <h3 className='text-lg font-semibold text-gray-800 mb-3'>Activity Timeline</h3>
                                    <div className='max-h-[50vh] sm:max-h-[400px] overflow-auto pr-2'>
                                        <DocumentTimeline history={document.history} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {document.tags && document.tags.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {document.tags.map(tag => (
                                        <span key={tag} className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <CommentsSection documentId={document._id} comments={document.comments} currentUser={user} />

                        {document.versionHistory && document.versionHistory.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-t pt-6">Version History</h3>
                                <div className="space-y-6">
                                    {document.versionHistory.map((version, index) => (
                                        <div key={index} className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                                            <p className='text-md font-semibold text-gray-800'>
                                                Version {document.versionHistory.length - index}
                                            </p>
                                            <p className='text-xs text-gray-500 mb-2'>
                                                Edited at: {new Date(version.editedAt).toLocaleString()}
                                            </p>
                                            <p className='text-sm text-gray-700 whitespace-pre-wrap'>{version.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Container>
            </main>
            <Footer />
        </div>
    );
};

export default DocumentPage;
