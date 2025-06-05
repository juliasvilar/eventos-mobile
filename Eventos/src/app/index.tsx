import { View, Text, StyleSheet} from "react-native";

export default function Home() {
  return (
    <View style={styles.fundo}>

      <View style={styles.topo}>
        <Text style={styles.titulo}>Gerenciador de Eventos{'\n'}da sua Empresa</Text>
      </View>

      <View style={styles.corpo}>
        <Text style={styles.descricao}>Aplicativo desenvolvido para a disciplina de Programação Web e Mobile, simulando
          o gerenciamento de eventos de pequenas e médias empresas.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "#D5DEEF",
    padding: 30,
  },
  topo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  titulo: {
    fontSize: 25,
    fontWeight: "600",
    color: "#000",
    maxWidth: "80%",
    textAlign: "center",
  },
  corpo: {
    marginTop: 50,
    justifyContent: "center",
  },
  descricao:{
    textAlign: "justify"
  }
});
