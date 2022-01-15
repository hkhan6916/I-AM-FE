import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";

import apiCall from "../../../helpers/apiCall";
import VideoPlayer from "../../../components/VideoPlayer";

const UserProfileScreen = (props) => {
  const { userId } = props.route.params;
  const [user, setUser] = useState({});

  const sendFriendRequest = async () => {
    const userRequestSent = { ...user, requestSent: true };

    setUser(userRequestSent);

    const { success, error, message } = await apiCall(
      "GET",
      `/user/friend/request/send/${userId}`
    );
    console.log(message);
    if (!success || error === "CONNECTION_FAILED") {
      const userRequestRemoved = { ...user, requestSent: false };
      setUser(userRequestRemoved);
    }
  };

  const recallFriendRequest = async () => {
    const userRequestSent = { ...user, requestSent: false };

    setUser(userRequestSent);
    const { success, error, message } = await apiCall(
      "GET",
      `/user/friend/request/recall/${userId}`
    );
    console.log(message);
    if (!success || error === "CONNECTION_FAILED") {
      const userRequestRemoved = { ...user, requestSent: true };
      setUser(userRequestRemoved);
    }
  };

  const acceptFriendRequest = async () => {
    const userIsFriend = { ...user, isFriend: true };

    setUser(userIsFriend);

    const { success, error } = await apiCall(
      "GET",
      `/user/friend/request/accept/${userId}`
    );

    if (!success || error === "CONNECTION_FAILED") {
      const userIsNotFriend = { ...user, isFriend: false };

      setUser(userIsNotFriend);
    }
  };

  const rejectFriendRequest = async () => {
    const userRequestRejected = { ...user, requestReceived: false };

    setUser(userRequestRejected);
    const { success, error, message } = await apiCall(
      "GET",
      `/user/friend/request/reject/${userId}`
    );
    console.log(message);
    if (!success || error === "CONNECTION_FAILED") {
      const userRequestRemoved = { ...user, requestReceived: true };
      setUser(userRequestRemoved);
    }
  };

  const removeConnection = async () => {
    const userIsNotFriend = {
      ...user,
      isFriend: false,
      requestReceived: false,
      requestSent: false,
    };

    setUser(userIsNotFriend);

    const { success, error } = await apiCall(
      "GET",
      `/user/friend/remove/${userId}`
    );

    if (!success || error === "CONNECTION_FAILED") {
      const userIsFriend = { ...user, isFriend: true, requestReceived: false };

      setUser(userIsFriend);
    }
  };

  useEffect(() => {
    (async () => {
      const { success, response } = await apiCall("GET", `/user/${userId}`);
      if (success) {
        setUser(response.otherUser);
      }
    })();
    return () => {
      setUser({});
    };
  }, []);

  if (user && user._id) {
    return (
      <View style={{ height: 400 }}>
        <VideoPlayer
          url={user.profileVideoUrl}
          mediaHeaders={user.profileVideoHeaders}
          mediaIsSelfie
          isProfileVideo
        />
        <Text>{user.numberOfFriends}</Text>
        <Text>
          {user.firstName} {user.lastName}
        </Text>
        {user.isFriend ? (
          <Button
            title="Remove From Friends"
            onPress={() => removeConnection()}
          />
        ) : user.requestReceived ? (
          <View>
            <Button
              title="Accept Request"
              onPress={() => acceptFriendRequest()}
            />
            <Button
              title="Reject Request"
              onPress={() => rejectFriendRequest()}
            />
          </View>
        ) : user.requestSent ? (
          <Button title="Request Sent" onPress={() => recallFriendRequest()} />
        ) : (
          <Button title="Add user" onPress={() => sendFriendRequest()} />
        )}
      </View>
    );
  }
  return <View />;
};

export default UserProfileScreen;
