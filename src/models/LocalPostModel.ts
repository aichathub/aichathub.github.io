import { MessageModel } from "./MessageModel";

export type LocalPostModel = {
  title: string;
  id: string;
  messages: MessageModel[];
  summary: string;
}