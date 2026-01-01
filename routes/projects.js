import express from 'express';
import jwt from 'jsonwebtoken';
import Project from '../models/Project.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

// Check permissions
function checkPermission(requiredRoles = []) {
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

    // Check if user role is in required roles
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}

// Get all projects (Public - Customer can view)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('createdBy', 'firstName lastName email');
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects'
    });
  }
});

// Get single project (Public - Customer can view)
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('createdBy', 'firstName lastName email');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project'
    });
  }
});

// Create project (Me, Admin, User can create)
router.post('/', authenticateToken, checkPermission(['Me', 'Admin', 'User']), async (req, res) => {
  try {
    const { title, description, image, date, technologies, link } = req.body;

    // Validation
    if (!title || !description || !date) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and date are required'
      });
    }

    const projectData = {
      title: title.trim(),
      description: description.trim(),
      image: image || '',
      date: date.trim(),
      technologies: Array.isArray(technologies) 
        ? technologies 
        : (technologies || '').split(',').map(t => t.trim()).filter(t => t),
      link: link || '',
      createdBy: req.user.userId
    };

    const project = new Project(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project'
    });
  }
});

// Update project (Me, Admin can update any; User can update own)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const userRole = req.user.role;
    const isOwner = project.createdBy.toString() === req.user.userId;

    // Me and Admin can update any project
    if (userRole !== 'Me' && userRole !== 'Admin') {
      // User can only update own projects
      if (userRole === 'User' && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own projects'
        });
      }
      // Customer cannot update
      if (userRole === 'Customer') {
        return res.status(403).json({
          success: false,
          message: 'Customers cannot update projects'
        });
      }
    }

    const { title, description, image, date, technologies, link, images, descriptions, contentTimeline } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (image !== undefined) updateData.image = image;
    if (date !== undefined) updateData.date = date.trim();
    if (technologies !== undefined) {
      updateData.technologies = Array.isArray(technologies) 
        ? technologies 
        : (technologies || '').split(',').map(t => t.trim()).filter(t => t);
    }
    if (link !== undefined) updateData.link = link;
    if (images !== undefined) updateData.images = images;
    if (descriptions !== undefined) updateData.descriptions = descriptions;
    if (contentTimeline !== undefined) updateData.contentTimeline = contentTimeline;

    Object.assign(project, updateData);
    const updatedProject = await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project'
    });
  }
});

// Delete project (Me, Admin can delete any; User can delete own)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const userRole = req.user.role;
    const isOwner = project.createdBy.toString() === req.user.userId;

    // Me and Admin can delete any project
    if (userRole !== 'Me' && userRole !== 'Admin') {
      // User can only delete own projects
      if (userRole === 'User' && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own projects'
        });
      }
      // Customer cannot delete
      if (userRole === 'Customer') {
        return res.status(403).json({
          success: false,
          message: 'Customers cannot delete projects'
        });
      }
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project'
    });
  }
});

export default router;

