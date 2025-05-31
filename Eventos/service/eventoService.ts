// src/services/eventoService.ts
import Parse from './parseConfig';
import { IEventoFormatado, ILocalFormatado, ICategoriaFormatada,
         IParseEvento, IParseLocal, IParseCategoria } from '@/src/types';

export const criarEvento = async (
  eventData: { NomeEvt: string; Descricao: string; Data: Date; status: boolean },
  localId: string,
  categoriaIds: string[] = []
): Promise<IParseEvento> => {
  const Evento = Parse.Object.extend('Evento');
  const Local = Parse.Object.extend('Local');
  const Categoria = Parse.Object.extend('Categoria');

  const novoEvento = new Evento(); // Não precisa de 'as IParseEvento' aqui

  novoEvento.set('NomeEvt', eventData.NomeEvt);
  novoEvento.set('Descricao', eventData.Descricao);
  novoEvento.set('Data', eventData.Data);
  novoEvento.set('status', eventData.status);

  const localPointer = Local.createWithoutData(localId);
  novoEvento.set('local', localPointer);

  try {
    const eventoSalvo = await novoEvento.save(); // Salva o evento e o ponteiro para Local

    const relacaoCategorias = eventoSalvo.relation('categorias'); // O tipo aqui já é genérico o suficiente
    for (const catId of categoriaIds) {
      const categoriaPointer = Categoria.createWithoutData(catId);
      relacaoCategorias.add(categoriaPointer);
    }
    await eventoSalvo.save();

    console.log('Evento criado com sucesso:', eventoSalvo.id);
    return eventoSalvo as IParseEvento; // Cast ao salvar
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    throw error;
  }
};

export const buscarEventos = async (): Promise<IEventoFormatado[]> => {
  const query = new Parse.Query<IParseEvento>('Evento'); // Query tipada
  query.include('local');
  query.descending('Data');

  try {
    const eventos = await query.find();
    console.log('Eventos encontrados:', eventos.length);

    const eventosFormatados: IEventoFormatado[] = eventos.map(evento => {
      // Cast explícito ao obter o ponteiro
      const local = evento.get('local') as IParseLocal | undefined;
      return {
        id: evento.id,
        NomeEvt: evento.get('NomeEvt') as string, // Cast para string
        Descricao: evento.get('Descricao') as string,
        Data: evento.get('Data') as Date,
        status: evento.get('status') as boolean,
        local: local ? {
          id: local.id,
          Nome: local.get('Nome') as string,
          Capacidade: local.get('Capacidade') as number
        } : null,
      };
    });
    return eventosFormatados;
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    throw error;
  }
};

export const buscarEventoPorId = async (eventoId: string): Promise<IEventoFormatado | null> => {
  const query = new Parse.Query<IParseEvento>('Evento');
  query.include('local');
  try {
    const evento = await query.get(eventoId);
    const local = evento.get('local') as IParseLocal | undefined;

    return {
      id: evento.id,
      NomeEvt: evento.get('NomeEvt') as string,
      Descricao: evento.get('Descricao') as string,
      Data: evento.get('Data') as Date,
      status: evento.get('status') as boolean,
      local: local ? {
        id: local.id,
        Nome: local.get('Nome') as string,
        Capacidade: local.get('Capacidade') as number
      } : null,
    };
  } catch (error) {
    console.error('Erro ao buscar evento por ID:', eventoId, error);
    return null;
  }
};

export const buscarCategoriasDoEvento = async (eventoId: string): Promise<ICategoriaFormatada[]> => {
  const Evento = Parse.Object.extend('Evento');
  const evento = Evento.createWithoutData(eventoId) as IParseEvento; // Casting para IParseEvento

  const relacaoCategorias = evento.relation('categorias');
  // O tipo da query da relação já é suficientemente genérico para Parse.Object
  const query = relacaoCategorias.query() as Parse.Query<IParseCategoria>; // Casting explícito aqui

  try {
    const categorias = await query.find();
    return categorias.map(cat => ({
      id: cat.id,
      Nome: cat.get('Nome') as string,
    }));
  } catch (error) {
    console.error('Erro ao buscar categorias do evento:', eventoId, error);
    throw error;
  }
};

export const atualizarEvento = async (
  eventoId: string,
  newData: { NomeEvt?: string; Descricao?: string; Data?: Date; status?: boolean },
  newLocalId: string | null = null,
  newCategoriaIds: string[] | null = null
): Promise<IParseEvento> => {
  const Evento = Parse.Object.extend('Evento');
  const Local = Parse.Object.extend('Local');
  const Categoria = Parse.Object.extend('Categoria');

  const evento = new Evento();
  evento.set('objectId', eventoId);

  if (newData.NomeEvt) evento.set('NomeEvt', newData.NomeEvt);
  if (newData.Descricao) evento.set('Descricao', newData.Descricao);
  if (newData.Data) evento.set('Data', newData.Data);
  if (newData.status !== undefined) evento.set('status', newData.status);

  if (newLocalId) {
    const newLocalPointer = Local.createWithoutData(newLocalId);
    evento.set('local', newLocalPointer);
  }

  try {
    const eventoAtualizado = await evento.save();

    if (newCategoriaIds !== null) {
      const relacaoCategorias = eventoAtualizado.relation('categorias');
      const categoriasAtuaisQuery = relacaoCategorias.query() as Parse.Query<IParseCategoria>; // Casting explícito
      const categoriasAtuais = await categoriasAtuaisQuery.find();

      for (const cat of categoriasAtuais) {
        if (!newCategoriaIds.includes(cat.id)) {
          relacaoCategorias.remove(cat);
        }
      }

      for (const catId of newCategoriaIds) {
        const categoriaPointer = Categoria.createWithoutData(catId);
        relacaoCategorias.add(categoriaPointer);
      }
      await eventoAtualizado.save();
    }

    console.log('Evento atualizado com sucesso:', eventoAtualizado.id);
    return eventoAtualizado as IParseEvento;
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    throw error;
  }
};

export const deletarEvento = async (eventoId: string): Promise<void> => {
  const Evento = Parse.Object.extend('Evento');
  const evento = new Evento();
  evento.set('objectId', eventoId);

  try {
    await evento.destroy();
    console.log('Evento deletado com sucesso:', eventoId);
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    throw error;
  }
};