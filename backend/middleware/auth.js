import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      roles: decoded.roles
    };
    req.userId = decoded.id; // для обратной совместимости
    req.userRoles = decoded.roles; // для обратной совместимости
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Неверный токен' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRoles) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const hasRole = roles.some(role => req.userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    next();
  };
};
