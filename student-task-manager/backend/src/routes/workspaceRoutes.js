const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, workspaceController.createWorkspace);
router.get('/', verifyToken, workspaceController.getAllWorkspaces);
router.get('/all', verifyToken, workspaceController.getAllSystemWorkspaces);
router.get('/single/:id', verifyToken, workspaceController.getWorkspaceById);
router.put('/:id', verifyToken, workspaceController.updateWorkspace);
router.delete('/:id', verifyToken, workspaceController.deleteWorkspace);

router.get('/:id/members', verifyToken, workspaceController.getWorkspaceMembers);
router.post('/:id/members', verifyToken, workspaceController.addWorkspaceMember);
router.delete('/:id/members/:userId', verifyToken, workspaceController.removeWorkspaceMember);

module.exports = router;