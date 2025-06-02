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

// Importe as funções dos seus arquivos de serviço
import {
  criarEvento,
  buscarEventos,
  buscarCategoriasDoEvento,
  deletarEvento,
} from "@/service/eventoService";
import { criarLocal, buscarLocais } from "@/service/localService";
import { criarCategoria, buscarCategorias } from "@/service/categoriaService";

// Importe suas interfaces de tipos
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
  const [ModalVisible, setModalVisible] = useState<boolean>(false);

  const [novoEvento, setNovoEvento] = useState({
    nomeEvt: "",
    Descricao: "",
    Data: new Date(),
    status: true,
    localId: "",
    categoriasIds: [] as string[],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      const eventosCarregados = await buscarEventos();
      const locaisCarregados = await buscarLocais();
      const categoriasCarregadas = await buscarCategorias();

      // --- LOGS PARA DEBUGAR A CARGA DE DADOS ---
      console.log("Locais carregados:", locaisCarregados);
      if (locaisCarregados && locaisCarregados.length === 0) {
        console.warn("A busca por locais retornou uma lista vazia. Verifique seu backend ou se há locais cadastrados.");
      }
      console.log("Categorias carregadas:", categoriasCarregadas);
      // --- FIM DOS LOGS ---

      setLocais(locaisCarregados);
      setCategorias(categoriasCarregadas);

      const eventosComCategorias: IEventoFormatado[] = await Promise.all(
        eventosCarregados.map(async (evento: IEventoFormatado) => {
          const cats = await buscarCategoriasDoEvento(evento.id);
          return { ...evento, categorias: cats };
        })
      );
      setEventos(eventosComCategorias);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        "Não foi possível carregar os dados. Verifique a conexão e as chaves do Back4app.\n" +
          error.message
      );
      // --- LOG DE ERRO MAIS DESCRITIVO ---
      console.error("Erro ao carregar dados iniciais:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarEvento = async () => {
    if (
      !novoEvento.nomeEvt ||
      !novoEvento.Descricao ||
      !novoEvento.localId ||
      novoEvento.categoriasIds.length === 0
    ) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    try {
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
      setModalVisible(false);
      resetForm();
      carregarDadosIniciais();
    } catch (error: any) {
      Alert.alert("Erro ao criar evento", error.message);
      console.error("Erro ao criar evento:", error); // Log mais específico
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
  };

  const handleDeletarEvento = async (id: string) => {
    setLoading(true);
    try {
      await deletarEvento(id);
      Alert.alert("Sucesso", "Evento deletado!");
      carregarDadosIniciais();
    } catch (error: any) {
      Alert.alert("Erro ao deletar", error.message);
      console.error("Erro ao deletar evento:", error); // Log mais específico
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoria = (categoriaId: string) => {
    setNovoEvento((prev) => {
      const alreadySelected = prev.categoriasIds.includes(categoriaId);
      if (alreadySelected) {
        return {
          ...prev,
          categoriasIds: prev.categoriasIds.filter((id) => id !== categoriaId),
        };
      } else {
        return {
          ...prev,
          categoriasIds: [...prev.categoriasIds, categoriaId],
        };
      }
    });
  };

  const renderEventoItem = ({ item }: { item: IEventoFormatado }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>{item.NomeEvt}</Text>
      {/* Aplicação do estilo eventItemText para cor preta */}
      <Text style={styles.eventItemText}>Descrição: {item.Descricao}</Text>
      <Text style={styles.eventItemText}>Data: {new Date(item.Data).toLocaleString()}</Text>
      <Text style={styles.eventItemText}>Status: {item.status ? "Ativo" : "Inativo"}</Text>
      <Text style={styles.eventItemText}>Local: {item.local ? item.local.Nome : "N/A"}</Text>
      <Text style={styles.eventItemText}>
        Capacidade do Local: {item.local ? item.local.Capacidade : "N/A"}
      </Text>
      <Text style={styles.eventItemText}>
        Categorias:{" "}
        {item.categorias
          ? item.categorias.map((c: ICategoriaFormatada) => c.Nome).join(", ")
          : "N/A"}
      </Text>
      <Button
        title="Deletar"
        onPress={() => handleDeletarEvento(item.id)}
        color="#ff6347"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meus Eventos</Text>
      <Button
        title="Criar novo Evento"
        onPress={() => setModalVisible(true)}
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
        visible={ModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Criar Novo Evento</Text>

          <Text style={styles.label}>Nome do Evento*</Text>
          <TextInput
            style={styles.input}
            value={novoEvento.nomeEvt}
            onChangeText={(text) =>
              setNovoEvento({ ...novoEvento, nomeEvt: text })
            }
            placeholder="Digite o nome do evento"
            placeholderTextColor="#888" // Adiciona cor ao placeholder
          />

          <Text style={styles.label}>Descrição*</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={novoEvento.Descricao}
            onChangeText={(text) =>
              setNovoEvento({ ...novoEvento, Descricao: text })
            }
            placeholder="Digite a descrição do evento"
            placeholderTextColor="#888" // Adiciona cor ao placeholder
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Data do Evento*</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            {/* Texto da data com cor preta garantida */}
            <Text style={{ color: '#333' }}>{novoEvento.Data.toLocaleString()}</Text>
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

          <Text style={styles.label}>Local*</Text>
          <Picker
            selectedValue={novoEvento.localId}
            onValueChange={(itemValue) =>
              setNovoEvento({ ...novoEvento, localId: itemValue })
            }
            style={styles.picker}
            // Adicione cor para o texto do Picker.Item caso necessário (específico para Android)
            itemStyle={{ color: '#333' }}
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
              title="Criar Evento"
              onPress={handleCriarEvento}
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
    shadowColor: "#333", // Alterado para preto para mais visibilidade
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  eventItemText: { // Novo estilo para textos dentro do item do evento
    color: '#333',
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#0056b3",
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
    color: '#333', // Garante a cor do texto digitado
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
    color: '#333', // Pode ajudar em alguns casos a garantir a cor do texto do picker
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