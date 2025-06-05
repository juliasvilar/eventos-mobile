import { Tabs } from "expo-router";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function Layout() {
  return (
    <React.Fragment>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#8aaee0",
            paddingTop: 8,
            height: 80,
          },
           headerStyle: {
            backgroundColor: "#8aaee0",
          },
          headerTintColor: "353535",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#353535",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={22} color={color} />
            ),
            title: "Início",
          }}
        />
        <Tabs.Screen
          name="eventos"
          options={{
            title: "Todos os eventos",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="bars" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="eventosData"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="calendar" size={22} color={color} />
            ),
            title: "Eventos por data",
          }}
        />
        <Tabs.Screen
          name="gerenciarCategoriasLocais"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="tag" size={22} color={color} />
            ),
            title: "Gerenciar",
          }}
        />
      </Tabs>
    </React.Fragment>
  );
}
