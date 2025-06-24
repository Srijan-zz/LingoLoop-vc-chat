import React from 'react'

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";


import "@stream-io/video-react-sdk/dist/css/styles.css";

import { useParams } from 'react-router';
import useAuthUser from '../hooks/useAuthUser';
import { useEffect, useState } from 'react';
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { getStreamToken } from '../config/api';
import PageLoader from '../components/PageLoader';


function CallPage() {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client...");


        //user bnalita khudko
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        //video client bnaliya khudko i.e. initiate kiya instance
        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        //call chalu kro
        const callInstance = videoClient.call("default", callId);

        //koi join krne ka wiat kro
        await callInstance.join({ create: true });
//create:true mtlb call is created if it doesnt exist
        console.log("Joined call successfully");



        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">

        {/* if we have client and call we get this page  */}
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
              {/* neeche hi bnaiya h  */}
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState(); //current state btata h call ka like left i.e. call leave krdiya and all

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/");
//on leaving go to homescreen, matlab call leav krdiya

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;