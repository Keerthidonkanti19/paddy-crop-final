import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { loginRequest, signupRequest } from "../api/client";

export default function AuthScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert("Required", "Please enter your mobile number.");
      return;
    }

    if (isSignup && !username.trim()) {
      Alert.alert("Required", "Please enter your username.");
      return;
    }

    try {
      setLoading(true);

      const response = isSignup
        ? await signupRequest(
            username.trim(),
            mobileNumber.trim()
          )
        : await loginRequest(mobileNumber.trim());

      console.log("Authentication successful:", response);

      Alert.alert(
        isSignup ? "Account Created" : "Login Successful",
        `Welcome ${response.username}!`,
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(tabs)"),
            // onPress: () => router.replace("/(tabs)/index"),
          },
        ]
      );
    } catch (error: any) {
      console.log("Authentication error:", error);

      const message =
        error?.message || "Unable to connect to the server.";

      Alert.alert("Authentication Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <SafeAreaView style={styles.container}>
    <SafeAreaView
  style={styles.container}
  edges={["top"]}
>
      <View style={styles.content}>

        <Text style={styles.logo}>🌾</Text>

        <Text style={styles.title}>Khet Saathi</Text>

        <Text style={styles.subtitle}>
          Your Smart Farming Companion
        </Text>

        <View style={styles.card}>
          <Text style={styles.heading}>
            {isSignup ? "Create Account" : "Welcome Back"}
          </Text>

          <Text style={styles.description}>
            {isSignup
              ? "Create your farmer account to get started."
              : "Login to continue using Khet Saathi."}
          </Text>

          {isSignup && (
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            maxLength={15}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignup(!isSignup)}
          >
            <Text style={styles.switchText}>
              {isSignup
                ? "Already have an account? Login"
                : "New farmer? Create an account"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FFF9",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logo: {
    fontSize: 58,
    textAlign: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#087F3E",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#5F6B64",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#DCE9DF",
  },

  heading: {
    fontSize: 23,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#68756D",
    marginBottom: 20,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DCE9DF",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#123B24",
    marginBottom: 14,
    backgroundColor: "#F9FCFA",
  },

  primaryButton: {
    backgroundColor: "#08A64A",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  switchButton: {
    alignItems: "center",
    marginTop: 18,
  },

  switchText: {
    color: "#087F3E",
    fontSize: 14,
    fontWeight: "600",
  },
});