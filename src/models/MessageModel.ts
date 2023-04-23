export type MessageModel = {
  content: string;
  sender?: string;
  time: Date;
  mid: number;
  authorusername: string;
  editdate?: Date;
  shouldSpeak?: boolean;
  justSent?: boolean;
  sendernickname?: string;
  isLoading?: boolean;
}