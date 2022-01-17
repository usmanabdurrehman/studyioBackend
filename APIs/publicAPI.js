const router = require("express").Router();
const formidable = require("formidable");

const { userController } = require("../Controllers");

const cloudinary = require("cloudinary");

const profilePicUpload = (req, res, next) => {
  const formData = formidable();
  formData.parse(req, async (err, fields, files) => {
    if (err) {
      throw err;
      return;
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

module.exports = router;
