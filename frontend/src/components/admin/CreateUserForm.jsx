import React, { useState, useContext, useMemo } from 'react';
import roleAllowances from '../../utils/roles';

import AuthContext from '../../context/AuthContext';
import Button from '../ui/Button';
import AlertContext from '../../context/alert/AlertContext';

const CreateUserForm = ({ onCreated } ) => {
    const { createUserByAdmin, user } = useContext(AuthContext);
    const alertContext = useContext(AlertContext);
    const { setAlert } = alertContext;

    const [formData, setFormData] = useState({ username: '', password: '', role: 'employee', fullName: '' });

    // Allowed roles by creator role (mirror backend)
    

    const roles = useMemo(() => roleAllowances[user?.role] || [], [user?.role]);

    // Ensure default role aligns with allowed roles for the current user
    React.useEffect(() => {
        if (roles.length > 0 && !roles.includes(formData.role)) {
            setFormData(prev => ({ ...prev, role: roles[0] }));
        }
    }, [roles, formData.role]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        const { username, password, role, fullName } = formData;

        const res = await createUserByAdmin({ username, password, role, fullName });
        if (res.success) {
            setAlert('User created successfully', 'success');
            setFormData({ username: '', password: '', role: roles[0] || 'employee', fullName: '' });
                if (onCreated) onCreated();
        } else {
            setAlert(res.error || 'Failed to create user', 'danger');
        }
    };

    if (!user || roles.length === 0) return null;

    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <h3 className="text-lg font-semibold mb-3">Create User (Admin)</h3>
            <input name="username" value={formData.username} onChange={onChange} type="text" placeholder="Username" className="w-full border rounded p-2" required />
            <input name="fullName" value={formData.fullName} onChange={onChange} type="text" placeholder="Full name" className="w-full border rounded p-2" />
            <input name="password" value={formData.password} onChange={onChange} type="password" placeholder="Password" className="w-full border rounded p-2" required minLength={6} />
            <select name="role" value={formData.role} onChange={onChange} className="w-full border rounded p-2">
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div>
                <Button type="submit">Create User</Button>
            </div>
        </form>
    );
};

export default CreateUserForm;
