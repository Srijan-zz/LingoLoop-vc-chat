import React from 'react'
import { getStreamToken } from '../config/api'
import { useParams } from 'react-router'
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import useAuthUser from '../hooks/useAuthUser'
import toast from 'react-hot-toast';
import ChatLoader from "../components/ChatLoader"
import CallButton from'../components/CallButton'


import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY


function ChatPage() {


  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();


  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser //!! to ocnvert to boolean, basically dont run querry till we have authUser state
  })


  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;



      try {
        console.log("Initializing stream chat.....");
console.log(tokenData);

        const client = StreamChat.getInstance(STREAM_API_KEY) //instanc eof chat


        //user ko connect krdo
        await client.connectUser({
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic
        }, tokenData.token.toString())

        //chat channel bnao
        const channelId = [authUser._id, targetUserId].sort().join("-");
        //sort add krte h so that the cannel is same irrespective of  who initiates

        //you and me  chat
        //without sort and join
        //      if i initiate => [me,you]
        //      if you initiate=> [you,me] 
        //      computer sees this as different channel id to al agl johayega
        //so we sort to keep same order between two

        const currentChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId]
        })

        await currentChannel.watch();

        setChatClient(client)
        setChannel(currentChannel)

      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }

    };

    initChat();
  }, [tokenData, authUser, targetUserId])


  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };
  

    if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;