import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AlertContext from '../context/alert/AlertContext';
import Spinner from '../components/Spinner';
import Modal from '../components/ui/Modal';
import CreateUserForm from '../components/admin/CreateUserForm';
import roleAllowances from '../utils/roles';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';

const AdminUsers = () => {
    const { setAlert } = useContext(AlertContext);
    const { user } = useContext(AuthContext);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10);
    const [roleFilter, setRoleFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [historyUserId, setHistoryUserId] = useState(null);
    const [backfillConfirmOpen, setBackfillConfirmOpen] = useState(false);
    const [backfillLoading, setBackfillLoading] = useState(false);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (!historyUserId) return;
        const fetchLogs = async () => {
            setLoadingHistory(true);
            try {
                const res = await axios.get('/auditlogs', { params: { targetId: historyUserId } });
                setHistoryLogs(res.data);
            } catch (err) {
                console.error(err);
                setAlert('Failed to load audit logs', 'danger');
            }
            setLoadingHistory(false);
        };
        fetchLogs();
    }, [historyUserId, setAlert]);

    const loadUsers = useCallback(async (p = page) => {
        setLoading(true);
        try {
            const res = await axios.get('/users', { params: { page: p, limit, search, role: roleFilter } });
            const { users: data, total, page: curPage, totalPages: tp } = res.data;
            setUsers(data);
            setPage(curPage);
            setTotalPages(tp);
            setTotal(total);
        } catch (err) {
            console.error(err);
            setAlert('Failed to load users', 'danger');
        }
        setLoading(false);
    }, [limit, search, setAlert, page, roleFilter]);

    // We intentionally call a loader that initializes the component by fetching users
    useEffect(() => {
        const t = setTimeout(() => loadUsers(), 0);
        return () => clearTimeout(t);
    }, [loadUsers]);

    const onDelete = async id => {
        try {
            await axios.delete(`/users/${id}`);
            setAlert('User deleted', 'success');
            await loadUsers();
        } catch (err) {
            console.error(err);
            setAlert('Failed to delete user', 'danger');
        }
    };

    const onSaveEdit = async (id, data) => {
        try {
            await axios.put(`/users/${id}`, data);
            setAlert('User updated', 'success');
            setEditUser(null);
            await loadUsers();
        } catch (err) {
            console.error(err);
            setAlert('Failed to update user', 'danger');
        }
    };

    const canChangeRole = user && ['admin', 'technical-admin'].includes(user.role);

    return (
        <Container>
            <div className='py-6'>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="text-gray-500 hover:text-blue-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h2 className='text-2xl font-bold text-gray-800'>User Management</h2>
                    </div>
                    <Link to="/dashboard">
                        <Button variant="secondary" size="sm">Back to Dashboard</Button>
                    </Link>
                </div>

                <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
                    <div className='flex flex-col md:flex-row justify-between mb-6 items-center gap-4'>
                        {(() => {
                            const allowed = roleAllowances[user?.role] || [];
                            return (allowed.length > 0) ? <Button onClick={() => setShowCreateModal(true)}>New User</Button> : null;
                        })()}
                        {user?.role === 'admin' && (
                            <Button variant='secondary' onClick={() => setBackfillConfirmOpen(true)}>Backfill DB</Button>
                        )}
                    </div>
                    <div className='flex items-center gap-3 mb-3'>
                        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadUsers(1)} placeholder='Search...' className='border p-2 rounded' />
                        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); loadUsers(1); }} className='border rounded p-2'>
                            <option value='all'>All Roles</option>
                            <option value='user'>User</option>
                            <option value='employee'>Employee</option>
                            <option value='manager'>Manager</option>
                            <option value='ceo'>CEO</option>
                            <option value='hr'>HR</option>
                            <option value='admin'>Admin</option>
                            <option value='technical-admin'>Technical Admin</option>
                        </select>
                        <select value={limit} onChange={e => { setLimit(parseInt(e.target.value, 10)); loadUsers(1); }} className='border rounded p-2'>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    {loading ? (
                        <div className='flex justify-center py-8'><Spinner /></div>
                    ) : (
                        <div className='overflow-x-auto'>
                        <table className='w-full table-auto'>
                            <thead>
                                <tr>
                                    <th className='text-left p-2'>Username</th>
                                    <th className='text-left p-2'>Role</th>
                                    <th className='text-left p-2'>Full Name</th>
                                    <th className='text-right p-2'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='odd:bg-white even:bg-slate-50'>
                                {users.length === 0 ? (
                                    <tr>
                                        <td className='p-4 text-center' colSpan={4}>No users found.</td>
                                    </tr>
                                ) : users.map(u => (
                                    <tr key={u._id} className='border-t hover:bg-gray-50 transition'>
                                        <td className='p-3 text-sm font-medium'>{u.username}</td>
                                        <td className='p-3 text-sm text-gray-600'>{u.role}</td>
                                        <td className='p-3 text-sm text-gray-700'>{u.fullName}</td>
                                        <td className='p-3 text-right'>
                                            <Button variant='secondary' className='mr-2' onClick={() => setEditUser(u)}>Edit</Button>
                                                <Button variant='secondary' className='mr-2' onClick={() => { setHistoryUserId(u._id); }}>History</Button>
                                            <Button variant='danger' onClick={() => setDeleteUserId(u._id)} disabled={!(user && ['admin', 'technical-admin'].includes(user.role)) || (user._id === u._id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>
            </div>

                {editUser && (
                <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Edit user ${editUser.username}`} actions={<>
                    <Button variant='secondary' onClick={() => setEditUser(null)}>Cancel</Button>
                    <Button onClick={() => {
                        const payload = { fullName: editUser.fullName };
                        if (canChangeRole) payload.role = editUser.role;
                        onSaveEdit(editUser._id, payload);
                    }}>Save</Button>
                </>}> 
                    <div className='space-y-3'>
                        <label>Username</label>
                        <input value={editUser.username} disabled className='w-full p-2 border rounded'/>
                        <label>Full name</label>
                        <input value={editUser.fullName || ''} onChange={e => setEditUser({ ...editUser, fullName: e.target.value })} className='w-full p-2 border rounded'/>
                        <label>Role</label>
                        <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })} className='w-full p-2 border rounded' disabled={!canChangeRole}>
                            {(roleAllowances[user?.role] || []).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {!canChangeRole && (
                            <p className='text-xs text-gray-500 mt-1'>Only Admin or Technical Admin can change roles.</p>
                        )}
                    </div>
                </Modal>
            )}

            {deleteUserId && (
                <Modal isOpen={!!deleteUserId} onClose={() => setDeleteUserId(null)} title='Confirm delete' actions={<>
                    <Button variant='secondary' onClick={() => setDeleteUserId(null)}>Cancel</Button>
                    <Button variant='danger' onClick={() => { onDelete(deleteUserId); }}>Delete</Button>
                </>}>
                    <p>Are you sure?</p>
                </Modal>
            )}
            <div className='flex justify-between mt-4 items-center'>
                <div>
                    {/* Search is at top; keep this area for additional controls if needed */}
                </div>
                <div className='flex items-center gap-2'>
                    <Button onClick={() => { loadUsers(1); }} disabled={page <= 1}>First</Button>
                    <Button onClick={() => { if (page > 1) loadUsers(page - 1); }} disabled={page <= 1}>Prev</Button>
                    <div className='inline-flex items-center px-2'>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map(pn => (
                            <Button key={pn} variant={pn === page ? 'primary' : 'secondary'} onClick={() => loadUsers(pn)} className='mx-1' disabled={pn === page}>{pn}</Button>
                        ))}
                    </div>
                    <Button onClick={() => { if (page < totalPages) loadUsers(page + 1); }} disabled={page >= totalPages}>Next</Button>
                    <Button onClick={() => { loadUsers(totalPages); }} disabled={page >= totalPages}>Last</Button>
                    <span className='mx-2 text-sm text-gray-600'>Page {page} / {totalPages}</span>
                    <span className='mx-2 text-sm text-gray-600'>Total: {total}</span>
                </div>
            </div>
            {backfillConfirmOpen && (
                <Modal isOpen={backfillConfirmOpen} onClose={() => setBackfillConfirmOpen(false)} title='Run Backfill' actions={<>
                    <Button variant='secondary' onClick={() => setBackfillConfirmOpen(false)}>Cancel</Button>
                    <Button variant='primary' onClick={async () => {
                        setBackfillLoading(true);
                        try {
                            const res = await axios.post('/admin/backfill');
                            setBackfillConfirmOpen(false);
                            setBackfillLoading(false);
                            setAlert(`Backfill completed, updated ${res.data.updatedCount} documents`, 'success');
                            // optionally reload dashboard data if needed
                        } catch (err) {
                            console.error(err);
                            setBackfillLoading(false);
                            setAlert('Backfill failed', 'danger');
                        }
                    }} disabled={backfillLoading}>{backfillLoading ? 'Running...' : 'Run Backfill'}</Button>
                </>}> 
                    <p className='text-sm text-gray-700'>This will backfill missing document metadata (docRef, docRefShort, performedByName and eventId) for existing documents. This action is irreversible. Proceed?</p>
                </Modal>
            )}

            {showCreateModal && (
                <Modal isOpen={showCreateModal} title='Create User' onClose={() => setShowCreateModal(false)} actions={<>
                    <Button variant='secondary' onClick={() => setShowCreateModal(false)}>Close</Button>
                </>}>
                    <CreateUserForm onCreated={() => { setShowCreateModal(false); loadUsers(1); }} />
                </Modal>
            )}
            {/* User history modal */}
            {historyUserId && (
                <Modal isOpen={!!historyUserId} onClose={() => { setHistoryUserId(null); setHistoryLogs([]); }} title='Audit Log'>
                    <div className='max-h-96 overflow-auto'>
                        {loadingHistory ? (
                            <div className='py-6'><Spinner /></div>
                        ) : (
                            <ul>
                                {historyLogs.length === 0 ? <li className='text-sm text-gray-500'>No logs found.</li> : historyLogs.map(h => (
                                    <li key={h._id} className='mb-2 border-b pb-2'>
                                        <div className='text-sm text-gray-700'><strong>{h.action}</strong> by {h.performedBy?.username || 'system'}</div>
                                        <div className='text-xs text-gray-500'>{new Date(h.createdAt).toLocaleString()}</div>
                                        <div className='text-xs mt-1'>{JSON.stringify(h.details)}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Modal>
            )}
        </Container>
    );
}

export default AdminUsers;
