import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import axios from 'axios';

const ForwardModal = ({ isOpen, onClose, onConfirm }) => {
    const [heads, setHeads] = useState([]);
    const [selected, setSelected] = useState('');

    useEffect(() => {
        const fetchHeads = async () => {
            try {
                const res = await axios.get('/users/heads');
                setHeads(res.data.users || []);
            } catch (err) { console.error(err); }
        };
        if (isOpen) fetchHeads();
    }, [isOpen]);

    const submit = () => {
        if (!selected) return;
        onConfirm(selected);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Forward Document">
            <div className="mb-4">
                        <label htmlFor="forward_to" className="block text-gray-700 text-sm font-bold mb-2">Forward to</label>
                        <select id="forward_to" aria-label="Forward to head" value={selected} onChange={e => setSelected(e.target.value)} className="w-full border rounded p-2">
                    <option value="">Select head</option>
                    {heads.map(h => (
                        <option key={h._id} value={h._id}>{h.fullName || h.username} ({h.role})</option>
                    ))}
                </select>
            </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={submit} disabled={!selected}>Forward</Button>
            </div>
        </Modal>
    );
};

export default ForwardModal;
