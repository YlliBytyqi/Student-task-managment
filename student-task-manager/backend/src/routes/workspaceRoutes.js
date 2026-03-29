const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

router.post('/', verifyToken, workspaceController.createWorkspace);
router.get('/', verifyToken, workspaceController.getAllWorkspaces);
router.get('/:id', verifyToken, workspaceController.getWorkspaceById);
router.put('/:id', verifyToken, workspaceController.updateWorkspace);
router.delete('/:id', verifyToken, authorizeRole('admin'), workspaceController.deleteWorkspace);

// Members Endpoints
router.get('/:id/members', verifyToken, workspaceController.getWorkspaceMembers);
router.post('/:id/members', verifyToken, workspaceController.addWorkspaceMember);
router.delete('/:id/members/:userId', verifyToken, workspaceController.removeWorkspaceMember);

module.exports = router;