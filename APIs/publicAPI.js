const router = require("express").Router();

let multer = require("multer");

let { userController } = require("../Controllers");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/profileImages");
  },
  filename: function (req, file, cb) {
    let [filename, ext] = file.originalname.split(".");
    req.filename = `${req.body.email}.${ext}`;
    cb(null, req.filename);
  },
});

var upload = multer({ storage: storage });

router.post("/signin", userController.signin);
router.post("/signup", upload.any(), userController.signup);

module.exports = router;
