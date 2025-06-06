import { useState, useEffect, useCallback  } from "react";
import { ScrollView, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Linking, RefreshControl,} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEventoStore } from "@/src/store/eventoStore";
import { IEventoFormatado } from "@/src/types";

const EventosMaisProximos: React.FC = () => {
  const { eventos, loading: carregando, error: erro, carregarDados } = useEventoStore();

  const [eventosFiltrados, setEventosFiltrados] = useState<IEventoFormatado[]>(
    []
  );
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!eventos.length && !carregando) { 
      carregarDados();
    }
  }, [carregarDados, eventos.length, carregando]);

  useEffect(() => {
    // Ordenar eventos por data
    const eventosOrdenados = [...eventos].sort(
      (a, b) => a.Data.getTime() - b.Data.getTime()
    );
    setEventosFiltrados(eventosOrdenados);
  }, [eventos]);


  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await carregarDados(); 
    } catch (error) {
      console.error("Erro ao recarregar:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [carregarDados]);


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

  const adicionarAoGoogleCalendar = (evento: IEventoFormatado) => {
    const formatarDataParaGoogle = (data: Date) => {
      return data.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const dataInicio = formatarDataParaGoogle(evento.Data);
    const dataFim = formatarDataParaGoogle(
      new Date(evento.Data.getTime() + 60 * 60 * 1000)
    );

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      evento.NomeEvt
    )}&details=${encodeURIComponent(
      evento.Descricao
    )}&dates=${dataInicio}/${dataFim}&location=${
      evento.local ? encodeURIComponent(evento.local.Nome) : ""
    }`;

    Linking.openURL(url).catch((err) =>
      console.error("Erro ao abrir o Google Calender:", err)
    );
  };

  if (carregando && !isRefreshing) {
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
    <ScrollView style={styles.container}

      refreshControl={
        <RefreshControl
          refreshing={isRefreshing} 
          onRefresh={onRefresh} 
          tintColor="#007bff" 
          colors={["#007bff"]} 
        />
      }
    >


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

      {eventosFiltrados.length === 0 && !carregando ? (
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

              <TouchableOpacity
                style={styles.botaoGoogleCalendar}
                onPress={() => adicionarAoGoogleCalendar(evento)}
              >
                <Text style={styles.botaoGoogleCalendarTexto}>
                  Adicionar ao Calendario
                </Text>
              </TouchableOpacity>
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
    backgroundColor: "#5b86c5",
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
    backgroundColor: "#F2F3F7",
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
  botaoGoogleCalendar: {
    backgroundColor: "#5b86c5",
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
    alignItems: "center",
  },
  botaoGoogleCalendarTexto: {
    color: "white",
    fontWeight: "bold",
  },
});

export default EventosMaisProximos;
