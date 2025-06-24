import { axiosInstance } from "./axios";

export const signup = async (userData) => {
    const response = await axiosInstance.post("/auth/signup", userData);
    console.log(response.message);
    return response.data;
}

export const login = async (userData) => {
    const response = await axiosInstance.post("/auth/login", userData);
    // console.log(response.message.toString());
    return response.data;
}

export const logout = async () => {

    const response = await axiosInstance.post("/auth/logout");
    return response.data;
}

export const getAuthUser = async () => {


    try {
        const res = await axiosInstance.get('/auth/me')
        return res.data
    }
    catch (err) {
        return null
    }

}

export const completeOnboarding = async (userData) => {
    const res = await axiosInstance.post('/auth/onboarding', userData)
    return res.data;
}



export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
    console.log(userId);
const response = await axiosInstance.post(`/users/friend-request/${userId.toString()}`);
  return response.data;

}

export async function getFriendRequests(){
    
    
    const response = await axiosInstance.get(`/users/friend-request`);
    console.log(response.data);
    
  return response.data;
}

export async function acceptFriendRequest(userId){
    const response = await axiosInstance.put(`/users/friend-request/${userId}/accept`);
  return response.data;
}


export async function getStreamToken(){
    const response = await axiosInstance.get(`/chat/token`);
    // console.log(response.data);
    
  return response.data;
}


