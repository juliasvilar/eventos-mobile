import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Início",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="eventos"
        options={{
          title: "",
          headerBackTitle: "Voltar",
        }}
      />
      <Stack.Screen
        name="eventosCategorias"
        options={{
          title: "",
          headerBackTitle: "Voltar",
        }}
      />
      <Stack.Screen
        name="eventosData"
        options={{
          title: "",
          headerBackTitle: "Voltar",
        }}
      />
    </Stack>
  );
}
