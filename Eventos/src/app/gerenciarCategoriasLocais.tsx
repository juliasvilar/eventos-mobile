import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { ICategoriaFormatada, ILocalFormatado } from '@/src/types';
import { criarCategoria, deletarCategoria, atualizarCategoria, buscarCategorias } from '@/service/categoriaService';
import { criarLocal, deletarLocal, atualizarLocal, buscarLocais } from '@/service/localService';
import FontAwesome from "@expo/vector-icons/FontAwesome";

const GerenciarCategoriasLocais: React.FC = () => {
  // Estados para dados
  const [categorias, setCategorias] = useState<ICategoriaFormatada[]>([]);
  const [locais, setLocais] = useState<ILocalFormatado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados para modais
  const [modalCategoriaVisivel, setModalCategoriaVisivel] = useState(false);
  const [modalLocalVisivel, setModalLocalVisivel] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<ICategoriaFormatada | null>(null);
  const [localEditando, setLocalEditando] = useState<ILocalFormatado | null>(null);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [nomeLocal, setNomeLocal] = useState('');
  const [capacidadeLocal, setCapacidadeLocal] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Carrega os dados otimizado
  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      // Busca em paralelo apenas o necessário
      const [categoriasData, locaisData] = await Promise.all([
        buscarCategorias(),
        buscarLocais()
      ]);
      
      setCategorias(categoriasData);
      setLocais(locaisData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Carrega os dados ao montar o componente
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await carregarDados();
    } catch (error) {
      console.error("Erro ao recarregar por pull-to-refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [carregarDados]);

  // Funções para categorias (otimizadas com useCallback)
  const abrirModalCategoria = useCallback((categoria?: ICategoriaFormatada) => {
    setCategoriaEditando(categoria || null);
    setNomeCategoria(categoria?.Nome || '');
    setModalCategoriaVisivel(true);
  }, []);

  const salvarCategoria = useCallback(async () => {
    if (!nomeCategoria.trim()) {
      Alert.alert('Erro', 'O nome da categoria não pode estar vazio');
      return;
    }

    try {
      setCarregando(true);
      
      if (categoriaEditando) {
        await atualizarCategoria(categoriaEditando.id, { Nome: nomeCategoria });
      } else {
        await criarCategoria(nomeCategoria);
      }
      
      await carregarDados();
      setModalCategoriaVisivel(false);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a categoria');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }, [nomeCategoria, categoriaEditando, carregarDados]);

  // Funções para locais (otimizadas com useCallback)
  const abrirModalLocal = useCallback((local?: ILocalFormatado) => {
    setLocalEditando(local || null);
    setNomeLocal(local?.Nome || '');
    setCapacidadeLocal(local?.Capacidade.toString() || '');
    setModalLocalVisivel(true);
  }, []);

  const salvarLocal = useCallback(async () => {
    if (!nomeLocal.trim()) {
      Alert.alert('Erro', 'O nome do local não pode estar vazio');
      return;
    }

    const capacidadeNum = parseInt(capacidadeLocal);
    if (isNaN(capacidadeNum)) {
      Alert.alert('Erro', 'A capacidade deve ser um número válido');
      return;
    }

    try {
      setCarregando(true);
      
      if (localEditando) {
        await atualizarLocal(localEditando.id, { Nome: nomeLocal, Capacidade: capacidadeNum });
      } else {
        await criarLocal({ Nome: nomeLocal, Capacidade: capacidadeNum });
      }
      
      await carregarDados();
      setModalLocalVisivel(false);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o local');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }, [nomeLocal, capacidadeLocal, localEditando, carregarDados]);

  // Funções de remoção otimizadas
  const removerCategoria = useCallback(async (id: string) => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja remover esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          onPress: async () => {
            try {
              setCarregando(true);
              await deletarCategoria(id);
              await carregarDados();
            } catch (error) {
              Alert.alert('Erro', 'Ocorreu um erro ao remover a categoria');
              console.error(error);
            } finally {
              setCarregando(false);
            }
          },
        },
      ]
    );
  }, [carregarDados]);

  const removerLocal = useCallback(async (id: string) => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja remover este local?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          onPress: async () => {
            try {
              setCarregando(true);
              await deletarLocal(id);
              await carregarDados();
            } catch (error) {
              Alert.alert('Erro', 'Ocorreu um erro ao remover o local');
              console.error(error);
            } finally {
              setCarregando(false);
            }
          },
        },
      ]
    );
  }, [carregarDados]);

  if (carregando && !isRefreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
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
    <ScrollView style={styles.container} refreshControl={
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        tintColor="#007bff" 
        colors={["#007bff"]}
      />
    }>
      
      <Text style={styles.titulo}>Gerenciar Categorias e Locais</Text>

      
      <View style={styles.secao}>
        <View style={styles.headerSecao}>
          <Text style={styles.subtitulo}>Categorias</Text>
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() => abrirModalCategoria()}
          >
            <Text style={styles.botaoAdicionarTexto}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        {categorias.length === 0 ? (
          <Text style={styles.semItens}>Nenhuma categoria cadastrada</Text>
        ) : (
          categorias.map(categoria => (
            <View key={categoria.id} style={styles.itemContainer}>
              <Text style={styles.itemNome}>{categoria.Nome}</Text>
              <View style={styles.botoesContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => abrirModalCategoria(categoria)}>
                  <FontAwesome name="pencil" size={20} color="#e2b536" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removerCategoria(categoria.id)}>
                  <FontAwesome name="trash" size={20} color="#E64758" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      
      <View style={styles.secao}>
        <View style={styles.headerSecao}>
          <Text style={styles.subtitulo}>Locais</Text>
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() => abrirModalLocal()}
          >
            <Text style={styles.botaoAdicionarTexto}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        {locais.length === 0 ? (
          <Text style={styles.semItens}>Nenhum local cadastrado</Text>
        ) : (
          locais.map(local => (
            <View key={local.id} style={styles.itemContainer}>
              <View>
                <Text style={styles.itemNome}>{local.Nome}</Text>
                <Text style={styles.itemDetalhe}>Capacidade: {local.Capacidade}</Text>
              </View>
              <View style={styles.botoesContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => abrirModalLocal(local)}>
                  <FontAwesome name="pencil" size={20} color="#F7C946" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removerLocal(local.id)}>
                  <FontAwesome name="trash" size={20} color="#E64758" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      
      <Modal
        visible={modalCategoriaVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalCategoriaVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da categoria"
              value={nomeCategoria}
              onChangeText={setNomeCategoria}
            />
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => setModalCategoriaVisivel(false)}
              >
                <Text style={styles.botaoTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botaoSalvar}
                onPress={salvarCategoria}
              >
                <Text style={styles.botaoTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      
      <Modal
        visible={modalLocalVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalLocalVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {localEditando ? 'Editar Local' : 'Novo Local'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do local"
              value={nomeLocal}
              onChangeText={setNomeLocal}
            />
            <TextInput
              style={styles.input}
              placeholder="Capacidade"
              value={capacidadeLocal}
              onChangeText={setCapacidadeLocal}
              keyboardType="numeric"
            />
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => setModalLocalVisivel(false)}
              >
                <Text style={styles.botaoTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botaoSalvar}
                onPress={salvarLocal}
              >
                <Text style={styles.botaoTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    marginBottom: 30,
    backgroundColor: '#F2F3F7',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  semItens: {
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemNome: {
    fontSize: 16,
    color: '#333',
  },
  itemDetalhe: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  botoesContainer: {
    flexDirection: 'row',
  },
  botaoAdicionar: {
    backgroundColor: '#5b86c5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  botaoAdicionarTexto: {
    color: 'white',
    fontWeight: '500',
  },
  iconButton: {
    marginRight: 20, 
  },
  botaoTexto: {
    color: 'white',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  modalBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoCancelar: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  botaoSalvar: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
});

export default GerenciarCategoriasLocais;