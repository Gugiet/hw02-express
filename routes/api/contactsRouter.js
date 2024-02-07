import express from "express";
const router = express.Router();

import { authenticateUser } from "../../middlewares/authMiddleware.js";
require("dotenv").config();
const secretKey = process.env.JWT_SECRET;

import {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} from "../../controllers/contactsController.js";

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", authenticateUser, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await getContactById(contactId);
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticateUser, async (req, res, next) => {
  const { body } = req;
  try {
    const newContact = await addContact(body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", authenticateUser, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const message = await removeContact(contactId);
    res.json({ message });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", authenticateUser, async (req, res, next) => {
  const { contactId } = req.params;
  const { body } = req;
  try {
    const updatedContact = await updateContact(contactId, body);
    res.json(updatedContact);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:contactId/favorite",
  authenticateUser,
  async (req, res, next) => {
    const { contactId } = req.params;
    const { body } = req;

    if (!body || typeof body.favorite === "undefined") {
      res.status(400).json({ message: "missing field favorite" });
      return;
    }

    try {
      const updatedContact = await updateStatusContact(contactId, body);
      res.json(updatedContact);
    } catch (error) {
      res.status(404).json({ message: "Not found" });
    }
  }
);

export default router;
