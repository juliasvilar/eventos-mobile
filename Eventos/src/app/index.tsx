import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import CustomButton from "../components/customButtom";

export default function home() {
  const router = useRouter();

  return (
    <ScrollView>
      <View>
        <Text> Gerenciador de Eventos</Text>
        <Text> da sua Empresa</Text>
        <View>
          <CustomButton
            title="Acessar"
            onPress={() => router.push("/eventos")}
          />

          <CustomButton
            title="Gerenciar Eventos e Categorias"
            onPress={() => router.push("/gerenciarCategoriasLocais")}
          />

          <CustomButton
            title="Eventos por Data"
            onPress={() => router.push("/eventosData")}
          />
        </View>
      </View>
    </ScrollView>
  );
}
