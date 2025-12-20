import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import DocumentContext from '../context/document/DocumentContext.js';
import AuthContext from '../context/AuthContext.js';
import AlertContext from '../context/alert/AlertContext.js';
import Modal from './ui/Modal';
import Button from './ui/Button';
import DocumentTimeline from './DocumentTimeline';
import ForwardModal from './ForwardModal';
import TiltCard from './ui/TiltCard';

const DocumentItem = ({ document, selectable = false, checked = false, onToggle = () => { } }) => {
    const documentContext = useContext(DocumentContext);
    const authContext = useContext(AuthContext);

    const { deleteDocument, setCurrent, clearCurrent, forwardDocument, getDocuments } = documentContext;
    const alertContext = useContext(AlertContext);
    const { setAlert } = alertContext;
    const { user } = authContext;

    const { _id, title, content, tags, owner, history, status, createdAt } = document;
    const ownerId = owner && (owner._id ? String(owner._id) : (typeof owner === 'string' ? owner : String(owner)));
    const ownerDisplay = owner && (owner.username || ownerId || (typeof owner === 'string' ? owner : undefined));

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [forwardOpen, setForwardOpen] = useState(false);

    const onDelete = () => {
        setConfirmOpen(true);
    };

    const runDelete = async () => {
        try {
            const ok = await deleteDocument(_id);
            if (ok) {
                clearCurrent();
                try { getDocuments(); } catch (e) { }
                setAlert('Document removed', 'success');
                setConfirmOpen(false);
            } else {
                setAlert('Failed to delete document', 'danger');
            }
        } catch (err) {
            console.error(err);
            setAlert('Failed to delete document', 'danger');
        }
    };

    return (
        <TiltCard className='bg-white rounded-xl shadow-sm overflow-hidden mb-6 group relative border-l-4 border-l-indigo-500' max={5} scale={1.02}>
            <div className="p-6 h-full flex flex-col justify-between cursor-pointer transition-colors bg-white">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        {selectable && (
                            <div className="mr-3 flex items-start">
                                <input type="checkbox" checked={!!checked} onChange={() => onToggle(document._id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" aria-label={`Select ${document.title}`} />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <h3 className='text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate'>{title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {createdAt && <span className='text-xs text-gray-500'>Created: {new Date(createdAt).toLocaleDateString()}</span>}
                                {document.docRef && (
                                    <span className="text-xs text-gray-400">ID: <span className="font-medium text-gray-600">{document.docRef}</span></span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {document.priority === 'High' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 border border-red-200 rounded-full">
                                    High Priority
                                </span>
                            )}
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border 
                                ${status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                ${status === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                ${status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                ${status === 'Closed' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                                ${status === 'Draft' ? 'bg-gray-100 text-gray-600 border-gray-200' : ''}
                                ${!status || status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                            `}>
                                {status || 'Open'}
                            </span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-4 flex items-center gap-4 flex-wrap pb-3 border-b border-gray-50">
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400">Owner:</span>
                            <span title={ownerDisplay} className="font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{ownerDisplay || 'Unknown'}</span>
                        </div>
                        {document.assignedTo && (
                            <div className="flex items-center gap-1">
                                <span className="text-gray-400">Assigned:</span>
                                <span title={document.assignedToName} className="font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{document.assignedToName || (document.assignedTo?.username || document.assignedTo)}</span>
                            </div>
                        )}
                    </div>

                    <p className='text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2'>{content}</p>

                    {tags && tags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span key={tag} className="inline-block bg-indigo-50 text-indigo-700 rounded px-2 py-0.5 text-xs font-medium border border-indigo-100">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 mt-2 pt-3 border-t border-gray-100 opacity-80 group-hover:opacity-100 transition-opacity relative z-20">
                    <button aria-label="View History" onClick={() => setHistoryOpen(true)} className="text-gray-400 hover:text-indigo-600 transition-colors" title="History">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <Link to={`/document/${_id}`}>
                        <Button variant="secondary" size="sm" className="bg-white hover:bg-gray-50">View</Button>
                    </Link>
                    <Button variant="primary" size="sm" onClick={() => setCurrent(document)}>Edit</Button>

                    {((user && user.role === 'admin') || (user && String(user._id) === ownerId) || (user && String(user._id) === String(document.assignedTo))) && (
                        <Button variant="secondary" size="sm" onClick={() => setForwardOpen(true)}>Forward</Button>
                    )}

                    {((user && user.role === 'admin') || (user && String(user._id) === ownerId)) && (
                        <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm delete"
                actions={<>
                    <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={runDelete}>Delete</Button>
                </>}>
                <p className="text-gray-600">Are you sure you want to delete "<span className="font-semibold text-gray-800">{title}</span>"? This action cannot be undone.</p>
            </Modal>

            {/* History Modal */}
            <Modal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} title={`History: ${title}`}>
                <div className="max-h-[50vh] sm:max-h-[60vh] overflow-auto pr-2">
                    <DocumentTimeline history={history} />
                </div>
                <div className="mt-6 flex justify-end">
                    <Button variant="secondary" onClick={() => setHistoryOpen(false)}>Close</Button>
                </div>
            </Modal>
            {/* Forward Modal */}
            <ForwardModal isOpen={forwardOpen} onClose={() => setForwardOpen(false)} onConfirm={async (toUserId) => {
                try {
                    await forwardDocument(_id, toUserId);
                    setForwardOpen(false);
                    setAlert('Document forwarded', 'success');
                } catch (err) {
                    console.error(err);
                    setAlert('Failed to forward document', 'danger');
                }
            }} />
        </TiltCard>
    );
};

export default DocumentItem;
