const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden. You do not have permission.' });
        }

        next();
    };
};

module.exports = authorizeRole;