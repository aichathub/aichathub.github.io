import { set } from "idb-keyval";
import { MessageModel } from "../models/MessageModel";
import { PostModel } from "../models/PostModel";
import { TagModel } from "../models/TagModel";
import {
  LLAMA_70B_API,
  PYTHON_RUNTIME_API,
  backendServer,
} from "../util/constants";
import { getPostsFromCache, setPostsToCache } from "./cache";

export const verify = async (authObj: object) => {
  const response = await fetch(`${backendServer}/verify/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify(authObj),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getPostByUsernameAndPid = async (
  username: string,
  pid: string,
  token = ""
) => {
  const response = await fetch(`${backendServer}/api/post/${username}/${pid}`, {
    method: "GET",
    mode: "cors",
    headers: {
      Authorization: token,
    },
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getMessagesByUsernameAndPid = async (
  username: string,
  pid: string,
  token = ""
) => {
  const response = await fetch(
    `${backendServer}/api/messages/${username}/${pid}`,
    {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: token,
      },
    }
  );
  const responseJson = await response.json();
  return responseJson;
};

export const getMessagesByUsernameAndPidAndSessionid = async (
  username: string,
  pid: string,
  sessionid: string
) => {
  const response = await fetch(
    `${backendServer}/api/messages/${username}/${pid}/${sessionid}`,
    {
      method: "GET",
      mode: "cors",
    }
  );
  const responseJson = await response.json();
  return responseJson;
};

export const insertSessionMessage = async (insertMsgObj: {
  username: string;
  pid: string;
  content: string;
  sessionid: string;
}) => {
  const response = await fetch(`${backendServer}/api/insert/sessionmessages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify(insertMsgObj),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const insertMessage = async (insertMsgObj: {
  username: string;
  pid: string;
  content: string;
  token: string;
  triggerAI: boolean;
  authoremail: string;
  socketId?: string;
  triggerUserModel?: boolean;
  sendernickname?: string;
  triggerPython?: boolean;
}) => {
  const response = await fetch(`${backendServer}/api/insert/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify(insertMsgObj),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const findPostsByAuthoremail = async (authoremail: string) => {
  console.log("findPostsByAuthoremail");
  // Check if the result is cached in indexedDB
  const cachedResult = await getPostsFromCache(authoremail);

  if (cachedResult) {
    return { message: "SUCCESS", result: cachedResult };
  }
  const response = await fetch(`${backendServer}/api/retrieve/posts`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: authoremail }),
  });
  const responseJson = (await response.json()) as {
    message: string;
    result: PostModel[];
  };
  // Cache the result to indexedDB
  if (responseJson.message === "SUCCESS") {
    await setPostsToCache(authoremail, responseJson.result);
  }

  return responseJson;
};

export const deletePostByUsernameAndPid = async (
  username: string,
  pid: string,
  token: string
) => {
  // Clear the cache
  await set(`posts-${username}`, null);
  const response = await fetch(`${backendServer}/api/delete/post/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({ username: username, pid: pid, token: token }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const deleteMessageByMid = async (
  mid: number,
  token: string,
  username: string
) => {
  const response = await fetch(`${backendServer}/api/delete/message/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({ mid: mid, token: token, username: username }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const insertPostByUsernameAndTitle = async (
  username: string,
  title: string,
  token: string,
  tags: TagModel[],
  isprivate: boolean
) => {
  // Clear the cache
  await set(`posts-${username}`, null);
  const postTitleLengthLimit = 50;
  if (title.length > postTitleLengthLimit) {
    title = title.substring(0, postTitleLengthLimit) + "...";
  }
  const response = await fetch(`${backendServer}/api/insert/post/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      username: username,
      title: title,
      token: token,
      tags: tags,
      isprivate: isprivate,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const updatePost = async (post: PostModel, token: string) => {
  const response = await fetch(`${backendServer}/api/update/post/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({ ...post, token: token }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const searchPostsByKeyword = async (
  keyword: string,
  auth?: {
    username: string;
    token: string;
  }
) => {
  let headers = {
    "Content-Type": "application/json",
  };
  if (auth) {
    headers = { ...headers, ...auth };
  }
  const response = await fetch(`${backendServer}/api/search/${keyword}`, {
    method: "GET",
    headers: headers,
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
};

export const searchPostsByTag = async (tag: string) => {
  const response = await fetch(`${backendServer}/api/search/tag/${tag}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getRecommendations = async (username: string) => {
  const response = await fetch(`${backendServer}/api/recommend/${username}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getUsernameByEmail = async (email: string) => {
  const response = await fetch(`${backendServer}/api/username/${email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getStarCount = async (username: string, pid: string) => {
  if (username === "" || pid === "") return Promise.resolve({ result: 0 });
  const response = await fetch(
    `${backendServer}/api/starcount/${username}/${pid}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
    }
  );
  const responseJson = await response.json();
  return responseJson;
};

export const getStarredPosts = async (username: string) => {
  // const response = await fetch(`${backendServer}/api/retrieve/starredpost`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json"
  //   },
  //   mode: "cors",
  //   body: JSON.stringify({
  //     username: username,
  //   })
  // });
  // const responseJson = await response.json();
  // console.log(responseJson, "starred post responseJson");
  // return responseJson;
};

export const isStarred = async (
  username: string,
  authorusername: string,
  pid: string
) => {
  const response = await fetch(`${backendServer}/api/isstarred`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      username: username,
      authorusername: authorusername,
      pid: pid,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const starPost = async (
  authorusername: string,
  pid: string,
  useremail: string,
  token: string
) => {
  const response = await fetch(`${backendServer}/api/star`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      authorusername: authorusername,
      useremail: useremail,
      pid: pid,
      token: token,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const unstarPost = async (
  authorusername: string,
  pid: string,
  useremail: string,
  token: string
) => {
  const response = await fetch(`${backendServer}/api/unstar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      authorusername: authorusername,
      useremail: useremail,
      pid: pid,
      token: token,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getGeneratedSessionid = async (username: string, pid: string) => {
  const response = await fetch(
    `${backendServer}/api/${username}/${pid}/createsession`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
    }
  );
  const responseJson = await response.json();
  return responseJson;
};

export const getTags = async () => {
  const response = await fetch(`${backendServer}/api/tags`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
};

export const likeMessage = async (
  messageid: number,
  useremail: string,
  token: string
) => {
  const response = await fetch(`${backendServer}/api/likemessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const unlikeMessage = async (
  messageid: number,
  useremail: string,
  token: string
) => {
  const response = await fetch(`${backendServer}/api/unlikemessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const dislikeMessage = async (
  messageid: number,
  useremail: string,
  token: string
) => {
  const response = await fetch(`${backendServer}/api/dislikemessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const undislikeMessage = async (
  messageid: number,
  useremail: string,
  token: string
) => {
  const response = await fetch(`${backendServer}/api/undislikemessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getLikeCount = async (messageid: number) => {
  const response = await fetch(`${backendServer}/api/likecount/${messageid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getDislikeCount = async (messageid: number) => {
  const response = await fetch(
    `${backendServer}/api/dislikecount/${messageid}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
    }
  );
  const responseJson = await response.json();
  return responseJson;
};

export const isLiked = async (
  messageid: number,
  useremail: string,
  token: string
) => {
  const response = await fetch(`${backendServer}/api/isliked`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const isDisliked = async (
  messageid: number,
  useremail: string,
  token: string
) => {
  const response = await fetch(`${backendServer}/api/isdisliked`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const editMessage = async (
  messageid: number,
  useremail: string,
  token: string,
  message: string
) => {
  const response = await fetch(`${backendServer}/api/editmessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token,
      message: message,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const forkPost = async (
  authorusername: string,
  pid: string,
  useremail: string,
  token: string,
  endMsgId?: number
) => {
  const response = await fetch(`${backendServer}/api/fork`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      authorusername: authorusername,
      useremail: useremail,
      pid: pid,
      token: token,
      endMsgId: endMsgId,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getTodayAIUsage = async (username: string, token: string) => {
  const response = await fetch(`${backendServer}/api/todayaiusage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      username: username,
      token: token,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getDailyAILimit = async () => {
  const response = await fetch(`${backendServer}/api/getdailyailimit`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
};

export const loginWithGoogle = async (idToken: string) => {
  const response = await fetch(`${backendServer}/api/googlelogin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      idToken: idToken,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const signupWithGoogle = async (idToken: string, username: string) => {
  const response = await fetch(`${backendServer}/api/googlesignup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      idToken: idToken,
      username: username,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getCustomModelName = async (api: string) => {
  const url = `${api}/v1/model`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson.result as string;
};

export const pythonReply = async (
  pid: string,
  username: string,
  token: string,
  content: string
) => {
  const response = await fetch(`${backendServer}/api/pythonreply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      pid: pid,
      username: username,
      token: token,
      content: content,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const chatgptReply = async (
  pid: string,
  username: string,
  token: string,
  isGpt4: boolean
) => {
  const response = await fetch(`${backendServer}/api/chatgptreply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      pid: pid,
      username: username,
      token: token,
      isGpt4: isGpt4,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

const formPrompt = (
  messages: MessageModel[],
  content: string,
  user = "### Human",
  assistant = "### Assistant"
) => {
  messages = messages.filter((m) => m.mid !== -1);
  const MAX_WORD_LIMIT = 1200;
  const countWords = () => {
    let ans = 0;
    for (const msg of messages) {
      ans += msg.content.split(" ").length;
    }
    return ans;
  };
  while (countWords() > MAX_WORD_LIMIT) {
    messages = messages.slice(1);
  }
  let result = "";
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const isAI = !msg.authorusername || msg.authorusername === "undefined";
    if (isAI) {
      result += `${assistant}: ${msg.content}\n`;
    } else {
      result += `${user}: ${msg.content}\n`;
    }
  }
  result += `${user}: ${content}\n`;
  result += `${assistant}: `;
  return result;
};

export const llama70BReply = async (
  content: string,
  messages: MessageModel[]
) => {
  const response = await fetch(LLAMA_70B_API, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: formPrompt(messages, content, "User", "Assistant"),
    }),
  });
  const res = await response.json();
  let answer = res.content as string;
  const stopping_string = "</s>";
  if (answer.indexOf(stopping_string) !== -1) {
    answer = answer.substring(0, answer.indexOf(stopping_string));
  }
  answer = answer.trim();
  while (answer.startsWith("Assistant:") || answer.startsWith("User:")) {
    if (answer.startsWith("Assistant: ")) {
      answer = answer.replace("Assistant:", "").trim();
    } else {
      answer = answer.replace("User:", "").trim();
    }
  }
  return answer;
};

export const pythonRuntimeReply = async (content: string) => {
  if (content.startsWith("```python\n")) {
    content = content.slice("```python\n".length);
  }
  if (content.endsWith("\n```")) {
    content = content.slice(0, -"\n```".length);
  }
  const response = await fetch(PYTHON_RUNTIME_API, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: content,
    }),
  });
  const res = await response.json();
  const answer = res.result as string;
  return answer;
};

export const customModelReply = async (
  content: string,
  api: string,
  messages: MessageModel[]
) => {
  const url = `${api}/v1/generate`;
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: formPrompt(messages, content),
    }),
  });
  const res = await response.json();
  let answer = res.results[0].text;
  const stopping_string = "###";
  if (answer.indexOf(stopping_string) !== -1) {
    answer = answer.substring(0, answer.indexOf(stopping_string));
  }
  return answer;
};

export const generateShortUrl = async (url: string, origin: string) => {
  const response = await fetch(`${backendServer}/api/generateshorturl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      url: url,
      origin: origin,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const findUrlByShortUrl = async (shortUrl: string) => {
  const response = await fetch(`${backendServer}/api/findurlbyshorturl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      shortUrl: shortUrl,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const findMidByKeyword = async (
  username: string,
  pid: string,
  keyword: string,
  token?: string
) => {
  const response = await fetch(`${backendServer}/api/findmidbykeyword`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      username: username,
      pid: pid,
      keyword: keyword,
      token: token,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const findTopKSearch = async (
  k: number,
  loggedUser?: string,
  token?: string
) => {
  const response = await fetch(`${backendServer}/api/findtopksearch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      k: k,
      username: loggedUser,
      token: token,
    }),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const uploadImage = async (item: DataTransferItem) => {
  const blob = item.getAsFile();
  if (!blob) {
    throw new Error("No file selected");
  }
  const data = new FormData();
  data.append("file", blob);
  const response = await fetch(`${backendServer}/upload`, {
    method: "POST",
    body: data,
  });
  const responseData = await response.json();
  return responseData;
};
