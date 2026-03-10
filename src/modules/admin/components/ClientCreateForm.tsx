import { createEnterpriseClient } from "@/src/modules/admin/services/createEnterpriseClient";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";

const parseNumber = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

type InputRowProps = {
  label: string;
  required?: boolean;
  helper?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
};

function InputRow({
  label,
  required,
  helper,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  secureTextEntry = false,
}: InputRowProps) {
  return (
    <View style={styles.fieldBlock}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required ? <Text style={styles.requiredMark}>*</Text> : null}
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#8AA0BD"
      />
      {helper ? <Text style={styles.helperText}>{helper}</Text> : null}
    </View>
  );
}

function Section({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

export default function ClientCreateForm() {
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const [aiProvider, setAiProvider] = useState("ringg");
  const [ringgAgentId, setRinggAgentId] = useState("");
  const [agentName, setAgentName] = useState("");
  const [language, setLanguage] = useState("English");
  const [voice, setVoice] = useState("Female");

  const [initialWalletCredits, setInitialWalletCredits] = useState("0");

  const [maxConcurrentCalls, setMaxConcurrentCalls] = useState("5");
  const [callRecordingEnabled, setCallRecordingEnabled] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!companyName.trim() || !contactPerson.trim() || !email.trim() || !temporaryPassword.trim()) {
      Alert.alert("Missing details", "Please fill all required fields before provisioning.");
      return;
    }

    if (!ringgAgentId.trim()) {
      Alert.alert("Missing agent setup", "Please provide Ringg Agent ID (provider_agent_id).");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await createEnterpriseClient({
        company_name: companyName,
        contact_person: contactPerson,
        email,
        phone,
        temporary_password: temporaryPassword,
        ai_provider: aiProvider,
        provider_agent_id: ringgAgentId,
        agent_name: agentName || `${companyName} Agent`,
        language,
        voice,
        initial_wallet_credits: parseNumber(initialWalletCredits, 0),
        max_concurrent_calls: parseNumber(maxConcurrentCalls, 5),
        call_recording_enabled: callRecordingEnabled,
      });

      Alert.alert(
        "Enterprise client created",
        `client_id: ${result.client_id}\nauth_uid: ${result.auth_uid}`
      );

      setCompanyName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setTemporaryPassword("");
      setAiProvider("ringg");
      setRinggAgentId("");
      setAgentName("");
      setLanguage("English");
      setVoice("Female");
      setInitialWalletCredits("0");
      setMaxConcurrentCalls("5");
      setCallRecordingEnabled(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Provisioning failed.";
      Alert.alert("Provisioning failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 84 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formShell}>
          <View style={styles.pageHeader}>
            <Text style={styles.title}>Create Enterprise Client</Text>
            <Text style={styles.subtitle}>Set up client profile, agent settings, and system limits in one go.</Text>
          </View>

          <View style={styles.sectionCard}>
            <Section title="Client Details" subtitle="Primary business and admin access details" />
            <InputRow label="Company Name" required value={companyName} onChangeText={setCompanyName} placeholder="Maxsas Realty Pvt Ltd" autoCapitalize="words" />
            <InputRow label="Contact Person" required value={contactPerson} onChangeText={setContactPerson} placeholder="Ravi Sharma" autoCapitalize="words" />
            <InputRow label="Email" required value={email} onChangeText={setEmail} placeholder="admin@company.com" keyboardType="email-address" />
            <InputRow label="Phone" value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" autoCapitalize="none" />
            <InputRow
              label="Temporary Password"
              required
              value={temporaryPassword}
              onChangeText={setTemporaryPassword}
              placeholder="Set temporary login password"
              secureTextEntry
              helper="Client can change this password after first login."
            />
          </View>

          <View style={styles.sectionCard}>
            <Section title="AI Agent Setup" subtitle="Connect the client with an active voice agent" />
            <InputRow label="AI Provider" value={aiProvider} onChangeText={setAiProvider} placeholder="ringg" helper="Keep this as ringg unless your backend supports other providers." />
            <InputRow
              label="Ringg Agent ID"
              required
              value={ringgAgentId}
              onChangeText={setRinggAgentId}
              placeholder="provider_agent_id"
              helper="Required to route outbound calls through the correct agent."
            />
            <InputRow label="Agent Name" value={agentName} onChangeText={setAgentName} placeholder="Support Bot" helper="If left empty, we auto-generate this from company name." autoCapitalize="words" />
            <InputRow label="Language" value={language} onChangeText={setLanguage} placeholder="English" autoCapitalize="words" />
            <InputRow label="Voice" value={voice} onChangeText={setVoice} placeholder="Female" autoCapitalize="words" />
          </View>

          <View style={styles.sectionCard}>
            <Section title="Billing & Limits" subtitle="Define available credits and call behavior" />
            <InputRow
              label="Initial Wallet Credits"
              value={initialWalletCredits}
              onChangeText={setInitialWalletCredits}
              placeholder="0"
              keyboardType="numeric"
              helper="Starting balance available for calling operations."
            />
            <InputRow
              label="Max Concurrent Calls"
              value={maxConcurrentCalls}
              onChangeText={setMaxConcurrentCalls}
              placeholder="5"
              keyboardType="numeric"
              helper="Upper limit of simultaneous outbound calls."
            />

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Call Recording</Text>
                <Text style={styles.switchSubLabel}>Store recordings for QA and audit.</Text>
              </View>
              <Switch value={callRecordingEnabled} onValueChange={setCallRecordingEnabled} />
            </View>
          </View>

          <Pressable style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.submitButtonText}>Provision Enterprise Client</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF3F9" },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 34,
  },
  formShell: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    gap: 14,
  },
  pageHeader: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6E1EE",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0A2140",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#4D6481",
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6E1EE",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  sectionHeader: {
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0A2140",
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#5B7290",
  },
  fieldBlock: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#243B58",
    fontWeight: "700",
  },
  requiredMark: {
    color: "#D1395A",
    fontSize: 13,
    fontWeight: "800",
  },
  helperText: {
    fontSize: 11,
    color: "#5F7693",
    lineHeight: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#C6D5E6",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor: "#FDFEFF",
    color: "#0F172A",
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#C6D5E6",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: "#F7FAFE",
  },
  switchInfo: {
    flex: 1,
    paddingRight: 12,
  },
  switchLabel: {
    color: "#0B2442",
    fontSize: 14,
    fontWeight: "700",
  },
  switchSubLabel: {
    marginTop: 2,
    color: "#57708E",
    fontSize: 12,
  },
  submitButton: {
    marginTop: 4,
    backgroundColor: "#0B5BC9",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#074AA9",
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
});
