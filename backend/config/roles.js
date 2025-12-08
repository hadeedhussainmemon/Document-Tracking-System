// Centralized role permissions for user creation
const rolePermissions = {
    'technical-admin': ['user', 'employee', 'manager', 'ceo', 'admin', 'technical-admin', 'hr'],
    'admin': ['user', 'employee', 'manager', 'ceo', 'hr'],
    'manager': ['employee', 'user'],
    'ceo': ['employee', 'user'],
    'hr': ['employee', 'user'],
    'employee': ['user'],
    'user': []
};

module.exports = rolePermissions;
