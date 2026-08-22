const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employeeController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles');
fs.mkdirSync(profilesDir, { recursive: true });

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		fs.mkdirSync(profilesDir, { recursive: true });
		cb(null, profilesDir);
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
		cb(null, unique);
	}
});

const upload = multer({ storage });

const uploadFields = upload.fields([
	{ name: 'profile_pic', maxCount: 1 },
	{ name: 'aadhaar_file', maxCount: 1 },
	{ name: 'pan_file', maxCount: 1 },
	{ name: 'certificate_file', maxCount: 1 }
]);

router.post('/upload', upload.single('profile_pic'), (req, res) => {
	if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
	const publicUrl = `/uploads/profiles/${req.file.filename}`;
	res.json({ success: true, filename: req.file.filename, url: publicUrl });
});

router.get('/hrs/list', ctrl.listHRs);
router.post('/hrs/set-primary', ctrl.setPrimaryHR);
router.post('/hrs/remove', ctrl.removeHRStatus);

router.get('/', ctrl.list);
router.post('/', uploadFields, ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id/skills', ctrl.updateSkills);
router.put('/:id', uploadFields, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
