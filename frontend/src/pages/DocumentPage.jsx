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

        // Feature: Real-Time Polling
        const interval = setInterval(() => {
            getDocument(id);
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, [id]);

    const submitDoc = async () => {
        try {
            await axios.put(`/documents/${document._id}/submit`, { comment: 'Submitted for approval' });
            getDocument(id);
            setAlert('Document submitted', 'success');
        } catch (err) {
            setAlert(err.response?.data?.msg || 'Submission failed', 'danger');
        }
    };

    const approveDoc = async () => {
        try {
            await axios.put(`/documents/${document._id}/approve`, { comment: 'Approved' });
            getDocument(id);
            setAlert('Document approved', 'success');
        } catch (err) {
            setAlert(err.response?.data?.msg || 'Approval failed', 'danger');
        }
    };

    const rollbackDoc = async (version) => {
        if (!window.confirm(`Are you sure you want to rollback to version ${version}? Current changes will be saved as a new version.`)) return;
        try {
            await axios.post(`/documents/${document._id}/rollback`, { version });
            getDocument(id);
            setAlert(`Rolled back to version ${version}`, 'success');
        } catch (err) {
            setAlert(err.response?.data?.msg || 'Rollback failed', 'danger');
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
                                {(user && (user.role === 'admin' || String(user._id) === String(document.creator?._id || document.owner?._id))) && (
                                    <Button variant='secondary' size='sm' onClick={() => { setCurrent(document); navigate('/dashboard'); }} className='w-full sm:w-auto'>Edit</Button>
                                )}
                                {(user && (user.role === 'admin' || String(user._id) === String(document.creator?._id || document.owner?._id))) && (
                                    <Button variant='primary' size='sm' onClick={() => setForwardOpen(true)} className='w-full sm:w-auto'>Forward</Button>
                                )}
                                {user && document.status === 'Draft' && (
                                    <Button variant='primary' size='sm' onClick={submitDoc} className='w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700'>Submit Approval</Button>
                                )}
                                {(user && document.status === 'Pending' || document.status === 'Pending Approval') && (
                                    <>
                                        <Button variant='secondary' size='sm' onClick={approveDoc} className='w-full sm:w-auto bg-green-600 text-white hover:bg-green-700'>Approve</Button>
                                        <Button variant='danger' size='sm' onClick={rejectDoc} className='w-full sm:w-auto'>Reject</Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Workflow Status Banner */}
                        {document.workflow && document.status !== 'Approved' && document.status !== 'Rejected' && (
                            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            Current Workflow Step: <span className="font-bold">{document.currentStep}</span> (Waiting for Approval)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-2">
                            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
                                <div className="w-full md:w-auto">
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight break-words">{document.title}</h1>
                                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                                        <div>Version: <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded ml-1">{document.currentVersion || 1}</span></div>
                                        <div className="hidden sm:block">•</div>
                                        <div>Created: <span className='font-medium text-gray-700'>{new Date(document.createdAt).toLocaleDateString()}</span></div>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2 self-start md:self-auto mt-2 md:mt-0'>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border 
                                        ${document.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                        ${document.status === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                        ${document.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                        ${document.status === 'Closed' ? 'bg-slate-100 text-slate-700 border-slate-200' : ''}
                                        ${document.status === 'Draft' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
                                        ${!document.status || document.status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                    `}>{document.status || 'Open'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className='lg:col-span-2'>
                                <div className='mb-4 p-4 bg-white border rounded shadow-sm'>
                                    <p className="text-gray-700 whitespace-pre-wrap">{document.content}</p>
                                </div>

                                {/* Version History UI */}
                                {document.versions && document.versions.length > 0 && (
                                    <div className='mb-4 p-4 bg-white border rounded shadow-sm'>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Version History</h3>
                                        <div className='space-y-4'>
                                            {document.versions.map((version) => (
                                                <div key={version.version} className='border rounded p-3 flex justify-between items-center'>
                                                    <div>
                                                        <div className='text-sm font-semibold'>Version {version.version}</div>
                                                        <div className='text-xs text-gray-500'>{new Date(version.timestamp).toLocaleString()}</div>
                                                    </div>
                                                    <Button size="sm" variant="secondary" onClick={() => rollbackDoc(version.version)}>Rollback</Button>
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

                        {/* Comments Section */}
                        <CommentsSection documentId={document._id} comments={document.comments} currentUser={user} />
                    </div>
                </Container>
            </main>
            <Footer />
            {document && <ForwardModal isOpen={forwardOpen} onClose={() => setForwardOpen(false)} onConfirm={async (toUserId) => {
                try {
                    await forwardDocument(document._id, toUserId);
                    setForwardOpen(false);
                    getDocument(id);
                } catch (err) {
                    console.error(err);
                }
            }} />}
        </div>
    );
};

export default DocumentPage;
