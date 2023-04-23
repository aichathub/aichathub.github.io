import { MessageModel } from "./MessageModel";

export const DummyMessageModel = {
  content: "",
  sender: "",
  time: new Date(),
  mid: 0,
  authorusername: "",
  editdate: new Date(),
  shouldSpeak: false,
  justSent: false,
  sendernickname: "",
} as MessageModel;
