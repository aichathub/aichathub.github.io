import { PostModel } from "./PostModel";

export const DummyPostModel = {
  pid: "",
  title: "",
  createdate: new Date().toISOString(),
  username: "",
} as PostModel;