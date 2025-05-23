const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Nav autorizācijas tokena' });

    jwt.verify(token, 'TAVA_SLEPENA_ATSLĒGA', (err, user) => {
        if (err) return res.status(403).json({ message: 'Tokena kļūda' });

        req.user = user; // { id: ... }
        next();
    });
};
