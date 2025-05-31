// src/services/categoriaService.ts
import Parse from './parseConfig';
import { ICategoriaFormatada, IParseCategoria } from '@/src/types';

export const criarCategoria = async (Nome: string): Promise<IParseCategoria> => {
  const Categoria = Parse.Object.extend('Categoria');
  const novaCategoria = new Categoria(); // Não precisa de 'as IParseCategoria'
  novaCategoria.set('Nome', Nome);
  try {
    const categoriaSalva = await novaCategoria.save();
    return categoriaSalva as IParseCategoria; // Cast ao salvar
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};

export const buscarCategorias = async (): Promise<ICategoriaFormatada[]> => {
  const query = new Parse.Query<IParseCategoria>('Categoria');
  try {
    const categorias = await query.find();
    return categorias.map(categoria => ({
      id: categoria.id,
      Nome: categoria.get('Nome') as string // Cast para string
    }));
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

export const buscarCategoriaPorId = async (categoriaId: string): Promise<ICategoriaFormatada | null> => {
  const query = new Parse.Query<IParseCategoria>('Categoria');
  try {
    const categoria = await query.get(categoriaId);
    return {
      id: categoria.id,
      Nome: categoria.get('Nome') as string
    };
  } catch (error) {
    console.error('Erro ao buscar categoria por ID:', categoriaId, error);
    return null;
  }
};

export const atualizarCategoria = async (categoriaId: string, newData: { Nome?: string }): Promise<IParseCategoria> => {
  const Categoria = Parse.Object.extend('Categoria');
  const categoria = new Categoria();
  categoria.set('objectId', categoriaId);
  if (newData.Nome) categoria.set('Nome', newData.Nome);
  try {
    const categoriaAtualizada = await categoria.save();
    return categoriaAtualizada as IParseCategoria;
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};

export const deletarCategoria = async (categoriaId: string): Promise<void> => {
  const Categoria = Parse.Object.extend('Categoria');
  const categoria = new Categoria();
  categoria.set('objectId', categoriaId);
  try {
    await categoria.destroy();
    console.log('Categoria deletada com sucesso:', categoriaId);
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    throw error;
  }
};