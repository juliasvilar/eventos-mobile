import api from './api';
import { ILocalFormatado } from '@/src/types';

export const criarLocal = async (
  localData: { Nome: string; Capacidade: number }
): Promise<ILocalFormatado> => {
  try {
    const response = await api.post('/classes/Local', localData);
    return {
      id: response.data.objectId,
      Nome: response.data.Nome,
      Capacidade: response.data.Capacidade,
    };
  } catch (error) {
    console.error('Erro ao criar local:', error);
    throw error;
  }
};

export const buscarLocais = async (): Promise<ILocalFormatado[]> => {
  try {
    const response = await api.get('/classes/Local');
    return response.data.results.map((local: any) => ({
      id: local.objectId,
      Nome: local.Nome,
      Capacidade: local.Capacidade,
    }));
  } catch (error) {
    console.error('Erro ao buscar locais:', error);
    throw error;
  }
};

export const buscarLocalPorId = async (localId: string): Promise<ILocalFormatado | null> => {
  try {
    const response = await api.get(`/classes/Local/${localId}`);
    return {
      id: response.data.objectId,
      Nome: response.data.Nome,
      Capacidade: response.data.Capacidade,
    };
  } catch (error) {
    console.error('Erro ao buscar local por ID:', localId, error);
    return null;
  }
};

export const atualizarLocal = async (
  localId: string,
  newData: { Nome?: string; Capacidade?: number }
): Promise<ILocalFormatado> => {
  try {
    const response = await api.put(`/classes/Local/${localId}`, newData);
    return {
      id: response.data.objectId,
      Nome: response.data.Nome,
      Capacidade: response.data.Capacidade,
    };
  } catch (error) {
    console.error('Erro ao atualizar local:', error);
    throw error;
  }
};

export const deletarLocal = async (localId: string): Promise<void> => {
  try {
    await api.delete(`/classes/Local/${localId}`);
  } catch (error) {
    console.error('Erro ao deletar local:', error);
    throw error;
  }
};