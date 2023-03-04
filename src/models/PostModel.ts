import { TagModel } from "./TagModel";

export type PostModel = {
  pid: string;
  authoremail: string;
  title: string;
  createdate: string;
  tags: TagModel[];
  isprivate?: boolean;
}