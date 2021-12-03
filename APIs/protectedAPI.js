const fs = require("fs");
const formidable = require("formidable");
const router = require("express").Router();

let { User, Post, Notification } = require("../Models");

const UNEXPECTED_ERROR = "Sorry, Something happened unexpectedly";
const ObjectId = require("mongoose").Types.ObjectId;

const {
  commentController,
  followController,
  likesController,
  notificationController,
  postsController,
  userController,
} = require("../Controllers");

let multer = require("multer");
const conversationController = require("../Controllers/conversationController");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/profileImages");
  },
  filename: function (req, file, cb) {
    let [filename, ext] = file.originalname.split(".");
    req.filename = `${req.user.email}.${ext}`;
    cb(null, req.filename);
  },
});

var upload = multer({ storage: storage });

var fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/postImages");
  },
  filename: function (req, file, cb) {
    let [filename, ext] = file.originalname.split(".");
    const id = Date.now();
    req.filename = `${id}.${ext}`;
    cb(null, req.filename);
  },
});

var fileUpload = multer({ storage: fileStorage });

const isArray = (value) => Array.isArray(value);

const postFilesUpload = (req, res, next) => {
  const formData = formidable({
    uploadDir: "./public/postImages",
    keepExtensions: true,
    multiples: true,
  });
  formData.parse(req, (err, fields, files) => {
    if (err) {
      throw err;
      return;
    } else {
      const attachments = files.attachments;
      const images = files.images;
      const attachmentNames = (
        attachments ? (isArray(attachments) ? attachments : [attachments]) : []
      ).map((file) => ({
        filename: file.path.split("\\")[2],
        originalFilename: file.name,
      }));
      console.log("files", files.attachments, files.images);
      const imageNames = (
        images ? (isArray(images) ? images : [images]) : []
      ).map((file) => file.path.split("\\")[2]);
      req.attachmentNames = attachmentNames;
      req.imageNames = imageNames;
      req.body = fields;
      next();
    }
  });
};

router.post("/posts", postFilesUpload, postsController.addPost);
router.get("/timelinePosts", postsController.getTimelinePosts);
router.get("/profile/:id", postsController.getProfileInformation);
router.get("/post/:id", postsController.getPostById);

router.post("/likes", likesController.likePost);
router.delete("/likes", likesController.unlikePost);

router.post("/comments", commentController.commentOnPost);
router.delete("/comments", commentController.deleteCommentFromPost);

router.post("/follow", followController.follow);
router.delete("/follow", followController.unfollow);

router.post("/fetchNames", userController.fetchNames);
router.post(
  "/updateProfileImage",
  upload.any(),
  userController.updateProfileImage
);

router.get("/notifications", notificationController.getNotifications);
router.get(
  "/getUnseenNotificationsCount",
  notificationController.getUnseenNotificationsCount
);
router.get("/seeNotifications", notificationController.seeNotifications);

router.post("/conversations", conversationController.startConversation);
router.get("/conversations", conversationController.getConversationsOfUser);
router.get("/conversations/:id", conversationController.getConversationById);
router.post("/conversations/more", conversationController.fetchMorePeople);

router.get("/logout", userController.logout);

module.exports = router;
