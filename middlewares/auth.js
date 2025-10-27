const auth = {
    checkLoginSession: (req, res, next) => {
        if (!req.session.username) {
            // Store the URL the user was trying to access if it's not the login page
            if (req.originalUrl !== '/auth/login') {
                req.session.returnTo = req.originalUrl;
            }
            res.redirect('/auth/login');
        } else {
            next();
        }
    },

    checkAdmin: (req, res, next) => {
        if (!req.session || !req.session.username) {
            res.redirect('/auth/login');
        } else if (req.session.role !== 'admin') {
            res.status(403).render('error', { 
                message: 'Access Denied', 
                error: { status: 403, stack: 'You need admin privileges to access this page' }
            });
        } else {
            next();
        }
    }
};

module.exports = auth;
