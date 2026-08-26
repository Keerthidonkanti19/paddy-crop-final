import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import { predictImage } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../locales/translations";

export default function PredictScreen() {
  const [imageUri, setImageUri] =
    useState<string | null>(null);

  const [cameraVisible, setCameraVisible] =
    useState(false);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [analyzing, setAnalyzing] =
    useState(false);

  const cameraRef =
    useRef<CameraView | null>(null);

  // -----------------------------
  // Language
  // -----------------------------
  const { language } = useLanguage();
  const t = translations[language];

  // -----------------------------
  // Open Camera
  // -----------------------------
  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert(
          t.predict.cameraPermissionTitle,
          t.predict.cameraPermission
        );

        return;
      }
    }

    setCameraVisible(true);
  };

  // -----------------------------
  // Pick Image From Gallery
  // -----------------------------
  const pickFromGallery = async () => {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 1,
        });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log(
        "Gallery error:",
        error
      );

      Alert.alert(
        t.common.error,
        "Unable to select image."
      );
    }
  };

  // -----------------------------
  // Take Photo
  // -----------------------------
  const takePhoto = async () => {
    if (!cameraRef.current) {
      return;
    }

    try {
      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 1,
        });

      if (photo?.uri) {
        setImageUri(photo.uri);
        setCameraVisible(false);
      }
    } catch (error) {
      console.log(
        "Camera capture error:",
        error
      );

      Alert.alert(
        t.common.error,
        "Unable to capture image."
      );
    }
  };

  // -----------------------------
  // Analyze Disease
  // -----------------------------
  const analyzeDisease = async () => {
    if (!imageUri) {
      Alert.alert(
        t.predict.noImageTitle,
        t.predict.noImageMessage
      );

      return;
    }

    try {
      setAnalyzing(true);

      console.log(
        "Sending prediction language:",
        language
      );

      const result = await predictImage(
        imageUri,
        language
      );

      console.log(
        "Prediction result:",
        result
      );

      router.push({
        pathname: "/result",
        params: {
          disease:
            result.predicted_disease,

          confidence:
            result.confidence_score
              ? String(
                  result.confidence_score
                )
              : "0",

          fertilizers:
            result.fertilizers || "",

          pesticides:
            result.pesticides || "",

          warning:
            result.warning || "",
        },
      });
    } catch (error: any) {
      console.log(
        "Prediction error:",
        error
      );

      Alert.alert(
        t.predict.predictionFailed,
        error?.message ||
          t.predict.predictionFailedMessage
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // -----------------------------
  // Camera Screen
  // -----------------------------
  if (cameraVisible) {
    return (
      // <SafeAreaView
      //   style={styles.cameraContainer}
      // >
      <SafeAreaView
  style={styles.container}
  edges={["top"]}
>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View
            style={styles.cameraControls}
          >
            <TouchableOpacity
              style={
                styles.cancelCameraButton
              }
              onPress={() =>
                setCameraVisible(false)
              }
            >
              <Text
                style={
                  styles.cancelCameraText
                }
              >
                {t.predict.cancel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePhoto}
            >
              <View
                style={
                  styles.captureButtonInner
                }
              />
            </TouchableOpacity>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  // -----------------------------
  // Main Predict Screen
  // -----------------------------
  return (
    // <SafeAreaView
    //   style={styles.container}
    // >
    <SafeAreaView
  style={styles.container}
  edges={["top"]}
>
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </TouchableOpacity>

          <Text
            style={styles.headerTitle}
          >
            {t.predict.title}
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.infoCard}>
          <Text
            style={styles.infoTitle}
          >
            {t.predict.checkLeaf}
          </Text>

          <Text
            style={styles.infoText}
          >
            {t.predict.instructions}
          </Text>
        </View>

        {/* Image Area */}
        <View style={styles.imageBox}>
          {imageUri ? (
            <Image
              source={{
                uri: imageUri,
              }}
              style={
                styles.selectedImage
              }
              resizeMode="contain"
            />
          ) : (
            <>
              <Text
                style={styles.imageIcon}
              >
                🌿
              </Text>

              <Text
                style={styles.imageTitle}
              >
                {t.predict.noImage}
              </Text>

              <Text
                style={styles.imageText}
              >
                {
                  t.predict
                    .uploadCapture
                }
              </Text>
            </>
          )}
        </View>

        {/* Capture Button */}
        <TouchableOpacity
          style={
            styles.primaryButton
          }
          activeOpacity={0.8}
          onPress={openCamera}
        >
          <Text
            style={styles.buttonIcon}
          >
            📷
          </Text>

          <Text
            style={
              styles.primaryButtonText
            }
          >
            {t.predict.capture}
          </Text>
        </TouchableOpacity>

        {/* Gallery Button */}
        <TouchableOpacity
          style={
            styles.secondaryButton
          }
          activeOpacity={0.8}
          onPress={pickFromGallery}
        >
          <Text
            style={styles.buttonIcon}
          >
            🖼️
          </Text>

          <Text
            style={
              styles.secondaryButtonText
            }
          >
            {t.predict.gallery}
          </Text>
        </TouchableOpacity>

        {/* Analyze Button */}
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            !imageUri &&
              styles.analyzeButtonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={
            !imageUri || analyzing
          }
          onPress={analyzeDisease}
        >
          <Text
            style={[
              styles.analyzeButtonText,
              imageUri &&
                styles.analyzeButtonTextActive,
            ]}
          >
            {analyzing
              ? t.predict.analyzing
              : t.predict.analyze}
          </Text>
        </TouchableOpacity>

        {/* Note */}
        <Text style={styles.note}>
          {t.predict.note}
        </Text>

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
    paddingHorizontal: 20,
    paddingTop: 12,
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

  infoCard: {
    backgroundColor: "#E9F8EE",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  infoTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 7,
  },

  infoText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#405047",
  },

  imageBox: {
    height: 230,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCE9DF",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    overflow: "hidden",
  },

  selectedImage: {
    width: "100%",
    height: "100%",
  },

  imageIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  imageTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 6,
  },

  imageText: {
    fontSize: 13,
    color: "#68756D",
    textAlign: "center",
    paddingHorizontal: 10,
  },

  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#08A64A",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  buttonIcon: {
    fontSize: 20,
    marginRight: 9,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#08A64A",
    marginBottom: 14,
  },

  secondaryButtonText: {
    color: "#087F3E",
    fontSize: 17,
    fontWeight: "700",
  },

  analyzeButton: {
    backgroundColor: "#DDEBE2",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  analyzeButtonDisabled: {
    opacity: 0.8,
  },

  analyzeButtonText: {
    color: "#6A776E",
    fontSize: 17,
    fontWeight: "700",
  },

  analyzeButtonTextActive: {
    color: "#087F3E",
  },

  note: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#718078",
    marginTop: 16,
    paddingHorizontal: 10,
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },

  camera: {
    flex: 1,
  },

  cameraControls: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
  },

  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  captureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#08A64A",
  },

  cancelCameraButton: {
    position: "absolute",
    left: 20,
    bottom: 55,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor:
      "rgba(0,0,0,0.6)",
  },

  cancelCameraText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});