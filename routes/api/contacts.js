// import express from "express";

import ctrl from "../../controllers/contacts.js";

import { validateBody, isValidId } from "../../middlewares";

import schemas from "../../models/contact.js";

import router from "express.Router";

router.get("/", ctrl.getAll);

router.get("/:id", isValidId, ctrl.getById);

router.post("/", validateBody(schemas.addSchema), ctrl.add);

router.put("/:id", isValidId, validateBody(schemas.addSchema), ctrl.updateById);

router.patch(
  "/:id/favorite",
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  ctrl.updateFavorite
);

router.delete("/:id", isValidId, ctrl.deleteById);

export { router };
