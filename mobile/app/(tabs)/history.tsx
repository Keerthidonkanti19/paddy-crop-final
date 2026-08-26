import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFocusEffect } from "expo-router";

import {
  fetchHistory,
  getUserData,
  HistoryItem,
} from "../../api/client";

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const user = await getUserData();

      if (!user?.user_id) {
        throw new Error("User information not found.");
      }

      const data = await fetchHistory(user.user_id);

      setHistory(data);
    } catch (err: any) {
      console.log("History error:", err);

      setError(
        err?.message ||
          "Unable to load prediction history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      // <SafeAreaView style={styles.container}>
      <SafeAreaView
  style={styles.container}
  edges={["top"]}
>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#08A64A"
          />

          <Text style={styles.loadingText}>
            Loading history...
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
            onRefresh={() => loadHistory(true)}
            tintColor="#08A64A"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📋</Text>

          <View>
            <Text style={styles.title}>
              Prediction History
            </Text>

            <Text style={styles.subtitle}>
              Your previous paddy disease detections
            </Text>
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              ⚠️ Unable to load history
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* Empty state */}
        {!error && history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🌾
            </Text>

            <Text style={styles.emptyTitle}>
              No predictions yet
            </Text>

            <Text style={styles.emptyText}>
              Your disease detection results will
              appear here after you analyze a paddy
              leaf.
            </Text>
          </View>
        ) : null}

        {/* History */}
        {history.map((item) => (
          <View
            key={item.id}
            style={styles.historyCard}
          >
            <View style={styles.cardHeader}>
              <View style={styles.diseaseContainer}>
                <Text style={styles.leafIcon}>
                  🌿
                </Text>

                <View>
                  <Text style={styles.diseaseName}>
                    {item.predicted_disease}
                  </Text>

                  <Text style={styles.date}>
                    {formatDate(item.timestamp)}
                  </Text>
                </View>
              </View>

              {item.confidence_score ? (
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {item.confidence_score}%
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Fertilizer */}
            {item.fertilizers ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  🌱 Fertilizer
                </Text>

                <Text style={styles.sectionText}>
                  {item.fertilizers}
                </Text>
              </View>
            ) : null}

            {/* Pesticide */}
            {item.pesticides ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  🧴 Pesticide
                </Text>

                <Text style={styles.sectionText}>
                  {item.pesticides}
                </Text>
              </View>
            ) : null}
          </View>
        ))}

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
    paddingBottom: 30,
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

  errorCard: {
    backgroundColor: "#FFF1F1",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9A2929",
    marginBottom: 6,
  },

  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6E3A3A",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE9DF",
    marginTop: 20,
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#68756D",
    textAlign: "center",
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCE9DF",
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  diseaseContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  leafIcon: {
    fontSize: 30,
    marginRight: 10,
  },

  diseaseName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#123B24",
  },

  date: {
    fontSize: 12,
    color: "#7A867E",
    marginTop: 3,
  },

  confidenceBadge: {
    backgroundColor: "#E9F8EE",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginLeft: 8,
  },

  confidenceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#087F3E",
  },

  section: {
    borderTopWidth: 1,
    borderTopColor: "#EDF2EE",
    paddingTop: 12,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#123B24",
    marginBottom: 5,
  },

  sectionText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#536057",
  },
});