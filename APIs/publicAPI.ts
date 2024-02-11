import express from "express";

const router = express.Router();
import formidable from "formidable";

import { userController } from "../Controllers/index.js";
import cloudinary from "cloudinary";

const profilePicUpload: any = (req: any, res: any, next: any) => {
  const formData = formidable();
  formData.parse(req, async (err, fields, files: any) => {
    if (err) {
      throw err;
    } else {
      // TODO: Add integration for profile pic upload
      // if (!files?.image?.path) return next();
      // const result = await cloudinary.v2.uploader.upload(files?.image?.path);
      // req.image = result.secure_url;
      req.body = fields;
      next();
    }
  });
};

router.post("/signin", userController.signin);
router.post("/signup", profilePicUpload, userController.signup);

export default router;
