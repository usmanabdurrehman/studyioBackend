const router = require("express").Router();
import formidable from "formidable";

import { userController } from "../Controllers";
import cloudinary from "cloudinary";

const profilePicUpload = (req, res, next) => {
  const formData = formidable();
  formData.parse(req, async (err, fields, files) => {
    if (err) {
      throw err;
    } else {
      const result = await cloudinary.uploader.upload(files.image.path);
      req.image = result.secure_url;
      req.body = fields;
      next();
    }
  });
};

router.post("/signin", userController.signin);
router.post("/signup", profilePicUpload, userController.signup);

export { router };
