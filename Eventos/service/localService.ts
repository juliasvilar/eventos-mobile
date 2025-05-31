// src/services/localService.ts
import Parse from './parseConfig';
import { ILocalFormatado, IParseLocal } from '@/src/types';

/**
 * Cria um novo local com Nome e Capacidade.
 * @param {object} localData - Objeto contendo Nome (string) e Capacidade (number).
 * @returns {Promise<IParseLocal>} O objeto Local do Parse salvo.
 */
export const criarLocal = async (localData: { Nome: string; Capacidade: number }): Promise<IParseLocal> => {
  const Local = Parse.Object.extend('Local');
  const novoLocal = new Local() as IParseLocal; // Casting para o tipo de Parse

  novoLocal.set('Nome', localData.Nome);
  novoLocal.set('Capacidade', localData.Capacidade);

  try {
    const localSalvo = await novoLocal.save();
    console.log('Local criado com sucesso:', localSalvo.id);
    return localSalvo as IParseLocal; // Confirma o tipo de retorno
  } catch (error) {
    console.error('Erro ao criar local:', error);
    throw error;
  }
};

/**
 * Busca todos os locais.
 * @returns {Promise<ILocalFormatado[]>} Uma lista de objetos Local formatados.
 */
export const buscarLocais = async (): Promise<ILocalFormatado[]> => {
  const query = new Parse.Query<IParseLocal>('Local');
  try {
    const locais = await query.find();
    console.log('Locais encontrados:', locais.length);
    // Mapeia para o tipo formatado
    return locais.map(local => ({
      id: local.id,
      Nome: local.get('Nome'),
      Capacidade: local.get('Capacidade')
    }));
  } catch (error) {
    console.error('Erro ao buscar locais:', error);
    throw error;
  }
};

/**
 * Busca um local por ID.
 * @param {string} localId - O ID do local.
 * @returns {Promise<ILocalFormatado|null>} O objeto Local formatado ou null se não encontrado.
 */
export const buscarLocalPorId = async (localId: string): Promise<ILocalFormatado | null> => {
  const query = new Parse.Query<IParseLocal>('Local');
  try {
    const local = await query.get(localId);
    console.log('Local encontrado:', local.id);
    return {
      id: local.id,
      Nome: local.get('Nome'),
      Capacidade: local.get('Capacidade')
    };
  } catch (error) {
    console.error('Erro ao buscar local por ID:', localId, error);
    return null;
  }
};

/**
 * Atualiza um local existente.
 * @param {string} localId - O ID do local a ser atualizado.
 * @param {object} newData - Novos dados para o local (Nome, Capacidade).
 * @returns {Promise<IParseLocal>} O objeto Local do Parse atualizado.
 */
export const atualizarLocal = async (localId: string, newData: { Nome?: string; Capacidade?: number }): Promise<IParseLocal> => {
  const Local = Parse.Object.extend('Local');
  const local = new Local();
  local.set('objectId', localId); // Define o ID para o objeto existente

  if (newData.Nome) local.set('Nome', newData.Nome);
  if (newData.Capacidade !== undefined) local.set('Capacidade', newData.Capacidade);

  try {
    const localAtualizado = await local.save();
    console.log('Local atualizado com sucesso:', localAtualizado.id);
    return localAtualizado as IParseLocal;
  } catch (error) {
    console.error('Erro ao atualizar local:', error);
    throw error;
  }
};

/**
 * Deleta um local.
 * @param {string} localId - O ID do local a ser deletado.
 * @returns {Promise<void>}
 */
export const deletarLocal = async (localId: string): Promise<void> => {
  const Local = Parse.Object.extend('Local');
  const local = new Local();
  local.set('objectId', localId);

  try {
    await local.destroy();
    console.log('Local deletado com sucesso:', localId);
  } catch (error) {
    console.error('Erro ao deletar local:', error);
    throw error;
  }
};