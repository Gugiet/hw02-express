// const { Contact } = require("../models/contact");
import Contact from "../models/contact";
// const { HttpError, ctrlWrapper } = require("../helpers");
import { HttpError, ctrlWrapper } from "../helpers";

const getAll = async (req, res) => {
  const result = await Contact.find({}, "-createdAt -updatedAt");
  return res.json(result);
};

const getById = async (req, res) => {
  const { id } = req.params;
  const result = await Contact.findById(id);
  if (!result) {
    throw HttpError(404, "contact not found");
  }
  return res.json(result);
};

const add = async (req, res) => {
  try {
    const result = await Contact.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    throw HttpError(400, "missing required fields");
  }
};

const updateById = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    throw HttpError(400, "missing fields");
  }

  const result = await Contact.findByIdAndUpdate(id, req.body);
  if (!result) {
    throw HttpError(404, "contact not found");
  }
  return res.json(result);
};

const updateFavorite = async (req, res) => {
  const { contactId } = req.params;
  const { favorite } = req.body;

  if (favorite === undefined) {
    throw HttpError(400, "missing field favorite");
  }

  const updatedContact = await updateStatusContact(contactId, { favorite });

  if (!updatedContact) {
    throw HttpError(404, "contact not found");
  }

  return res.json(updatedContact);
};

const updateStatusContact = async (contactId, updateFields) => {
  const updatedContact = await Contact.findByIdAndUpdate(
    contactId,
    updateFields,
    { new: true }
  );
  return updatedContact;
};

const deleteById = async (req, res) => {
  const { id } = req.params;
  const result = await Contact.findByIdAndDelete(id);
  if (!result) {
    throw HttpError(404, "contact not found");
  }
  return res.json({ message: "contact deleted" });
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  updateById: ctrlWrapper(updateById),
  updateFavorite: ctrlWrapper(updateFavorite),
  deleteById: ctrlWrapper(deleteById),
  updateStatusContact,
};
