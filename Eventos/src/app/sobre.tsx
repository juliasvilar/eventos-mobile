import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState } from "react";

const ferramentas = [ 
  "Typescript",
  "Javascript",
  "React",
  "React Native",
  "Expo",
  "Expo Router",
  "Zustand",
  "Back4app"
];

export default function Sobre() {
  const [setHoveredSkill] = useState<string | null>(null);

  return (
    <View style={styles.fundo}>
      <View style={styles.topo}>
        <Text style={styles.titulo}>Descrição do projeto</Text>
      </View>

      <View style={styles.corpo}>
        <Text style={styles.descricao}>
          Aplicativo desenvolvido para a disciplina de Programação Web e Mobile, simulando o gerenciamento de eventos de pequenas e médias empresas. Seja capaz de criar e personalizar seu próprio evento!
      </Text>

        <Text style={styles.sectionTitle}>Ferramentas</Text>
        <View style={styles.skillsContainer}>
          {ferramentas.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[
                styles.skillBox,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.skillText,
                ]}
                >
                  {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  },
  topo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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
  sectionTitle: {
    fontFamily: "Platypi-ExtraBold", 
    fontSize: 22,
    color: "#192524",
    marginTop: 20, 
    marginBottom: 30,
    textAlign: 'center', 
    width: '100%',
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10, 
    marginBottom: 10,
  },
  skillBox: {
    backgroundColor: "#5b86c5", 
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: "#3969b1",
    shadowColor: "#434343",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  skillText: {
    fontFamily: "Platypi-ExtraBold",
    fontSize: 17,
    color: "#fff",
  },
})