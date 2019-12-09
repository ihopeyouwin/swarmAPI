const HttpError = require('../models/http-error');

const Dummy_Data = [
    {
        id: 'p1', title: 'elsewhere', description: 'dick',
        location: {
            lat: 40.1203,
            lng: 28.1203
        },
        address: 'some street',
        creator: 'u1'
    }
];

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = Dummy_Data.find(place => {
        return place.id === placeId
    });
    if (!place) {
        throw new HttpError('Could not find a place for the provided id', 404);
    }
    res.json({place: place});
};

const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const place = Dummy_Data.find(place => {
        return place.creator === userId;
    });
    if (!place) {
        return next(new HttpError('Could not find a place for the provided user id', 404));
    }
    res.json({place});
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;