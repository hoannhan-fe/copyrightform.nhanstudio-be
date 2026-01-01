// Role-based authorization middleware

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    
    // Me role has all permissions
    if (userRole === 'Me') {
      return next();
    }

    // Check if user role is in allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}

// Check if user owns the resource
export function checkOwnership(getResourceOwnerId) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    
    // Me and Admin can access any resource
    if (userRole === 'Me' || userRole === 'Admin') {
      return next();
    }

    // Get resource owner ID
    const ownerId = getResourceOwnerId(req);
    
    // User can only access own resources
    if (userRole === 'User' && ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own resources'
      });
    }

    // Customer cannot modify resources
    if (userRole === 'Customer') {
      return res.status(403).json({
        success: false,
        message: 'Customers cannot modify resources'
      });
    }

    next();
  };
}


