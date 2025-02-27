import React, { useState } from "react";
import { View, TextInput, Button } from "react-native";

const LoginScreen = ({ navigation }) => {
  const [userId, setUserId] = useState("");

  return (
    <View>
      <TextInput placeholder="Enter User ID" value={userId} onChangeText={setUserId} />
      <Button title="Login" onPress={() => navigation.navigate("ChatUserListScreen", { userId })} />
    </View>
  );
};

export default LoginScreen;
