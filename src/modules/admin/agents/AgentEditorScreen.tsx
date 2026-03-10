import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type ProviderType = "Ringg" | "Other";

type PromptSections = {
  introduction: string;
  conversationFlow: string;
  leadQualification: string;
  pitchLogic: string;
  objectionHandling: string;
  closingMessage: string;
};

export default function AgentEditorScreen() {
  const [agentName, setAgentName] = useState("Real Estate Qualifier");
  const [provider, setProvider] = useState<ProviderType>("Ringg");
  const [language, setLanguage] = useState("Hindi + English");
  const [tone, setTone] = useState("Professional");

  const [introductionPrompt, setIntroductionPrompt] = useState(
    "Namaste, main Maxsas Realty se bol raha hoon..."
  );
  const [qualificationQuestions, setQualificationQuestions] = useState(
    "Aap budget range kya target kar rahe hain?\nPreferred location kaunsa hai?"
  );
  const [pitchLogic, setPitchLogic] = useState(
    "Project benefits ko user preference ke hisab se map karo."
  );
  const [objectionHandling, setObjectionHandling] = useState(
    "Agar budget concern ho to alternate options suggest karo."
  );
  const [closingScript, setClosingScript] = useState(
    "Kya main aapke liye site visit schedule kar doon?"
  );

  const [sections, setSections] = useState<PromptSections>({
    introduction: "Greeting + consent",
    conversationFlow: "Qualification -> Pitch -> Objection -> Close",
    leadQualification: "Budget, timeline, location fit",
    pitchLogic: "Top 2 projects with clear reasons",
    objectionHandling: "Handle price and location objections",
    closingMessage: "Confirm next step and schedule callback",
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Agent Editor</Text>

      <TextInput style={styles.input} value={agentName} onChangeText={(value: string) => setAgentName(value)} placeholder="Agent Name" placeholderTextColor="#94A3B8" />
      <View style={styles.pillRow}>
        <Text style={styles.label}>Provider</Text>
        {(["Ringg", "Other"] as ProviderType[]).map((item) => (
          <Text key={item} style={[styles.pill, provider === item && styles.pillActive]} onPress={() => setProvider(item)}>
            {item}
          </Text>
        ))}
      </View>
      <TextInput style={styles.input} value={language} onChangeText={(value: string) => setLanguage(value)} placeholder="Language" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.input} value={tone} onChangeText={(value: string) => setTone(value)} placeholder="Tone" placeholderTextColor="#94A3B8" />

      <TextInput style={styles.textArea} multiline value={introductionPrompt} onChangeText={(value: string) => setIntroductionPrompt(value)} placeholder="Introduction Prompt" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.textArea} multiline value={qualificationQuestions} onChangeText={(value: string) => setQualificationQuestions(value)} placeholder="Qualification Questions" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.textArea} multiline value={pitchLogic} onChangeText={(value: string) => setPitchLogic(value)} placeholder="Pitch Logic" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.textArea} multiline value={objectionHandling} onChangeText={(value: string) => setObjectionHandling(value)} placeholder="Objection Handling" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.textArea} multiline value={closingScript} onChangeText={(value: string) => setClosingScript(value)} placeholder="Closing Script" placeholderTextColor="#94A3B8" />

      <Text style={styles.sectionTitle}>Prompt Structure</Text>
      <TextInput style={styles.textArea} multiline value={sections.introduction} onChangeText={(value: string) => setSections((prev) => ({ ...prev, introduction: value }))} placeholder="Introduction" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.textArea} multiline value={sections.conversationFlow} onChangeText={(value: string) => setSections((prev) => ({ ...prev, conversationFlow: value }))} placeholder="Conversation Flow" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.textArea} multiline value={sections.leadQualification} onChangeText={(value: string) => setSections((prev) => ({ ...prev, leadQualification: value }))} placeholder="Lead Qualification" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.textArea} multiline value={sections.pitchLogic} onChangeText={(value: string) => setSections((prev) => ({ ...prev, pitchLogic: value }))} placeholder="Pitch Logic" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.textArea} multiline value={sections.objectionHandling} onChangeText={(value: string) => setSections((prev) => ({ ...prev, objectionHandling: value }))} placeholder="Objection Handling" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.textArea} multiline value={sections.closingMessage} onChangeText={(value: string) => setSections((prev) => ({ ...prev, closingMessage: value }))} placeholder="Closing Message" placeholderTextColor="#94A3B8" />

      <View style={styles.actionsRow}>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save New Version</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  content: { padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  input: {
    borderWidth: 1,
    borderColor: "#D3DCE8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },
  label: { fontSize: 13, color: "#334155", fontWeight: "700" },
  pillRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  pill: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: "#334155",
    backgroundColor: "#FFFFFF",
  },
  pillActive: { borderColor: "#0F766E", backgroundColor: "#ECFEFF", color: "#0F766E" },
  textArea: {
    borderWidth: 1,
    borderColor: "#D3DCE8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 88,
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },
  sectionTitle: { fontSize: 16, color: "#0F172A", fontWeight: "700", marginTop: 4 },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  primaryButton: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: { color: "#475569", fontWeight: "700", fontSize: 14 },
});
