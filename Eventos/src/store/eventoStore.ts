// src/store/eventoStore.ts
import { create } from 'zustand';
import { buscarEventos } from '@/service/eventoService';
import { buscarLocais } from '@/service/localService';
import { buscarCategorias } from '@/service/categoriaService';
import { IEventoFormatado, ILocalFormatado, ICategoriaFormatada } from '@/src/types';

interface EventoStoreState {
  eventos: IEventoFormatado[];
  locais: ILocalFormatado[];
  categorias: ICategoriaFormatada[];
  loading: boolean;
  error: string | null;
  carregarDados: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEventoStore = create<EventoStoreState>((set) => ({
  eventos: [],
  locais: [],
  categorias: [],
  loading: false,
  error: null,

  carregarDados: async () => {
    set({ loading: true, error: null });
    try {
      const [eventosData, locaisData, categoriasData] = await Promise.all([
        buscarEventos(),
        buscarLocais(),
        buscarCategorias(),
      ]);

      const eventosFormatados: IEventoFormatado[] = eventosData.map((evento: any) => ({
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
        categorias: (evento.categorias?.results || evento.categorias || []).map((cat: any) => ({
          id: cat.objectId || cat.id,
          Nome: cat.Nome,
        })),
      }));

      set({
        eventos: eventosFormatados,
        locais: locaisData,
        categorias: categoriasData,
        loading: false,
      });
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      set({
        error: error.message || 'Erro ao carregar dados',
        loading: false,
      });
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));