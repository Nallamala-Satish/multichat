import React from "react";
import { View, TouchableOpacity,  FlatList, Text } from "react-native";


const users = [
  { id: "1", name: "satish" },
  { id: "2", name: "santhosh" },
  { id: "3", name: "srikanth" },
  { id: "4", name: "vamsi" },
  { id: "5", name: "kiran" },
];

const ChatUserListScreen = ({ navigation,route }) => {
    const {userId} = route.params;
    const chatUsers = users.filter((user) => user.id !== userId);

  return (
    <FlatList
      data={chatUsers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate("Chat", { userId: userId, receiverId: item.id })}
        style={{padding:10,margin:10,borderRadius:5,backgroundColor:'white'}}>
          <Text style={{fontWeight:'bold',fontSize:20}}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default ChatUserListScreen;