import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  onTryDemo: () => void;
};

export function DemoSection({ onTryDemo }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>AI Calling Simulation</Text>
      <Text style={styles.subheading}>Preview the transcript, intent understanding, and final lead tagging in one live workflow.</Text>

      <View style={styles.simulationCard}>
        <View style={styles.column}>
          <Text style={styles.blockTitle}>Call Transcript</Text>
          <View style={styles.transcriptCard}>
            <Text style={styles.transcriptLine}>AI: Hello Rahul, are you searching for a 3BHK in Whitefield?</Text>
            <Text style={styles.transcriptLine}>Lead: Yes, 3BHK works. Budget around 80L to 90L.</Text>
            <Text style={styles.transcriptLine}>AI: Great, I can schedule a site visit for tomorrow evening.</Text>
          </View>
        </View>

        <View style={styles.column}>
          <Text style={styles.blockTitle}>AI Understanding</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoItem}>Intent: High</Text>
            <Text style={styles.infoItem}>Budget Match: Yes</Text>
            <Text style={styles.infoItem}>Location Match: Whitefield</Text>
            <Text style={styles.infoItem}>Next Action: Site visit call in 24h</Text>
          </View>
        </View>

        <View style={styles.column}>
          <Text style={styles.blockTitle}>Lead Classification</Text>
          <View style={styles.classificationCard}>
            <Text style={styles.classificationStatus}>Hot Lead</Text>
            <Text style={styles.classificationBody}>Buyer confirmed budget and property type, and accepted a site-visit recommendation.</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.button} onPress={onTryDemo}>
        <Text style={styles.buttonText}>Try AI Demo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 34,
    gap: 10,
  },
  heading: {
    fontSize: 32,
    lineHeight: 38,
    color: '#0B1F3A',
    fontWeight: '800',
  },
  subheading: {
    color: '#566884',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 760,
  },
  simulationCard: {
    marginTop: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(11,31,58,0.1)',
    padding: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  column: {
    flexGrow: 1,
    minWidth: 230,
    gap: 8,
  },
  blockTitle: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '700',
  },
  transcriptCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(79,140,255,0.2)',
    backgroundColor: '#F7FAFF',
    padding: 12,
    gap: 8,
  },
  transcriptLine: {
    color: '#273550',
    fontSize: 13,
    lineHeight: 20,
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(11,31,58,0.12)',
    padding: 12,
    gap: 8,
    backgroundColor: '#FCFDFF',
  },
  infoItem: {
    color: '#3A4A65',
    fontSize: 13,
    lineHeight: 18,
  },
  classificationCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,208,132,0.35)',
    backgroundColor: 'rgba(0,208,132,0.08)',
    gap: 8,
  },
  classificationStatus: {
    color: '#00A86B',
    fontSize: 18,
    fontWeight: '800',
  },
  classificationBody: {
    color: '#2E4B45',
    fontSize: 13,
    lineHeight: 19,
  },
  button: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: '#4F8CFF',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
