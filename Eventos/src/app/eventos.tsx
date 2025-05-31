// src/app/eventos.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';

// Importe as funções dos seus arquivos de serviço
import { criarEvento, buscarEventos, buscarCategoriasDoEvento, deletarEvento } from '@/service/eventoService';
import { criarLocal, buscarLocais } from '@/service/localService';
import { criarCategoria, buscarCategorias } from '@/service/categoriaService';

// Importe suas interfaces de tipos
import { IEventoFormatado, ILocalFormatado, ICategoriaFormatada } from '../types';

const EventosScreen = () => {
  const [eventos, setEventos] = useState<IEventoFormatado[]>([]);
  const [locais, setLocais] = useState<ILocalFormatado[]>([]);
  const [categorias, setCategorias] = useState<ICategoriaFormatada[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      const eventosCarregados = await buscarEventos();
      const locaisCarregados = await buscarLocais();
      const categoriasCarregadas = await buscarCategorias();

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
      Alert.alert('Erro', 'Não foi possível carregar os dados. Verifique a conexão e as chaves do Back4app.\n' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarExemplo = async () => {
    setLoading(true);
    try {
      // 1. Criar ou obter um local de exemplo
      let localParaUsar: ILocalFormatado; // Garantimos que esta variável será ILocalFormatado

      if (locais.length > 0) {
        localParaUsar = locais[0];
      } else {
        const newLocalParseObject = await criarLocal({
          Nome: 'Centro de Convenções',
          Capacidade: 5000,
        });
        localParaUsar = {
          id: newLocalParseObject.id,
          Nome: newLocalParseObject.get('Nome') as string,
          Capacidade: newLocalParseObject.get('Capacidade') as number
        };
        // Adiciona ao estado SOMENTE SE foi criado agora
        setLocais(prev => [...prev, localParaUsar]);
      }

      // 2. Criar ou obter categorias de exemplo
      let catWorkshopParaUsar: ICategoriaFormatada; // Garantimos que esta variável será ICategoriaFormatada
      let catBusinessParaUsar: ICategoriaFormatada;

      let existingCatWorkshop = categorias.find(c => c.Nome === 'Workshop');
      if (existingCatWorkshop) {
        catWorkshopParaUsar = existingCatWorkshop;
      } else {
        const newCatParseObject = await criarCategoria('Workshop');
        catWorkshopParaUsar = {
          id: newCatParseObject.id,
          Nome: newCatParseObject.get('Nome') as string
        };
        // Adiciona ao estado SOMENTE SE foi criado agora
        setCategorias(prev => [...prev, catWorkshopParaUsar]);
      }

      let existingCatBusiness = categorias.find(c => c.Nome === 'Negócios');
      if (existingCatBusiness) {
        catBusinessParaUsar = existingCatBusiness;
      } else {
        const newCatParseObject = await criarCategoria('Negócios');
        catBusinessParaUsar = {
          id: newCatParseObject.id,
          Nome: newCatParseObject.get('Nome') as string
        };
        // Adiciona ao estado SOMENTE SE foi criado agora
        setCategorias(prev => [...prev, catBusinessParaUsar]);
      }

      // 3. Criar um evento usando os IDs dos objetos garantidos
      const novoEventoData = {
        NomeEvt: `Feira de Tecnologia ${new Date().toLocaleTimeString()}`,
        Descricao: 'A maior feira de tecnologia do nordeste.',
        Data: new Date(),
        status: true,
      };

      // Agora localParaUsar, catWorkshopParaUsar e catBusinessParaUsar
      // são garantidamente do tipo ILocalFormatado e ICategoriaFormatada
      await criarEvento(novoEventoData, localParaUsar.id, [catWorkshopParaUsar.id, catBusinessParaUsar.id]);
      Alert.alert('Sucesso', 'Evento criado com sucesso!');
      carregarDadosIniciais(); // Recarrega a lista para mostrar o novo evento

    } catch (error: any) {
      Alert.alert('Erro ao criar evento', error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarEvento = async (id: string) => {
    setLoading(true);
    try {
      await deletarEvento(id);
      Alert.alert('Sucesso', 'Evento deletado!');
      carregarDadosIniciais();
    } catch (error: any) {
      Alert.alert('Erro ao deletar', error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderEventoItem = ({ item }: { item: IEventoFormatado }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>{item.NomeEvt}</Text>
      <Text>Descrição: {item.Descricao}</Text>
      <Text>Data: {new Date(item.Data).toLocaleString()}</Text>
      <Text>Status: {item.status ? 'Ativo' : 'Inativo'}</Text>
      <Text>Local: {item.local ? item.local.Nome : 'N/A'}</Text>
      <Text>Capacidade do Local: {item.local ? item.local.Capacidade : 'N/A'}</Text>
      <Text>Categorias: {item.categorias ? item.categorias.map((c: ICategoriaFormatada) => c.Nome).join(', ') : 'N/A'}</Text>
      <Button title="Deletar" onPress={() => handleDeletarEvento(item.id)} color="#ff6347" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meus Eventos</Text>
      <Button title="Criar Evento Exemplo" onPress={handleCriarExemplo} disabled={loading} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id}
          renderItem={renderEventoItem}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum evento encontrado. Crie um!</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  eventItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0056b3',
  },
  loadingIndicator: {
    marginTop: 30,
  },
  emptyText: {
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  }
});

export default EventosScreen;