import { get, set } from "idb-keyval";
import { PostModel } from "../models/PostModel";

const _secretKey = 3;

const encrypt = (str: string, key: number): string => {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = (str.charCodeAt(i) + key) % 256;
    result += String.fromCharCode(charCode);
  }
  return result;
};

const decrypt = (str: string, key: number): string => {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = (str.charCodeAt(i) - key + 256) % 256;
    result += String.fromCharCode(charCode);
  }
  return result;
};

export const removePostsFromCache = async (authoremail: string) => {
  const cacheKey = `posts-${authoremail}`;
  await set(cacheKey, null);
};

export const setPostsToCache = async (
  authoremail: string,
  posts: PostModel[]
) => {
  const cacheKey = `posts-${authoremail}`;
  const postsJson = JSON.stringify(posts);
  const postsUri = encodeURIComponent(postsJson);
  const postsEncrypted = encrypt(postsUri, _secretKey);
  await set(cacheKey, postsEncrypted);
};

export const getPostsFromCache = async (authoremail: string) => {
  const cacheKey = `posts-${authoremail}`;
  const postsEncrypted = await get(cacheKey);
  if (postsEncrypted) {
    try {
      const postsJson = decrypt(postsEncrypted as string, _secretKey);
      const postsUri = decodeURIComponent(postsJson);
      const posts = JSON.parse(postsUri);
      return posts as PostModel[];
    } catch (e) {
      console.error(e);
      return null;
    }
  } else {
    return null;
  }
};
