import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Home() {
  return (
    <View style={styles.fundo}>
      <View style={styles.container}>
        <Text style={styles.titulo}>
          Gerenciador de Eventos
        </Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: "center"
  },
  container: {
    maxHeight: "100%",
    backgroundColor: "#8aaee0",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  titulo: {
    fontSize: 28, 
    fontWeight: "700",
    color: "#192524",
    textAlign: "center",
    lineHeight: 35, 
  },
  corpo: {
    marginTop: 20,
    justifyContent: "center",
 },
  descricao: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    color: "#495057",
    marginBottom: 15,
  },
})