import { PostModel } from "../models/PostModel";
import { TagModel } from "../models/TagModel";
import { backendServer } from "../util/constants";

export const verify = async (authObj: object) => {
  const response = await fetch(`${backendServer}/verify/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify(authObj),
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getPostByUsernameAndPid = async (username: string, pid: string, token = "") => {
  const response = await fetch(`${backendServer}/api/post/${username}/${pid}`, {
    method: "GET",
    mode: "cors",
    headers: {
      "Authorization": token
    }
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getMessagesByUsernameAndPid = async (username: string, pid: string, token = "") => {
  const response = await fetch(`${backendServer}/api/messages/${username}/${pid}`, {
    method: "GET",
    mode: "cors",
    headers: {
      "Authorization": token
    }
  });
  const responseJson = await response.json();
  return responseJson;
};

export const getMessagesByUsernameAndPidAndSessionid = async (username: string, pid: string, sessionid: string) => {
  const response = await fetch(`${backendServer}/api/messages/${username}/${pid}/${sessionid}`, {
    method: "GET",
    mode: "cors"
  });
  const responseJson = await response.json();
  return responseJson;
};

export const insertSessionMessage = async (insertMsgObj: { username: string, pid: string, content: string, sessionid: string }) => {
  const response = await fetch(`${backendServer}/api/insert/sessionmessages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify(insertMsgObj),
  });
  const responseJson = await response.json();
  return responseJson;
}

export const insertMessage = async (insertMsgObj: { username: string, pid: string, content: string, token: string, triggerAI: boolean, authoremail: string, socketId?: string }) => {
  const response = await fetch(`${backendServer}/api/insert/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify(insertMsgObj),
  });
  const responseJson = await response.json();
  return responseJson;
}

export const findPostsByAuthoremail = async (authoremail: string) => {
  const response = await fetch(`${backendServer}/api/retrieve/posts`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: authoremail })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const deletePostByUsernameAndPid = async (username: string, pid: string, token: string) => {
  const response = await fetch(`${backendServer}/api/delete/post/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({ username: username, pid: pid, token: token })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const deleteMessageByMid = async (mid: number, token: string, username: string) => {
  const response = await fetch(`${backendServer}/api/delete/message/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({ mid: mid, token: token, username: username })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const insertPostByUsernameAndTitle = async (username: string, title: string, token: string, tags: TagModel[], isprivate: boolean) => {
  const response = await fetch(`${backendServer}/api/insert/post/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({ username: username, title: title, token: token, tags: tags, isprivate: isprivate })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const updatePost = async (post: PostModel, token: string) => {
  const response = await fetch(`${backendServer}/api/update/post/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({ ...post, token: token })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const searchPostsByKeyword = async (keyword: string, auth?: {
  username: string,
  token: string
}) => {
  let headers = {
    "Content-Type": "application/json"
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
}

export const searchPostsByTag = async (tag: string) => {
  const response = await fetch(`${backendServer}/api/search/tag/${tag}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
}

export const getRecommendations = async (username: string) => {
  const response = await fetch(`${backendServer}/api/recommend/${username}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
}

export const getUsernameByEmail = async (email: string) => {
  const response = await fetch(`${backendServer}/api/username/${email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
}

export const getStarCount = async (username: string, pid: string) => {
  if (username === "" || pid === "") return Promise.resolve({ result: 0 });
  const response = await fetch(`${backendServer}/api/starcount/${username}/${pid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
}

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
}

export const isStarred = async (username: string, authorusername: string, pid: string) => {
  const response = await fetch(`${backendServer}/api/isstarred`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      username: username,
      authorusername: authorusername,
      pid: pid
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const starPost = async (authorusername: string, pid: string, useremail: string, token: string) => {
  const response = await fetch(`${backendServer}/api/star`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      authorusername: authorusername,
      useremail: useremail,
      pid: pid,
      token: token
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const unstarPost = async (authorusername: string, pid: string, useremail: string, token: string) => {
  const response = await fetch(`${backendServer}/api/unstar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      authorusername: authorusername,
      useremail: useremail,
      pid: pid,
      token: token
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const getGeneratedSessionid = async (username: string, pid: string) => {
  const response = await fetch(`${backendServer}/api/${username}/${pid}/createsession`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
}

export const getTags = async () => {
  const response = await fetch(`${backendServer}/api/tags`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
}

export const likeMessage = async (messageid: number, useremail: string, token: string) => {
  const response = await fetch(`${backendServer}/api/likemessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const unlikeMessage = async (messageid: number, useremail: string, token: string) => {
  const response = await fetch(`${backendServer}/api/unlikemessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const dislikeMessage = async (messageid: number, useremail: string, token: string) => {
  const response = await fetch(`${backendServer}/api/dislikemessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const undislikeMessage = async (messageid: number, useremail: string, token: string) => {
  const response = await fetch(`${backendServer}/api/undislikemessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const getLikeCount = async (messageid: number) => {
  const response = await fetch(`${backendServer}/api/likecount/${messageid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
}

export const getDislikeCount = async (messageid: number) => {
  const response = await fetch(`${backendServer}/api/dislikecount/${messageid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
}

export const isLiked = async (messageid: number, useremail: string, token: string) => {
  const response = await fetch(`${backendServer}/api/isliked`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const isDisliked = async (messageid: number, useremail: string, token: string) => {
  const response = await fetch(`${backendServer}/api/isdisliked`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const editMessage = async (messageid: number, useremail: string, token: string, message: string) => {
  const response = await fetch(`${backendServer}/api/editmessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      mid: messageid,
      useremail: useremail,
      token: token,
      message: message
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const forkPost = async (authorusername: string, pid: string, useremail: string, token: string, endMsgId?: number) => {
  const response = await fetch(`${backendServer}/api/fork`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      authorusername: authorusername,
      useremail: useremail,
      pid: pid,
      token: token,
      endMsgId: endMsgId
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const getTodayAIUsage = async (username: string, token: string) => {
  const response = await fetch(`${backendServer}/api/todayaiusage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      username: username,
      token: token
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const getDailyAILimit = async () => {
  const response = await fetch(`${backendServer}/api/getdailyailimit`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
}