import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  criarEvento,
  buscarEventos,
  deletarEvento,
  atualizarEvento,
} from "@/service/eventoService";
import { buscarLocais } from "@/service/localService";
import { buscarCategorias } from "@/service/categoriaService";
import {
  IEventoFormatado,
  ILocalFormatado,
  ICategoriaFormatada,
} from "../types";

const EventosScreen = () => {
  const [eventos, setEventos] = useState<IEventoFormatado[]>([]);
  const [locais, setLocais] = useState<ILocalFormatado[]>([]);
  const [categorias, setCategorias] = useState<ICategoriaFormatada[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<string | null>(null);
  const [originalCategoriasIds, setOriginalCategoriasIds] = useState<string[]>(
    []
  );

  const [novoEvento, setNovoEvento] = useState({
    nomeEvt: "",
    Descricao: "",
    Data: new Date(),
    status: true,
    localId: "",
    categoriasIds: [] as string[],
  });

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      const eventosCarregados = await buscarEventos();
      const locaisCarregados = await buscarLocais();
      const categoriasCarregadas = await buscarCategorias();

      console.log("Eventos carregados:", eventosCarregados);
      setLocais(locaisCarregados);
      setCategorias(categoriasCarregadas);

      const eventosFormatados: IEventoFormatado[] = eventosCarregados.map(
        (evento: any) => ({
          id: evento.objectId,
          NomeEvt: evento.NomeEvt,
          Descricao: evento.Descricao,
          Data: new Date(evento.Data.iso),
          status: evento.status,
          local: evento.local
            ? {
                id: evento.local.id || evento.local.objectId,
                Nome: evento.local.Nome,
                Capacidade: evento.local.Capacidade,
              }
            : null,
          categorias: (
            evento.categorias?.results ||
            evento.categorias ||
            []
          ).map((cat: any) => ({
            id: cat.objectId || cat.id,
            Nome: cat.Nome,
          })),
        })
      );

      console.log("Eventos formatados:", eventosFormatados); // Para debug
      setEventos(eventosFormatados);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        "Não foi possível carregar os dados.\n" + error.message
      );
      console.error("Erro ao carregar dados iniciais:", error);
    } finally {
      setLoading(false);
    }
  };

  const prepararEdicao = (evento: IEventoFormatado) => {
    setEventoEditando(evento.id);
    setOriginalCategoriasIds(evento.categorias?.map((c) => c.id) || []);
    setNovoEvento({
      nomeEvt: evento.NomeEvt,
      Descricao: evento.Descricao,
      Data: evento.Data,
      status: evento.status,
      localId: evento.local?.id || "",
      categoriasIds: evento.categorias?.map((c) => c.id) || [],
    });
    setModalVisible(true);
  };

  const handleCriarOuAtualizarEvento = async () => {
    console.log("Dados sendo enviados:", {
      ...novoEvento,
      categoriasIds: novoEvento.categoriasIds,
      categoriasCount: novoEvento.categoriasIds.length,
    });

    if (!novoEvento.nomeEvt || !novoEvento.Descricao || !novoEvento.localId) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios!");
      return;
    }

    if (novoEvento.categoriasIds.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos uma categoria!");
      return;
    }

    setLoading(true);

    try {
      if (eventoEditando) {
        // Calcular diferenças nas categorias
        const categoriasAtuais = new Set(novoEvento.categoriasIds);
        const categoriasOriginais = new Set(originalCategoriasIds);

        const categoriasParaAdicionar = [...categoriasAtuais].filter(
          (id) => !categoriasOriginais.has(id)
        );
        const categoriasParaRemover = [...categoriasOriginais].filter(
          (id) => !categoriasAtuais.has(id)
        );

        await atualizarEvento(
          eventoEditando,
          {
            NomeEvt: novoEvento.nomeEvt,
            Descricao: novoEvento.Descricao,
            Data: novoEvento.Data,
            status: novoEvento.status,
          },
          novoEvento.localId,
          categoriasParaAdicionar,
          categoriasParaRemover
        );
        Alert.alert("Sucesso", "Evento atualizado com sucesso!");
      } else {
        await criarEvento(
          {
            NomeEvt: novoEvento.nomeEvt,
            Descricao: novoEvento.Descricao,
            Data: novoEvento.Data,
            status: novoEvento.status,
          },
          novoEvento.localId,
          novoEvento.categoriasIds
        );
        Alert.alert("Sucesso", "Evento criado com sucesso!");
      }

      setModalVisible(false);
      resetForm();
      await carregarDadosIniciais();
    } catch (error: any) {
      console.error("Erro completo:", {
        error: error,
        response: error.response?.data,
      });
      Alert.alert(
        "Erro",
        eventoEditando
          ? `Erro ao atualizar evento: ${error.message}`
          : `Erro ao criar evento: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNovoEvento({
      nomeEvt: "",
      Descricao: "",
      Data: new Date(),
      status: true,
      localId: "",
      categoriasIds: [],
    });
    setEventoEditando(null);
    setOriginalCategoriasIds([]); // Reset original categories
  };

  const handleDeletarEvento = async (id: string) => {
    setLoading(true);
    try {
      await deletarEvento(id); // Using deletarEvento which only deletes the event object
      Alert.alert("Sucesso", "Evento deletado com sucesso!");
      await carregarDadosIniciais();
    } catch (error: any) {
      Alert.alert("Erro ao deletar", error.message);
      console.error("Erro ao deletar evento:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("IDs de categorias enviados:", {
    localId: novoEvento.localId,
    categoriasIds: novoEvento.categoriasIds,
    todasValidas: novoEvento.categoriasIds.every(
      (id) => typeof id === "string" && id.length > 0
    ),
  });

  const toggleCategoria = (categoriaId: string) => {
    setNovoEvento((prev) => ({
      ...prev,
      categoriasIds: prev.categoriasIds.includes(categoriaId)
        ? prev.categoriasIds.filter((id) => id !== categoriaId)
        : [...prev.categoriasIds, categoriaId],
    }));
  };

  const renderEventoItem = ({ item }: { item: IEventoFormatado }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>{item.NomeEvt}</Text>
      <Text style={styles.eventItemText}>Descrição: {item.Descricao}</Text>
      <Text style={styles.eventItemText}>
        Data: {item.Data.toLocaleString()}
      </Text>
      <Text style={styles.eventItemText}>
        Status: {item.status ? "Ativo" : "Inativo"}
      </Text>
      <Text style={styles.eventItemText}>
        Local: {item.local?.Nome || "N/A"}
      </Text>
      <Text style={styles.eventItemText}>
        Categorias:{" "}
        {item.categorias?.map((c) => c.Nome).join(", ") || "Nenhuma"}
      </Text>

      <View style={styles.eventButtons}>
        <Button
          title="Editar"
          onPress={() => prepararEdicao(item)}
          color="#4CAF50"
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Deletar"
          onPress={() => handleDeletarEvento(item.id)}
          color="#ff6347"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meus Eventos</Text>
      <Button
        title="Criar novo Evento"
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
        color="#4CAF50"
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loadingIndicator}
        />
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id}
          renderItem={renderEventoItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum evento encontrado. Crie um!
            </Text>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {eventoEditando ? "Editar Evento" : "Criar Novo Evento"}
          </Text>

          <Text style={styles.label}>Nome do Evento*</Text>
          <TextInput
            style={styles.input}
            value={novoEvento.nomeEvt}
            onChangeText={(text) =>
              setNovoEvento({ ...novoEvento, nomeEvt: text })
            }
            placeholder="Digite o nome do evento"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Descrição*</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={novoEvento.Descricao}
            onChangeText={(text) =>
              setNovoEvento({ ...novoEvento, Descricao: text })
            }
            placeholder="Digite a descrição do evento"
            placeholderTextColor="#888"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Data do Evento*</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: "#333" }}>
              {novoEvento.Data.toLocaleString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={novoEvento.Data}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setNovoEvento({ ...novoEvento, Data: selectedDate });
                }
              }}
            />
          )}

          <Text style={styles.label}>Status</Text>
          <Picker
            selectedValue={novoEvento.status ? "ativo" : "inativo"}
            onValueChange={(itemValue) =>
              setNovoEvento({ ...novoEvento, status: itemValue === "ativo" })
            }
            style={styles.picker}
            itemStyle={{ color: "#333" }}
          >
            <Picker.Item label="Ativo" value="ativo" />
            <Picker.Item label="Inativo" value="inativo" />
          </Picker>

          <Text style={styles.label}>Local*</Text>
          <Picker
            selectedValue={novoEvento.localId}
            onValueChange={(itemValue) =>
              setNovoEvento({ ...novoEvento, localId: itemValue })
            }
            style={styles.picker}
            itemStyle={{ color: "#333" }}
          >
            <Picker.Item label="Selecione um local..." value="" />
            {locais.map((local) => (
              <Picker.Item key={local.id} label={local.Nome} value={local.id} />
            ))}
          </Picker>

          <Text style={styles.label}>Categorias*</Text>
          <View style={styles.categoriasContainer}>
            {categorias.map((categoria) => (
              <TouchableOpacity
                key={categoria.id}
                style={[
                  styles.categoriaButton,
                  novoEvento.categoriasIds.includes(categoria.id) &&
                    styles.categoriaButtonSelected,
                ]}
                onPress={() => toggleCategoria(categoria.id)}
              >
                <Text
                  key={`text-${categoria.id}`}
                  style={[
                    styles.categoriaText,
                    novoEvento.categoriasIds.includes(categoria.id) &&
                      styles.categoriaTextSelected,
                  ]}
                >
                  {categoria.Nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <Button
              title="Cancelar"
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              color="#f44336"
            />
            <Button
              title={eventoEditando ? "Atualizar Evento" : "Criar Evento"}
              onPress={handleCriarOuAtualizarEvento}
              disabled={loading}
              color="#4CAF50"
            />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  eventItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  eventItemText: {
    color: "#333",
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#0056b3",
  },
  eventButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  buttonSpacer: {
    width: 10,
  },
  loadingIndicator: {
    marginTop: 30,
  },
  emptyText: {
    marginTop: 30,
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    color: "#333",
  },
  categoriasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  categoriaButton: {
    padding: 10,
    margin: 5,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  categoriaButtonSelected: {
    backgroundColor: "#4CAF50",
  },
  categoriaText: {
    color: "#333",
  },
  categoriaTextSelected: {
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
});

export default EventosScreen;
