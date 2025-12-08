import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

const CloseModal = ({ isOpen, onClose, onConfirm }) => {
    const [message, setMessage] = useState('');
    const submit = () => {
        if (!message.trim()) return;
        onConfirm(message.trim());
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title='Close Document'>
            <div>
                        <label htmlFor="closing_message" className='block text-gray-700 text-sm font-bold mb-2'>Closing message (conclusion)</label>
                        <textarea id="closing_message" aria-label="Closing message" className='w-full border rounded p-2' rows={4} value={message} onChange={e => setMessage(e.target.value)} />
            </div>
                    <div className='flex flex-col sm:flex-row justify-end gap-2 mt-3'>
                <Button variant='secondary' onClick={onClose}>Cancel</Button>
                <Button variant='primary' onClick={submit} disabled={!message.trim()}>Close Document</Button>
            </div>
        </Modal>
    );
};

export default CloseModal;
