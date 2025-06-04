import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { buscarEventos } from "@/service/eventoService";
import { IEventoFormatado } from "@/src/types";

const EventosMaisProximos: React.FC = () => {
  const [eventos, setEventos] = useState<IEventoFormatado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregarEventos = async () => {
      try {
        setCarregando(true);
        const eventosData = await buscarEventos();

        const eventosFormatados: IEventoFormatado[] = eventosData.map(
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

        const eventosOrdenados = eventosFormatados.sort(
          (a, b) => a.Data.getTime() - b.Data.getTime()
        );
        setEventos(eventosOrdenados);
        setCarregando(false);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar eventos");
        setCarregando(false);
      }
    };

    carregarEventos();
  }, []);

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
      {eventos.length === 0 ? (
        <Text style={styles.semResultados}>Nenhum evento encontrado.</Text>
      ) : (
        <View style={styles.listaEventos}>
          {eventos.map((evento) => (
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
