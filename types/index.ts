import Express from "express";

type Abstract = {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

export type User = Abstract & {
  name: string;
  email: string;
  password: string;
  bio: string;
  followers: string[];
  following: string[];
  profileImage: String;
};

export type Comment = Abstract & {
  comment: string;
  commenter: string;
};

export type File = Abstract & {
  filename: string;
  originalFilename: string;
};

export type Post = Abstract & {
  postText: string;
  userId: string;
  comments: Comment[];
  likes: string[];
  files: File[];
  images: string[];
  hidden: boolean;
};

export type Notification = Abstract & {
  action: "liked" | "commented" | "followed"; // liked | commented | followed
  doer: string;
  reciever: string;
  postId: string;
  seen: boolean;
};

export type Message = Abstract & {
  sentBy: string;
  text: string;
  seen: boolean;
};

export type Conversation = Abstract & {
  participants: string[];
  messages: Message[];
};

export interface ServerRequest extends Express.Request {
  user: User;
}

export type APIFunction = (req: ServerRequest, res: Express.Response) => void;
