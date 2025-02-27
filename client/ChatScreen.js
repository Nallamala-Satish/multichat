import React, { useEffect, useState, useCallback } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import io from "socket.io-client";
import * as ImagePicker from "react-native-image-picker";

const socket = io("http://192.168.0.118:5000");

const ChatScreen = ({ route }) => {
  const { userId, receiverId } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch(`http://192.168.0.118:5000/messages/${userId}/${receiverId}`)
      .then((res) => res.json())
      .then((data) =>
        setMessages(
          data.reverse().map((msg) => ({
            _id: msg._id,
            text: msg.text,
            createdAt: new Date(msg.createdAt),
            user: { _id: msg.senderId },
            image: msg.image,
            video: msg.video,
          }))
        )
      );

    socket.on("receiveMessage", (message) => {
      setMessages((previousMessages) => GiftedChat.append(previousMessages, [message]));
    });

    return () => socket.off("receiveMessage");
  }, []);

  const onSend = useCallback((messages = []) => {
    if (messages.length > 0) {
      const message = { ...messages[0], senderId: userId, receiverId };
      socket.emit("sendMessage", message);
    }
  }, []);

  const pickMedia = () => {
    ImagePicker.launchImageLibrary({ mediaType: "mixed" }, (response) => {
      if (!response.didCancel) {
        const formData = new FormData();
        formData.append("file", {
          uri: response.assets[0].uri,
          type: response.assets[0].type,
          name: response.assets[0].fileName,
        });

        fetch("http://192.168.0.118:5000/upload", { method: "POST", body: formData })
          .then((res) => res.json())
          .then(({ url }) => {
            const message = {
              _id: Math.random().toString(),
              createdAt: new Date(),
              user: { _id: userId },
              image: response.assets[0].type.startsWith("image") ? url : null,
              video: response.assets[0].type.startsWith("video") ? url : null,
            };
            socket.emit("sendMessage", { ...message, senderId: userId, receiverId });
            setMessages((previousMessages) => GiftedChat.append(previousMessages, [message]));
          });
      }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: userId }}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              left: { backgroundColor: "#EAEAEA" }, // Left side (Receiver)
              right: { backgroundColor: "#007AFF" }, // Right side (Sender)
            }}
            textStyle={{
              left: { color: "#000" },
              right: { color: "#fff" },
            }}
          />
        )}
      />
      <TouchableOpacity onPress={pickMedia} style={{ position: "absolute", bottom: 10, right: 70 }}>
        <Image source={{ uri: "https://img.icons8.com/material-outlined/50/000000/image.png" }} style={{ width: 30, height: 30 }} />
      </TouchableOpacity>
    </View>
  );
};

export default ChatScreen;
