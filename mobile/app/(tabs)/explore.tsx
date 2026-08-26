import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import {
  fetchHistory,
  getUserData,
  logout,
  HistoryItem,
} from "../../api/client";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const userData = await getUserData();

      if (!userData?.user_id) {
        router.replace("/auth");
        return;
      }

      setUser(userData);

      const historyData = await fetchHistory(userData.user_id);
      setHistory(historyData);
    } catch (error) {
      console.log("Profile error:", error);

      Alert.alert(
        "Unable to load profile",
        "Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/auth");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      // <SafeAreaView style={styles.container}>
      <SafeAreaView
  style={styles.container}
  edges={["top"]}
>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#08A64A" />

          <Text style={styles.loadingText}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    // <SafeAreaView style={styles.container}>
    <SafeAreaView
  style={styles.container}
  edges={["top"]}
>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProfile(true)}
            tintColor="#08A64A"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>👤</Text>

          <View>
            <Text style={styles.title}>Profile</Text>

            <Text style={styles.subtitle}>
              Your Khet Saathi account
            </Text>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username
                ? user.username.charAt(0).toUpperCase()
                : "👨‍🌾"}
            </Text>
          </View>

          <Text style={styles.username}>
            {user?.username || "Farmer"}
          </Text>

          <Text style={styles.mobileNumber}>
            {user?.mobile_number || "Mobile number unavailable"}
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.statsIcon}>🌾</Text>

          <View style={styles.statsContent}>
            <Text style={styles.statsNumber}>
              {history.length}
            </Text>

            <Text style={styles.statsLabel}>
              Total Disease Detections
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            Account Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Username
            </Text>

            <Text style={styles.infoValue}>
              {user?.username || "-"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Mobile Number
            </Text>

            <Text style={styles.infoValue}>
              {user?.mobile_number || "-"}
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutIcon}>↪</Text>

          <Text style={styles.logoutText}>
            Logout
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
    paddingTop: 18,
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  headerIcon: {
    fontSize: 38,
    marginRight: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#123B24",
  },

  subtitle: {
    fontSize: 13,
    color: "#68756D",
    marginTop: 3,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#68756D",
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE9DF",
    marginBottom: 16,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#E9F8EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#087F3E",
  },

  username: {
    fontSize: 22,
    fontWeight: "700",
    color: "#123B24",
  },

  mobileNumber: {
    fontSize: 14,
    color: "#68756D",
    marginTop: 5,
  },

  statsCard: {
    backgroundColor: "#E9F8EE",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  statsIcon: {
    fontSize: 38,
    marginRight: 15,
  },

  statsContent: {
    flex: 1,
  },

  statsNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#087F3E",
  },

  statsLabel: {
    fontSize: 14,
    color: "#45634F",
    marginTop: 2,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DCE9DF",
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 15,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
  },

  infoLabel: {
    fontSize: 14,
    color: "#68756D",
  },

  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "600",
    color: "#123B24",
  },

  divider: {
    height: 1,
    backgroundColor: "#EDF2EE",
    marginVertical: 14,
  },

  logoutButton: {
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#F2CACA",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutIcon: {
    fontSize: 22,
    color: "#B52B2B",
    marginRight: 8,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B52B2B",
  },
});