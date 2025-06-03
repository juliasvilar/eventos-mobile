import api from './api';
import { ICategoriaFormatada } from '@/src/types';

export const criarCategoria = async (Nome: string): Promise<ICategoriaFormatada> => {
  try {
    const response = await api.post('/classes/Categoria', { Nome });
    return {
      id: response.data.objectId,
      Nome: response.data.Nome,
    };
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};

export const buscarCategorias = async (): Promise<ICategoriaFormatada[]> => {
  try {
    const response = await api.get('/classes/Categoria');
    return response.data.results.map((cat: any) => ({
      id: cat.objectId,
      Nome: cat.Nome,
    }));
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

export const buscarCategoriaPorId = async (categoriaId: string): Promise<ICategoriaFormatada | null> => {
  try {
    const response = await api.get(`/classes/Categoria/${categoriaId}`);
    return {
      id: response.data.objectId,
      Nome: response.data.Nome,
    };
  } catch (error) {
    console.error('Erro ao buscar categoria por ID:', categoriaId, error);
    return null;
  }
};

export const atualizarCategoria = async (
  categoriaId: string,
  newData: { Nome?: string }
): Promise<ICategoriaFormatada> => {
  try {
    const response = await api.put(`/classes/Categoria/${categoriaId}`, newData);
    return {
      id: response.data.objectId,
      Nome: response.data.Nome,
    };
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};

export const deletarCategoria = async (categoriaId: string): Promise<void> => {
  try {
    await api.delete(`/classes/Categoria/${categoriaId}`);
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    throw error;
  }
};