import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useEventoStore } from '@/src/store/eventoStore';
import { ICategoriaFormatada, IEventoFormatado } from '@/src/types';

const EventosPorCategoria: React.FC = () => {
  const {
    eventos,
    categorias,
    loading: carregando,
    error: erro,
  } = useEventoStore();

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);

  const handleSelecionarCategoria = (categoriaId: string) => {
    setCategoriaSelecionada(categoriaId === categoriaSelecionada ? null : categoriaId);
  };

  const eventosFiltrados = categoriaSelecionada
    ? eventos.filter(evento => 
        evento.categorias?.some(cat => cat.id === categoriaSelecionada))
    : eventos;

  if (carregando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando...</Text>
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
      <Text style={styles.titulo}>Eventos por Categoria</Text>
      
      {/* Filtro de Categorias */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>Filtrar por Categoria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasContainer}>
          <TouchableOpacity
            onPress={() => setCategoriaSelecionada(null)}
            style={[
              styles.botaoCategoria,
              !categoriaSelecionada && styles.botaoCategoriaSelecionado
            ]}
          >
            <Text style={!categoriaSelecionada ? styles.botaoCategoriaTextoSelecionado : styles.botaoCategoriaTexto}>
              Todas
            </Text>
          </TouchableOpacity>
          {categorias.map(categoria => (
            <TouchableOpacity
              key={categoria.id}
              onPress={() => handleSelecionarCategoria(categoria.id)}
              style={[
                styles.botaoCategoria,
                categoriaSelecionada === categoria.id && styles.botaoCategoriaSelecionado
              ]}
            >
              <Text style={categoriaSelecionada === categoria.id ? styles.botaoCategoriaTextoSelecionado : styles.botaoCategoriaTexto}>
                {categoria.Nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Resultados */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>
          {categoriaSelecionada 
            ? `Eventos na categoria: ${categorias.find(c => c.id === categoriaSelecionada)?.Nome}`
            : 'Todos os Eventos'}
        </Text>
        
        {eventosFiltrados.length === 0 ? (
          <Text style={styles.semResultados}>Nenhum evento encontrado.</Text>
        ) : (
          <View style={styles.listaEventos}>
            {eventosFiltrados.map(evento => (
              <View key={evento.id} style={styles.cardEvento}>
                <Text style={styles.eventoTitulo}>{evento.NomeEvt}</Text>
                <Text style={styles.eventoDescricao}>{evento.Descricao}</Text>
                
                <Text style={styles.eventoData}>
                  {evento.Data.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                
                {evento.local && (
                  <Text style={styles.eventoLocal}>
                    Local: {evento.local.Nome} (Capacidade: {evento.local.Capacidade})
                  </Text>
                )}
                
                <View style={styles.eventoStatusContainer}>
                  <Text style={[
                    styles.eventoStatus,
                    evento.status ? styles.eventoStatusAtivo : styles.eventoStatusInativo
                  ]}>
                    {evento.status ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
                
                {evento.categorias && evento.categorias.length > 0 && (
                  <View style={styles.eventoCategoriasContainer}>
                    {evento.categorias.map(cat => (
                      <View key={cat.id} style={styles.eventoCategoria}>
                        <Text style={styles.eventoCategoriaTexto}>{cat.Nome}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  erro: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  secao: {
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  categoriasContainer: {
    marginBottom: 10,
  },
  botaoCategoria: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  botaoCategoriaSelecionado: {
    backgroundColor: '#007bff',
  },
  botaoCategoriaTexto: {
    color: '#333',
  },
  botaoCategoriaTextoSelecionado: {
    color: 'white',
  },
  semResultados: {
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  listaEventos: {
    marginTop: 10,
  },
  cardEvento: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  eventoDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eventoData: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  eventoLocal: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  eventoStatusContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  eventoStatus: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  eventoStatusAtivo: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  eventoStatusInativo: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  eventoCategoriasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  eventoCategoria: {
    backgroundColor: '#d1e7ff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  eventoCategoriaTexto: {
    fontSize: 12,
    color: '#004085',
  },
});

export default EventosPorCategoria;