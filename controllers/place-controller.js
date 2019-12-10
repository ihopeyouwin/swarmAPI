const HttpError = require('../models/http-error');
const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location');

let Dummy_Data = [
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
  res.json({ place: place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = Dummy_Data.filter(place => {
    return place.creator === userId;
  });
  if (!places || places.length === 0) {
    return next(new HttpError('Could not find places for the provided user id', 404));
  }
  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new HttpError('Invalid inputs passed, please check your data', 422));
  }

  const { title, description, address, creator } = req.body;
  let coordinates;
  try{
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error)
  }

  const createdPlace = {
    id: uuid(), title, description, location: coordinates, address, creator
  };
  Dummy_Data.push(createdPlace);
  res.status(201).json({ place: createdPlace })
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data', 422)
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  const updatedPlace = { ...Dummy_Data.find(place => place.id === placeId) };
  const placeIndex = Dummy_Data.findIndex(place => place.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;
  Dummy_Data[placeIndex] = updatedPlace;
  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (Dummy_Data.find(place => place.id === placeId)) {
    throw new HttpError('Could not find place with that id', 404)
  }
  Dummy_Data = Dummy_Data.filter(place => place.id !== placeId);
  res.status(200).json({ message: 'Place was deleted.' })
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
