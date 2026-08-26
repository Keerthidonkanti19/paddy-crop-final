import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

export default function HomeScreen() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  return (
    // <SafeAreaView style={styles.container}>
    <SafeAreaView
  style={styles.container}
  edges={["top"]}
>
      <View style={styles.header}>
        <Text style={styles.logo}>🌾</Text>

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>
            {t.home.title}
          </Text>

          <Text style={styles.subtitle}>
            {t.home.tagline}
          </Text>
        </View>
      </View>

      {/* Language Selector */}
      <View style={styles.languageSection}>
        <Text style={styles.languageTitle}>
          🌐 Language
        </Text>

        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === "en" &&
                styles.languageButtonActive,
            ]}
            onPress={() => setLanguage("en")}
          >
            <Text
              style={[
                styles.languageButtonText,
                language === "en" &&
                  styles.languageButtonTextActive,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageButton,
              language === "te" &&
                styles.languageButtonActive,
            ]}
            onPress={() => setLanguage("te")}
          >
            <Text
              style={[
                styles.languageButtonText,
                language === "te" &&
                  styles.languageButtonTextActive,
              ]}
            >
              తెలుగు
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageButton,
              language === "hi" &&
                styles.languageButtonActive,
            ]}
            onPress={() => setLanguage("hi")}
          >
            <Text
              style={[
                styles.languageButtonText,
                language === "hi" &&
                  styles.languageButtonTextActive,
              ]}
            >
              हिन्दी
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === "ta" &&
                styles.languageButtonActive,
            ]}
            onPress={() => setLanguage("ta")}
          >
            <Text
              style={[
                styles.languageButtonText,
                language === "ta" &&
                  styles.languageButtonTextActive,
              ]}
            >
              தமிழ்
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageButton,
              language === "kn" &&
                styles.languageButtonActive,
            ]}
            onPress={() => setLanguage("kn")}
          >
            <Text
              style={[
                styles.languageButtonText,
                language === "kn" &&
                  styles.languageButtonTextActive,
              ]}
            >
              ಕನ್ನಡ
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>
          {t.home.welcome}
        </Text>

        <Text style={styles.welcomeText}>
          {t.home.description}
        </Text>
      </View>

      {/* Detect Disease Button */}
      <TouchableOpacity
        style={styles.detectButton}
        activeOpacity={0.8}
        onPress={() => router.push("/predict")}
      >
        <Text style={styles.detectButtonText}>
          📷 {t.home.detectDisease}
        </Text>
      </TouchableOpacity>

      {/* What You Can Do */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          🌱 {t.home.whatYouCanDo}
        </Text>

        <Text style={styles.infoText}>
          • {t.home.uploadCapture}
        </Text>

        <Text style={styles.infoText}>
          • {t.home.identifyDisease}
        </Text>

        <Text style={styles.infoText}>
          • {t.home.fertilizerGuidance}
        </Text>

        <Text style={styles.infoText}>
          • {t.home.askAssistant}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FFF9",
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 18,
  },

  logo: {
    fontSize: 42,
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#087F3E",
  },

  subtitle: {
    fontSize: 14,
    color: "#5F6B64",
    marginTop: 2,
  },

  languageSection: {
    marginBottom: 18,
  },

  languageTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 10,
  },

  languageButtons: {
    flexDirection: "row",
    marginBottom: 8,
  },

  languageButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE9DF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
  },

  languageButtonActive: {
    backgroundColor: "#08A64A",
    borderColor: "#08A64A",
  },

  languageButtonText: {
    fontSize: 13,
    color: "#405047",
  },

  languageButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  welcomeCard: {
    backgroundColor: "#E9F8EE",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 8,
  },

  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#405047",
  },

  detectButton: {
    backgroundColor: "#08A64A",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
  },

  detectButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DCE9DF",
  },

  infoTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 14,
  },

  infoText: {
    fontSize: 15,
    color: "#4C5A51",
    marginBottom: 10,
    lineHeight: 21,
  },
});