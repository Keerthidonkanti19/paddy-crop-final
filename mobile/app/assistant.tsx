import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

import { askFarmerAssistant } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../locales/translations";

export default function AssistantScreen() {
  const params = useLocalSearchParams();

  // -----------------------------
  // Language
  // -----------------------------
  const { language } = useLanguage();
  const t = translations[language];

  // -----------------------------
  // Prediction data
  // -----------------------------
  const disease = String(
    params.disease || ""
  );

  const confidence = String(
    params.confidence || ""
  );

  const fertilizers = String(
    params.fertilizers || ""
  );

  const pesticides = String(
    params.pesticides || ""
  );

  // -----------------------------
  // Assistant state
  // -----------------------------
  const [question, setQuestion] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  // -----------------------------
  // Conversation history
  // -----------------------------
  const [conversation, setConversation] =
    useState<
      {
        role: "user" | "assistant";
        text: string;
      }[]
    >([]);

  // -----------------------------
  // Speech recognition events
  // -----------------------------
  useSpeechRecognitionEvent("start", () => {
    console.log("Voice recognition started");
    setIsListening(true);
  });

  useSpeechRecognitionEvent("end", () => {
    console.log("Voice recognition ended");
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript =
      event.results?.[0]?.transcript;

    console.log(
      "Voice transcript:",
      transcript
    );

    if (transcript) {
      setQuestion(transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log(
      "Speech recognition error:",
      event.error
    );

    setIsListening(false);

    Alert.alert(
      "Voice Input",
      "Unable to recognize your voice. Please try again."
    );
  });

  // -----------------------------
  // Get speech language
  // -----------------------------
  const getSpeechLanguage = () => {
    switch (language) {
      case "te":
        return "te-IN";

      case "hi":
        return "hi-IN";

      case "ta":
        return "ta-IN";

      case "kn":
        return "kn-IN";

      default:
        return "en-IN";
    }
  };

  // -----------------------------
  // Start / Stop Voice Input
  // -----------------------------
  const toggleVoiceInput = async () => {
    try {
      // Stop current recognition
      if (isListening) {
        ExpoSpeechRecognitionModule.stop();
        return;
      }

      // Request microphone permission
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone Permission",
          "Please allow microphone access to use voice input."
        );

        return;
      }

      console.log(
        "Starting voice recognition:",
        getSpeechLanguage()
      );

      ExpoSpeechRecognitionModule.start({
        lang: getSpeechLanguage(),
        interimResults: false,
        continuous: false,
      });
    } catch (error) {
      console.log(
        "Voice input error:",
        error
      );

      setIsListening(false);

      Alert.alert(
        "Voice Input",
        "Unable to start voice input."
      );
    }
  };

  // -----------------------------
  // Ask Farmer AI
  // -----------------------------
  const handleAsk = async () => {
    const userQuestion = question.trim();

    if (!userQuestion) {
      Alert.alert(
        t.assistant.questionRequired,
        t.assistant.enterQuestion
      );

      return;
    }

    try {
      setLoading(true);

      console.log(
        "Assistant language:",
        language
      );

      console.log(
        "User question:",
        userQuestion
      );

      // ---------------------------------
      // Immediately add user's question
      // to conversation history
      // ---------------------------------
      setConversation((prev) => [
        ...prev,
        {
          role: "user",
          text: userQuestion,
        },
      ]);

      // Clear input after submitting
      setQuestion("");

      // ---------------------------------
      // Ask AI
      // ---------------------------------
      const result =
        await askFarmerAssistant({
          disease,
          confidence,
          fertilizers,
          pesticides,
          question: userQuestion,
          language: language,
        });

      const assistantAnswer =
        result?.answer ||
        t.assistant.noAnswer;

      console.log(
        "Assistant answer:",
        assistantAnswer
      );

      // ---------------------------------
      // Add AI answer to conversation
      // ---------------------------------
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          text: assistantAnswer,
        },
      ]);
    } catch (error: any) {
      console.log(
        "Assistant error:",
        error
      );

      // Keep the user's question visible
      // even if the API request fails
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error?.message ||
            t.assistant.errorMessage,
        },
      ]);

      Alert.alert(
        t.assistant.errorTitle,
        error?.message ||
          t.assistant.errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // <SafeAreaView
    //   style={styles.container}
    // >
    <SafeAreaView
  style={styles.container}
  edges={["top"]}
>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text
              style={styles.backText}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={styles.headerTitle}
            >
              {t.assistant.title}
            </Text>

            <Text
              style={styles.headerSubtitle}
            >
              {t.assistant.subtitle}
            </Text>
          </View>
        </View>

        {/* Current Disease Context */}
        {disease ? (
          <View
            style={styles.contextCard}
          >
            <Text
              style={styles.contextTitle}
            >
              {t.assistant.currentDetection}
            </Text>

            <Text
              style={
                styles.contextDisease
              }
            >
              {disease}
            </Text>

            {confidence ? (
              <Text
                style={
                  styles.contextConfidence
                }
              >
                {t.result.confidence}:{" "}
                {confidence}%
              </Text>
            ) : null}
          </View>
        ) : (
          <View
            style={styles.contextCard}
          >
            <Text
              style={styles.contextTitle}
            >
              🌾 Khet Saathi
            </Text>

            <Text
              style={styles.contextText}
            >
              {t.assistant.contextText}
            </Text>
          </View>
        )}

        {/* Introduction */}
        <View
          style={styles.introCard}
        >
          <Text
            style={styles.introIcon}
          >
            🤖
          </Text>

          <View
            style={styles.introContent}
          >
            <Text
              style={styles.introTitle}
            >
              {t.assistant.helpTitle}
            </Text>

            <Text
              style={styles.introText}
            >
              {t.assistant.helpText}
            </Text>
          </View>
        </View>

        {/* Example Questions */}
        <Text
          style={styles.sectionTitle}
        >
          {t.assistant.youCanAsk}
        </Text>

        <View
          style={styles.examplesCard}
        >
          <Text
            style={styles.example}
          >
            •{" "}
            {
              t.assistant
                .questionDisease
            }
          </Text>

          <Text
            style={styles.example}
          >
            •{" "}
            {
              t.assistant
                .questionFertilizer
            }
          </Text>

          <Text
            style={styles.example}
          >
            •{" "}
            {
              t.assistant
                .questionPesticide
            }
          </Text>

          <Text
            style={styles.example}
          >
            •{" "}
            {
              t.assistant
                .questionPrevention
            }
          </Text>
        </View>

        {/* Conversation History */}
        {conversation.length > 0 ? (
          <View
            style={styles.conversationContainer}
          >
            {conversation.map(
              (message, index) => (
                <View
                  key={`${message.role}-${index}`}
                  style={
                    message.role ===
                    "user"
                      ? styles.userMessageCard
                      : styles.answerCard
                  }
                >
                  <Text
                    style={
                      message.role ===
                      "user"
                        ? styles.userMessageTitle
                        : styles.answerTitle
                    }
                  >
                    {message.role ===
                    "user"
                      ? "👤"
                      : `🤖 ${t.assistant.answerTitle}`}
                  </Text>

                  <Text
                    style={
                      message.role ===
                      "user"
                        ? styles.userMessageText
                        : styles.answerText
                    }
                  >
                    {message.text}
                  </Text>
                </View>
              )
            )}
          </View>
        ) : null}

        {/* Question Input */}
        <View
          style={styles.inputCard}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={
                t.assistant.placeholder
              }
              placeholderTextColor="#8A968E"
              value={question}
              onChangeText={setQuestion}
              multiline
              textAlignVertical="top"
            />

            {/* Microphone */}
            <TouchableOpacity
              style={[
                styles.micButton,
                isListening &&
                  styles.micButtonListening,
              ]}
              onPress={toggleVoiceInput}
              activeOpacity={0.8}
            >
              <Text style={styles.micIcon}>
                {isListening
                  ? "⏹️"
                  : "🎤"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ask Button */}
          <TouchableOpacity
            style={[
              styles.askButton,
              (!question.trim() ||
                loading) &&
                styles.askButtonDisabled,
            ]}
            disabled={
              !question.trim() ||
              loading
            }
            onPress={handleAsk}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.askButtonText,
                (!question.trim() ||
                  loading) &&
                  styles.askButtonTextDisabled,
              ]}
            >
              {loading
                ? t.assistant.thinking
                : t.assistant.askButton}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FFF9",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E9F8EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  backText: {
    fontSize: 32,
    color: "#087F3E",
    lineHeight: 34,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#123B24",
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#68756D",
    marginTop: 2,
  },

  contextCard: {
    backgroundColor: "#E9F8EE",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  contextTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 7,
  },

  contextDisease: {
    fontSize: 20,
    fontWeight: "700",
    color: "#087F3E",
    marginBottom: 4,
  },

  contextConfidence: {
    fontSize: 13,
    color: "#5F6B64",
  },

  contextText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#405047",
  },

  introCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCE9DF",
    marginBottom: 22,
  },

  introIcon: {
    fontSize: 38,
    marginRight: 14,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 5,
  },

  introText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#405047",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 10,
  },

  examplesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCE9DF",
    marginBottom: 20,
  },

  example: {
    fontSize: 14,
    color: "#4C5A51",
    lineHeight: 22,
    marginBottom: 5,
  },

  // -----------------------------
  // Conversation styles
  // -----------------------------

  conversationContainer: {
    marginBottom: 18,
  },

  userMessageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DCE9DF",
  },

  userMessageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#087F3E",
    marginBottom: 8,
  },

  userMessageText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#405047",
  },

  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DCE9DF",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  input: {
    flex: 1,
    minHeight: 90,
    maxHeight: 140,
    fontSize: 15,
    color: "#123B24",
    padding: 10,
  },

  micButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E9F8EE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    marginBottom: 8,
  },

  micButtonListening: {
    backgroundColor: "#FFE5E5",
  },

  micIcon: {
    fontSize: 24,
  },

  askButton: {
    backgroundColor: "#08A64A",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },

  askButtonDisabled: {
    backgroundColor: "#DDEBE2",
  },

  askButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  askButtonTextDisabled: {
    color: "#6A776E",
  },

  answerCard: {
    backgroundColor: "#E9F8EE",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },

  answerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 10,
  },

  answerText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#405047",
  },
});