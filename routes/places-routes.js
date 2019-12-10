const express = require('express');
const placesControllers = require('../controllers/place-controller');

const router = express.Router();

router.post('/', placesControllers.createPlace)
router.get('/:pid', placesControllers.getPlaceById);
router.get('/user/:uid', placesControllers.getPlacesByUserId);
router.patch('/:pid', placesControllers.updatePlace);
router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
