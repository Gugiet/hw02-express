const express = require('express');
const router = express.Router();
const controllers = require('../../controllers');

router.get('/', controllers.contacts.getContacts);
router.get('/:contactId', controllers.contacts.getContact);
router.post('/', controllers.contacts.createContact);
router.delete('/:contactId', controllers.contacts.deleteContact);
router.put('/:contactId', controllers.contacts.updateContactInfo);

module.exports = router;
