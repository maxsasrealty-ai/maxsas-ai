import { ScrollView, StyleSheet, Text, View } from "react-native";

const transcript = [
  {
    role: "Bot",
    message: "Namaste, main Maxsas Realty se bol raha hoon...",
  },
  {
    role: "User",
    message: "Haan bataiye.",
  },
  {
    role: "Bot",
    message: "Aap kis type ki property dekh rahe hain?",
  },
];

export default function TranscriptViewerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call Transcript</Text>

      {/* Future data sources: Ringg AI webhook payloads + Firestore call_logs transcript snapshots. */}

      <ScrollView contentContainerStyle={styles.chatWrap}>
        {transcript.map((line, index) => (
          <View
            key={`${line.role}-${index}`}
            style={[styles.bubble, line.role === "Bot" ? styles.botBubble : styles.userBubble]}
          >
            <Text style={styles.roleText}>{line.role}:</Text>
            <Text style={styles.messageText}>{line.message}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB", padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  chatWrap: { gap: 8, paddingBottom: 20 },
  bubble: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
  },
  botBubble: {
    backgroundColor: "#ECFEFF",
    borderColor: "#A5F3FC",
    alignSelf: "flex-start",
    maxWidth: "92%",
  },
  userBubble: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE3EE",
    alignSelf: "flex-end",
    maxWidth: "92%",
  },
  roleText: { fontSize: 12, color: "#0F766E", fontWeight: "700", marginBottom: 2 },
  messageText: { fontSize: 14, color: "#0F172A" },
});
