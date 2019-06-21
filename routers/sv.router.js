const router = require('express').Router();
const controller = require('../controllers/sv.controller');

router.get('/sv', controller.getAllSV);
router.delete('/sv/:MSSV', controller.removeSV);
router.post('/sv', controller.insertSV);

router.post('/sv/excel', controller.insertFromExcel);

router.post('/sv/removeAll', controller.removeAll);

router.get('/sv/download', controller.downloadCSV);

module.exports = router;
