import { Text, View } from 'react-native';

export default function AdminIndex() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Admin Panel</Text>
      <Text>Welcome, Admin!</Text>
    </View>
  );
}
