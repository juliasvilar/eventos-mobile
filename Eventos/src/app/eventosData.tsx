import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEventoStore } from "@/src/store/eventoStore";
import { IEventoFormatado } from "@/src/types";

const EventosMaisProximos: React.FC = () => {
  const {
    eventos,
    loading: carregando,
    error: erro,
  } = useEventoStore();

  const [eventosFiltrados, setEventosFiltrados] = useState<IEventoFormatado[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  useEffect(() => {
    // Ordenar eventos por data
    const eventosOrdenados = [...eventos].sort(
      (a, b) => a.Data.getTime() - b.Data.getTime()
    );
    setEventosFiltrados(eventosOrdenados);
  }, [eventos]);

  const handleDateChange = (event: any, selectDate?: Date) => {
    setShowDatePicker(false);
    if (selectDate) {
      setDataSelecionada(selectDate);
      filtrarEventosPorData(selectDate);
    }
  };

  const filtrarEventosPorData = (data: Date) => {
    if (!data) {
      setEventosFiltrados(eventos);
      return;
    }

    const eventosDaData = eventos.filter((evento) => {
      const eventoDate = new Date(evento.Data);
      return (
        eventoDate.getDate() === data.getDate() &&
        eventoDate.getMonth() === data.getMonth() &&
        eventoDate.getFullYear() === data.getFullYear()
      );
    });

    setEventosFiltrados(eventosDaData);
  };

  const limparFiltro = () => {
    setDataSelecionada(null);
    setEventosFiltrados(eventos);
  };

  if (carregando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centered}>
        <Text style={styles.erro}>{erro}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Eventos Próximos</Text>

      <View style={styles.filtroContainer}>
        <TouchableOpacity
          style={styles.botaoFiltro}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.botaoFiltroTexto}>
            {dataSelecionada
              ? `Data: ${dataSelecionada.toLocaleDateString("pt-BR")}`
              : "Selecionar Data"}
          </Text>
        </TouchableOpacity>

        {dataSelecionada && (
          <TouchableOpacity
            style={[styles.botaoFiltro, styles.botaoLimpar]}
            onPress={limparFiltro}
          >
            <Text style={styles.botaoFiltroTexto}>Limpar Filtro</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dataSelecionada || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {eventosFiltrados.length === 0 ? (
        <Text style={styles.semResultados}>
          {dataSelecionada
            ? "Nenhum evento encontrado para esta data"
            : "Nenhum evento encontrado"}
        </Text>
      ) : (
        <View style={styles.listaEventos}>
          {eventosFiltrados.map((evento) => (
            <View key={evento.id} style={styles.cardEvento}>
              <View style={styles.eventoStatusContainer}>
                <Text
                  style={[
                    styles.eventoStatus,
                    evento.status
                      ? styles.eventoStatusAtivo
                      : styles.eventoStatusInativo,
                  ]}
                >
                  {evento.status ? "Ativo" : "Inativo"}
                </Text>
              </View>
              <Text style={styles.eventoTitulo}>{evento.NomeEvt}</Text>
              <Text style={styles.eventoDescricao}>{evento.Descricao}</Text>
              <Text style={styles.eventoData}>
                {evento.Data.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              {evento.local && (
                <Text style={styles.eventoLocal}>
                  Local: {evento.local.Nome} (Capacidade:{" "}
                  {evento.local.Capacidade})
                </Text>
              )}
              {evento.categorias && evento.categorias.length > 0 && (
                <View style={styles.eventoCategoriasContainer}>
                  {evento.categorias.map((categoria) => (
                    <View key={categoria.id} style={styles.eventoCategoria}>
                      <Text style={styles.eventoCategoriaTexto}>
                        {categoria.Nome}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  filtroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoFiltro: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  botaoLimpar: {
    backgroundColor: "#6c757d",
    flex: 0.5,
  },
  botaoFiltroTexto: {
    color: "white",
    fontWeight: "bold",
  },
  erro: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  semResultados: {
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  listaEventos: {
    marginTop: 10,
  },
  cardEvento: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  eventoDescricao: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  eventoData: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  eventoLocal: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  eventoStatusContainer: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  eventoStatus: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  eventoStatusAtivo: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  eventoStatusInativo: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  eventoCategoriasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  eventoCategoria: {
    backgroundColor: "#d1e7ff",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  eventoCategoriaTexto: {
    fontSize: 12,
    color: "#004085",
  },
});

export default EventosMaisProximos;
