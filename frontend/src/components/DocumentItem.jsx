import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import DocumentContext from '../context/document/DocumentContext.js';
import AuthContext from '../context/AuthContext.js';
import AlertContext from '../context/alert/AlertContext.js';
import Modal from './ui/Modal';
import Button from './ui/Button';
import DocumentTimeline from './DocumentTimeline';
import ForwardModal from './ForwardModal';

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
        <div className='bg-white shadow-md rounded-xl overflow-hidden mb-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100'>
            <div className="p-6 h-full flex flex-col justify-between hover:bg-gray-50 cursor-pointer focus-within:ring-2 focus-within:ring-blue-200">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        {selectable && (
                            <div className="mr-3 flex items-start">
                                <input type="checkbox" checked={!!checked} onChange={() => onToggle(document._id)} aria-label={`Select ${document.title}`} />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <h3 className='text-xl font-bold text-gray-800 truncate'>{title}</h3>
                            {createdAt && <span className='text-xs text-gray-400 mt-1'>Created: {new Date(createdAt).toLocaleDateString()}</span>}
                            {document.docRefShort ? (
                                <span className="text-xs text-gray-500">ID: <span className="font-medium text-gray-700">{document.docRefShort}</span></span>
                            ) : (
                                document.docRef && (
                                    <span className="text-xs text-gray-500">ID: <span className="font-medium text-gray-700">{document.docRef}</span></span>
                                )
                            )}
                        </div>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full 
                            ${status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                            ${status === 'Pending Approval' ? 'bg-amber-100 text-amber-800' : ''}
                            ${status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                            ${status === 'Closed' ? 'bg-slate-100 text-slate-800' : ''}
                            ${status === 'Draft' ? 'bg-gray-100 text-gray-800' : ''}
                            ${!status || status === 'Open' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                            {status || 'Open'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-3 flex items-center gap-3 flex-wrap">
                        <div>
                            <span className="mr-1">Owner:</span>
                            <span title={ownerDisplay} className="font-medium text-gray-700">{ownerDisplay || 'Unknown'}</span>
                        </div>
                        {owner && owner.role && (
                            <span className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-600">{owner.role}</span>
                        )}
                        {document.assignedTo && (
                            <div className="ml-4">
                                <span className="mr-1 text-xs text-gray-500">Assigned to:</span>
                                <span title={document.assignedToName || (document.assignedTo?.username || document.assignedTo)} className="font-medium text-gray-700 text-xs">{document.assignedToName || (document.assignedTo?.username || document.assignedTo)}</span>
                            </div>
                        )}
                    </div>
                    <p className='text-gray-600 mb-4 leading-relaxed line-clamp-3 text-sm'>{content}</p>

                    {tags && tags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span key={tag} className="inline-block bg-blue-50 text-blue-600 rounded-md px-2 py-1 text-xs font-medium border border-blue-100">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button aria-label="View History" onClick={() => setHistoryOpen(true)} className="text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50" title="View History">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <div className="w-full sm:w-auto">
                        <Link to={`/document/${_id}`}>
                            <Button variant="secondary" size="sm" aria-label="View document" className="w-full sm:w-auto">View</Button>
                        </Link>
                    </div>
                    <div className="w-full sm:w-auto">
                        <button aria-label="Edit document" onClick={() => setCurrent(document)}>
                            <Button variant="primary" size="sm" className="w-full sm:w-auto">Edit</Button>
                        </button>
                    </div>
                    {((user && user.role === 'admin') || (user && String(user._id) === ownerId)) && (
                        <div className="w-full sm:w-auto">
                            <button aria-label="Delete document" onClick={onDelete} className="w-full sm:w-auto">
                                <Button variant="danger" size="sm" className="w-full sm:w-auto">Delete</Button>
                            </button>
                        </div>
                    )}
                    {((user && user.role === 'admin') || (user && String(user._id) === ownerId) || (user && String(user._id) === String(document.assignedTo))) && (
                        <div className="w-full sm:w-auto">
                            <button aria-label="Forward document" onClick={() => setForwardOpen(true)} className="w-full sm:w-auto">
                                <Button variant="secondary" size="sm" className="w-full sm:w-auto">Forward</Button>
                            </button>
                        </div>
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
        </div>
    );
};

export default DocumentItem;
