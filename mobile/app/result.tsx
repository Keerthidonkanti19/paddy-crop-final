// import React from "react";
// import React, { useEffect, useState } from "react";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import * as Speech from "expo-speech";

import { useLanguage } from "../context/LanguageContext";
import { translations } from "../locales/translations";


export default function ResultScreen() {
  const params = useLocalSearchParams();

  // -----------------------------
  // Language
  // -----------------------------
  const { language } = useLanguage();
  const t = translations[language];

  const [isSpeaking, setIsSpeaking] = useState(false);
  // -----------------------------
  // Prediction data
  // -----------------------------
  const disease = String(
    params.disease || "Unknown"
  );

  const confidence = String(
    params.confidence || "0"
  );

  const fertilizers = String(
    params.fertilizers ||
      "No fertilizer recommendation available."
  );

  const pesticides = String(
    params.pesticides ||
      "No pesticide recommendation available."
  );

  const warning = params.warning
    ? String(params.warning)
    : "";

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

const speakResult = async () => {
  try {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const speechText = [
      `${disease}.`,
      `${t.result.confidence}: ${confidence}%.`,
      warning ? warning : "",
      `${t.result.fertilizer}. ${fertilizers}`,
      `${t.result.pesticide}. ${pesticides}`,
    ]
      .filter(Boolean)
      .join(" ");

    setIsSpeaking(true);

    await Speech.speak(speechText, {
      language: getSpeechLanguage(),
      rate: 0.9,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  } catch (error) {
    console.log("Speech error:", error);
    setIsSpeaking(false);
  }
};

  // -----------------------------
  // Open Farmer AI Assistant
  // -----------------------------
  const openAssistant = () => {
    router.push({
      pathname: "/assistant",
      params: {
        disease,
        confidence,
        fertilizers,
        pesticides,
      },
    });
  };

  return (
    // <SafeAreaView style={styles.container}>
    <SafeAreaView
  style={styles.container}
  edges={["top"]}
>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {t.result.title}
          </Text>
        </View>

        {/* Result */}
        <View style={styles.resultCard}>
          <Text style={styles.resultIcon}>
            🌾
          </Text>

          <Text style={styles.resultLabel}>
            {t.result.detectedDisease}
          </Text>

          <Text style={styles.diseaseName}>
            {disease}
          </Text>

          <View style={styles.confidenceBox}>
            <Text
              style={styles.confidenceLabel}
            >
              {t.result.confidence}
            </Text>

            <Text
              style={styles.confidenceValue}
            >
              {confidence}%
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
  style={styles.speakButton}
  activeOpacity={0.8}
  onPress={speakResult}
>
  <Text style={styles.speakIcon}>
    {isSpeaking ? "⏹️" : "🔊"}
  </Text>

  <Text style={styles.speakButtonText}>
    {isSpeaking ? "Stop Reading" : "Read Result Aloud"}
  </Text>
</TouchableOpacity>

        {/* Warning */}
        {warning ? (
          <View style={styles.warningCard}>
            <Text
              style={styles.warningTitle}
            >
              {t.result.important}
            </Text>

            <Text
              style={styles.warningText}
            >
              {warning}
            </Text>
          </View>
        ) : null}

        {/* Fertilizer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {t.result.fertilizer}
          </Text>

          <Text style={styles.cardText}>
            {fertilizers}
          </Text>
        </View>

        {/* Pesticide */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {t.result.pesticide}
          </Text>

          <Text style={styles.cardText}>
            {pesticides}
          </Text>
        </View>

        {/* Farmer AI Assistant */}
        <TouchableOpacity
          style={styles.assistantButton}
          activeOpacity={0.8}
          onPress={openAssistant}
        >
          <Text style={styles.assistantIcon}>
            🤖
          </Text>

          <View
            style={styles.assistantButtonContent}
          >
            <Text
              style={
                styles.assistantButtonTitle
              }
            >
              {t.result.askFarmerAI}
            </Text>

            <Text
              style={
                styles.assistantButtonSubtitle
              }
            >
              {t.result.askQuestions}
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        {/* Back to Home */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() =>
            router.replace("/(tabs)")
          }
        >
          <Text
            style={styles.doneButtonText}
          >
            {t.result.backHome}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 24,
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

  headerTitle: {
    flex: 1,
    fontSize: 23,
    fontWeight: "700",
    color: "#123B24",
  },

  resultCard: {
    backgroundColor: "#E9F8EE",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 18,
  },

  resultIcon: {
    fontSize: 48,
    marginBottom: 10,
  },

  resultLabel: {
    fontSize: 14,
    color: "#5F6B64",
    marginBottom: 6,
  },

  diseaseName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#087F3E",
    textAlign: "center",
    marginBottom: 20,
  },

  confidenceBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 12,
    alignItems: "center",
  },

  confidenceLabel: {
    fontSize: 12,
    color: "#68756D",
    marginBottom: 3,
  },

  confidenceValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#123B24",
  },

  warningCard: {
    backgroundColor: "#FFF5DD",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  warningTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#765600",
    marginBottom: 7,
  },

  warningText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#5F4A00",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DCE9DF",
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 10,
  },

  cardText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#405047",
  },

  assistantButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#087F3E",
    borderRadius: 18,
    padding: 17,
    marginTop: 2,
    marginBottom: 14,
  },

  assistantIcon: {
    fontSize: 30,
    marginRight: 13,
  },

  assistantButtonContent: {
    flex: 1,
  },

  assistantButtonTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  assistantButtonSubtitle: {
    color: "#DDF4E5",
    fontSize: 12,
    marginTop: 3,
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 30,
    marginLeft: 8,
  },

  doneButton: {
    backgroundColor: "#DDEBE2",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  doneButtonText: {
    color: "#087F3E",
    fontSize: 17,
    fontWeight: "700",
  },

  speakButton: {
  backgroundColor: "#087F3E",
  borderRadius: 16,
  paddingVertical: 15,
  paddingHorizontal: 18,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 18,
},

speakIcon: {
  fontSize: 22,
  marginRight: 9,
},

speakButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "700",
},

});