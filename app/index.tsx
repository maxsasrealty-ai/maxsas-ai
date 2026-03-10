import { StyleSheet, View } from "react-native";

import LandingPage from "@/src/features/public/LandingPage";

export default function Index() {
  return (
    <View style={styles.container}>
      <LandingPage />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
