import { PostModel } from "../models/PostModel";
import { TagModel } from "../models/TagModel";

export const verify = async (authObj: object) => {
  const response = await fetch("http://localhost:3001/verify/", {
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
  const response = await fetch(`http://localhost:3001/api/post/${username}/${pid}`, {
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
  const response = await fetch(`http://localhost:3001/api/messages/${username}/${pid}`, {
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
  const response = await fetch(`http://localhost:3001/api/messages/${username}/${pid}/${sessionid}`, {
    method: "GET",
    mode: "cors"
  });
  const responseJson = await response.json();
  return responseJson;
};

export const insertSessionMessage = async (insertMsgObj: { username: string, pid: string, content: string, sessionid: string}) => {
  const response = await fetch("http://localhost:3001/api/insert/sessionmessages", {
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
  const response = await fetch("http://localhost:3001/api/insert/messages", {
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
  console.log(authoremail, "authoremail");
  const response = await fetch(`http://localhost:3001/api/retrieve/posts`, {
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
  const response = await fetch(`http://localhost:3001/api/delete/post/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({username: username, pid: pid, token: token})
  });
  const responseJson = await response.json();
  return responseJson;
}

export const insertPostByUsernameAndTitle = async (username: string, title: string, token: string, tags: TagModel[], isprivate: boolean) => {
  const response = await fetch(`http://localhost:3001/api/insert/post/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({username: username, title: title, token: token, tags: tags, isprivate: isprivate})
  });
  const responseJson = await response.json();
  return responseJson;
}

export const updatePost = async (post: PostModel, token: string) => {
  console.log("[client]: going to update post: ", post);
  const response = await fetch(`http://localhost:3001/api/update/post/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({...post, token: token})
  });
  const responseJson = await response.json();
  return responseJson;
}

export const searchPostsByKeyword = async (keyword: string) => {
  const response = await fetch(`http://localhost:3001/api/search/${keyword}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
  });
  const responseJson = await response.json();
  return responseJson;
}

export const searchPostsByTag = async (tag: string) => {
  const response = await fetch(`http://localhost:3001/api/search/tag/${tag}`, {
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
  const response = await fetch(`http://localhost:3001/api/recommend/${username}`, {
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
  const response = await fetch(`http://localhost:3001/api/username/${email}`, {
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
  if (username === "" || pid === "") return Promise.resolve({result: 0});
  const response = await fetch(`http://localhost:3001/api/starcount/${username}/${pid}`, {
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
  const response = await fetch(`http://localhost:3001/api/retrieve/starredpost`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      username: username,
    })
  });
  const responseJson = await response.json();
  console.log(responseJson, "starred post responseJson");
  return responseJson;
}

export const starPost = async (authoremail: string, pid: string, useremail: string, token: string) => {
  const response = await fetch(`http://localhost:3001/api/star`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      authoremail: authoremail,
      useremail: useremail,
      pid: pid,
      token: token
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const unstarPost = async (authoremail: string, pid: string, useremail: string, token: string) => {
  const response = await fetch(`http://localhost:3001/api/unstar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    body: JSON.stringify({
      authoremail: authoremail,
      useremail: useremail,
      pid: pid,
      token: token
    })
  });
  const responseJson = await response.json();
  return responseJson;
}

export const getGeneratedSessionid = async (username: string, pid: string) => {
  const response = await fetch(`http://localhost:3001/api/${username}/${pid}/createsession`, {
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
  const response = await fetch(`http://localhost:3001/api/tags`, {
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
  const response = await fetch(`http://localhost:3001/api/likemessage`, {
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
  const response = await fetch(`http://localhost:3001/api/unlikemessage`, {
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
  const response = await fetch(`http://localhost:3001/api/dislikemessage`, {
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
  const response = await fetch(`http://localhost:3001/api/undislikemessage`, {
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
  const response = await fetch(`http://localhost:3001/api/likecount/${messageid}`, {
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
  const response = await fetch(`http://localhost:3001/api/dislikecount/${messageid}`, {
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
  const response = await fetch(`http://localhost:3001/api/isliked`, {
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
  const response = await fetch(`http://localhost:3001/api/isdisliked`, {
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