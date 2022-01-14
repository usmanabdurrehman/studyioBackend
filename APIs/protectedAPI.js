const formidable = require("formidable");
const router = require("express").Router();

const {
  commentController,
  followController,
  likesController,
  notificationController,
  postsController,
  userController,
} = require("../Controllers");

const conversationController = require("../Controllers/conversationController");

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

router.post("/posts", postFilesUpload, postsController.addPost);
router.delete("/posts", postsController.deletePost);
router.put("/posts", postFilesUpload, postsController.updatePost);

router.put("/hidePost", postsController.hidePost);
router.put("/unhidePost", postsController.unhidePost);
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
  profilePicUpload,
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
router.get(
  "/getAllConversationsUnseenMessagesCount",
  conversationController.getAllConversationsUnseenMessagesCount
);
router.post(
  "/getConversationsUnseenMessagesCountById",
  conversationController.getConversationsUnseenMessagesCountById
);
router.post("/seeConversation", conversationController.seeConversation);

router.get("/logout", userController.logout);

module.exports = router;
