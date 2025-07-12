import React from 'react'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { getUserFriends, getRecommendedUsers, getOutgoingFriendReqs, sendFriendRequest } from '../config/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircleIcon,MessageCircleIcon,VideoIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import FriendCard from '../components/FriendCard';
import NoFriendsFound from '../components/NoFriendsFound';
import { getLanguageFlag } from '../components/FriendCard';
import { capitialize } from '../config/utility'
import toast from 'react-hot-toast';
import { useLocation } from 'react-router';


function HomePage() {

  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const location = useLocation()

  let isHome=false;
  const isFriends = location.pathname?.startsWith('/friends')
  if(!isFriends){
     isHome = location.pathname?.startsWith('/')
  }
  //user friend lelo
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });
  //recommendation
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });
  //outogoing request
  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  //request bhejne k lye
  const { mutate: sendRequestMutation, error, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),//bhejne ke baad reload outgoing requests


    onError: (error) => toast.error(error?.response?.data?.message?.toString() || "Something  went wrong")
  });
  console.log(error);
  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        // console.log(req);

        outgoingIds.add(req.recipient._id.toString());
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">


        {isHome &&(
          <div className="bg-base-200 rounded-xl p-6 sm:p-8 mb-10 shadow-md text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-primary">
        Welcome to LingoLoop 🌍
      </h1>
      <p className="text-base-content opacity-80 text-lg max-w-xl mx-auto mb-4">
        Connect with fellow language learners around the world. Practice through real-time chats, video calls, and build lasting friendships.
      </p>
      <div className="flex justify-center gap-6 mt-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <UsersIcon className="size-4" />
          Find Buddies
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MessageCircleIcon className="size-4" />
          Start Chatting
        </div>
        <div className="flex items-center gap-2 text-sm">
          <VideoIcon className="size-4" />
          Join Live Calls
        </div>
      </div>
    </div>
        )}

        {/* jo jo friend h load kro  agr friend page ho to*/}

        {
          isFriends &&
          (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">


                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Learning Buddies</h2>


                <Link to="/notifications" className="btn btn-outline btn-sm">
                  <UsersIcon className="mr-2 size-4" />
                  Friend Requests
                </Link>
              </div>
              {
                loadingFriends ? (


                  <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg" />
                  </div>
                ) : friends.length === 0 ? (
                  <NoFriendsFound />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {friends.map((friend) => (
                      <FriendCard key={friend._id} friend={friend} />
                    ))}
                  </div>

                )}
            </>
          )
        }



        {/* heading */}
        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet Other Learners</h2>
                <p className="opacity-70">
                  Find your own language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>
          {/* recommended users ayenge yha pe  */}
          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                // ye user ko bhej chuke h req 
                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      {/* Action button */}

                      {/* request send krna h aur uske basis p css change kro */}
                      <button
                        className={`btn w-full mt-2 ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                          } `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;