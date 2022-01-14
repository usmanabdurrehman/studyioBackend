const router = require("express").Router();
const formidable = require("formidable");

let { userController } = require("../Controllers");

const profilePicUpload = (req, res, next) => {
  const formData = formidable({
    uploadDir: "./public/profileImages",
    keepExtensions: true,
  });
  formData.parse(req, (err, fields, files) => {
    if (err) {
      throw err;
      return;
    } else {
      const image = files.image;
      req.image = image.path.split("\\")[2];
      req.body = fields;
      next();
    }
  });
};

router.post("/signin", userController.signin);
router.post("/signup", profilePicUpload, userController.signup);

module.exports = router;
