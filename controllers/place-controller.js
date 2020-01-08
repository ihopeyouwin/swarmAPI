const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

let Dummy_Data = [
    {
        id: 'p1',
        title: 'char',
        description: 'a hell planet of smoke and fire',
        image: 'char.jpg',
        address: '1 Blizzard Way, Irvine, CA 92618, USA',
        location: {
            lat: 33.6580718,
            lng: -117.7693418
        },
        creator: 'u2'
    },
    {
        id: 'p2',
        title: 'korhal',
        description: 'a terran capital',
        image: 'korhal.jpg',
        address: '3100 Ocean Park Blvd, Santa Monica, CA 90405, USA',
        location: {
            lat: 34.019807,
            lng: -118.4546344
        },
        creator: 'u3'
    }
];

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place', 500);
        return next(error)
    }

    if (!place) {
        const error = new HttpError('Could not find a place for the provided id', 404);
        return next(error)
    }
    res.json({place: place.toObject({getters: true})});
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let places;
    try {
        places = await Place.find({creator: userId});
    } catch (err) {
        const error = new HttpError('Fetching places failed, plz try later', 500);
        return next(error)
    }

    if (!places || places.length === 0) {
        return next(new HttpError('Could not find places for the provided user id', 404));
    }
    res.json({places: places.map(place => place.toObject({getters: true}))});
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
          new HttpError('Invalid inputs passed, please check your data', 422)
        );
    }

    const {title, description, address, creator} = req.body;
    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error)
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://vignette.wikia.nocookie.net/starcraft/images/e/ee/Kaldir_SC2_Art3.jpg/revision/latest/scale-to-width-down/1000?cb=20120915203530',
        creator
    });
    try {
        await createdPlace.save();
    } catch (err) {
        const error = new HttpError(
          'Creating place failed, please check data',
          500
        );
        return next(error)
    }
    res.status(201).json({place: createdPlace})
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please check your data', 422)
    }

    const {title, description} = req.body;
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        return next(new HttpError('something went wrong, could not update place', 500));
    }

    place.title = title;
    place.description = description;
    try {
        await place.save();
    } catch (err) {
        return next(new HttpError('something went wrong, could not update place', 500));
    }
    res.status(200).json({place: place.toObject({getters: true})});
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    if (Dummy_Data.find(place => place.id === placeId)) {
        throw new HttpError('Could not find place with that id', 404)
    }
    Dummy_Data = Dummy_Data.filter(place => place.id !== placeId);
    res.status(200).json({message: 'Place was deleted.'})
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
