import formidable from "formidable";
import express from "express";
const router = express.Router();

import {
  commentsController,
  followController,
  likesController,
  notificationController,
  postsController,
  userController,
  conversationController,
} from "../Controllers/index.js";

import cloudinary from "cloudinary";

const arrayTransform = <T>(value: T | T[]): T[] => {
  const isArray = Array.isArray(value);
  return value ? (isArray ? value : [value]) : [];
};

const streamUpload = (path: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      path,
      { resource_type: "auto" },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
  });
};

const postFilesUpload = (req: any, res: any, next: any) => {
  const formData = formidable({
    multiples: true,
    keepExtensions: true,
  });
  formData.parse(req, async (err, fields, files: any) => {
    if (err) {
      throw err;
    } else {
      try {
        const attachments = files.attachments;
        const images = files.images;
        const imageUploadPromises = arrayTransform(images).map((image) =>
          streamUpload(image.path)
        );
        const imageResults = (await Promise.all(imageUploadPromises)) as {
          secure_url: string;
        }[];
        const imageUrls = imageResults.map((result) => result.secure_url);

        const attachmentUploadPromises = arrayTransform(attachments).map(
          (attachment) => streamUpload(attachment.path)
        );
        const attachmentResults = (await Promise.all(
          attachmentUploadPromises
        )) as { secure_url: string }[];
        const attachmentUrls = attachmentResults.map((result, index) => ({
          filename: result.secure_url,
          originalFilename: attachments[index].name,
        }));

        req.attachmentNames = attachmentUrls;
        req.imageNames = imageUrls;
        req.body = fields;
        next();
      } catch (err) {}
    }
  });
};

const profilePicUpload = (req: any, res: any, next: any) => {
  const formData = formidable();
  formData.parse(req, async (err, fields, files: any) => {
    if (err) {
      throw err;
      return;
    } else {
      const result = await cloudinary.v2.uploader.upload(files.image.path);
      req.image = result.secure_url;
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

router.post("/comments", commentsController.commentOnPost);
router.delete("/comments", commentsController.deleteCommentFromPost);

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

export default router;
