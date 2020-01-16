const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');
const mongoose = require('mongoose');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

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
    let user;
    try {
        user = await User.findById(creator)
    } catch (err) {
        return next(new HttpError('creating place failed, try again', 500));
    }
    if (!user) {
        return next(new HttpError('could not find user for provided id', 404));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess});
        user.places.push(createdPlace);
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError('Creating place failed, please check data', 500));
    }

    res.status(201).json({place: createdPlace})
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
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

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator')
    } catch (err) {
        return next(new HttpError('something went wrong, could not find place with that id', 500));
    }

    if(!place) {
        return next(new HttpError('the place with such an id does not exist', 404));
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await place.remove({session});
        place.creator.places.pull(place);
        await place.creator.save({session});
        await session.commitTransaction()
    } catch (err) {
        return next(new HttpError('something went wrong, could not delete place with that id', 500));
    }
    res.status(200).json({message: 'Place was deleted.'})
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
