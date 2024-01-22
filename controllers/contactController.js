const { listContacts, getContactById, removeContact, addContact, updateContact } = require('../models/contacts');
const { contactSchema } = require('../validators/contactValidator');
const HttpError = require("./HttpError");
const ctrlWrapper = require('./ctrlWrapper');

const getContacts = async (req, res) => {

    const contacts = await listContacts();
    res.json(contacts);
  
};

const getContact = async (req, res) => {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);

    if (!contact) {
      throw HttpError(404, 'Not Found')}
      res.json(contact);
  
};

const createContact = async (req, res) => {
  try {
    const { body } = req;
    const newContact = await addContact(body);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(400).json({ message: 'missing required name field' });
  }
};

const deleteContact = async (req, res) => {
    const { contactId } = req.params;
    const result = await removeContact(contactId);

    if (result) {
      res.json({ message: 'contact deleted' });
    } else {
      throw HttpError(404, 'Not Found');
    }
   
};

const updateContactInfo = async (req, res) => {
  
    const { error } = contactSchema.validate(req.body);

    if (error) {
      throw HttpError(400, 'missing fields');
    }

    const { contactId } = req.params;
    const updatedContact = await updateContact(contactId, req.body);

    if (!updatedContact) {
      throw HttpError(404, 'Not Found');
    }

    res.json(updatedContact);
  
};

module.exports = {
  getContacts: ctrlWrapper(getContacts),
  getContact: ctrlWrapper(getContact),
  createContact,
  deleteContact: ctrlWrapper(deleteContact),
  updateContactInfo: ctrlWrapper(updateContactInfo),
};
