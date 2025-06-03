import api from './api';
import { IEvento } from "@/src/types";

export const criarEvento = async (
  evento: IEvento,
  localId: string,
  categoriasIds: string[]
): Promise<string> => {
  try {
    // 1. Criar o evento básico primeiro
    const response = await api.post("/classes/Evento", {
      NomeEvt: evento.NomeEvt,
      Descricao: evento.Descricao,
      Data: { __type: "Date", iso: evento.Data.toISOString() },
      status: evento.status,
      local: {
        __type: "Pointer",
        className: "Local",
        objectId: localId,
      }
    });

    const eventoId = response.data.objectId;

    // 2. Adicionar as categorias como relação
    if (categoriasIds.length > 0) {
      await api.put(`/classes/Evento/${eventoId}`, {
        categorias: {
          __op: "AddRelation",
          objects: categoriasIds.map(id => ({
            __type: "Pointer",
            className: "Categoria",
            objectId: id
          }))
        }
      });
    }

    return eventoId;
  } catch (error: any) {
    console.error("Erro ao criar evento:", {
      error: error.response?.data || error,
      categoriasEnviadas: categoriasIds
    });
    throw new Error("Erro ao criar evento com categorias");
  }
};

export const buscarEventos = async (): Promise<any[]> => {
  try {
    const response = await api.post("/functions/buscarEventosComCategorias", {});
    return response.data.result;
  } catch (error: any) {
    console.error("Erro ao buscar eventos:", error);
    throw new Error("Erro ao buscar eventos");
  }
};

export const atualizarEvento = async (
  eventoId: string,
  eventData: {
    NomeEvt?: string;
    Descricao?: string;
    Data?: Date;
    status?: boolean;
  },
  localId?: string,
  categoriasParaAdicionar: string[] = [],
  categoriasParaRemover: string[] = []
): Promise<void> => {
  try {
    // Atualizar dados básicos
    const updateData: any = {};
    if (eventData.NomeEvt) updateData.NomeEvt = eventData.NomeEvt;
    if (eventData.Descricao) updateData.Descricao = eventData.Descricao;
    if (eventData.Data) updateData.Data = { __type: "Date", iso: eventData.Data.toISOString() };
    if (eventData.status !== undefined) updateData.status = eventData.status;
    if (localId) {
      updateData.local = {
        __type: "Pointer",
        className: "Local",
        objectId: localId
      };
    }

    if (Object.keys(updateData).length > 0) {
      await api.put(`/classes/Evento/${eventoId}`, updateData);
    }

    // Atualizar categorias
    if (categoriasParaAdicionar.length > 0) {
      await api.put(`/classes/Evento/${eventoId}`, {
        categorias: {
          __op: "AddRelation",
          objects: categoriasParaAdicionar.map(id => ({
            __type: "Pointer",
            className: "Categoria",
            objectId: id
          }))
        }
      });
    }

    if (categoriasParaRemover.length > 0) {
      await api.put(`/classes/Evento/${eventoId}`, {
        categorias: {
          __op: "RemoveRelation",
          objects: categoriasParaRemover.map(id => ({
            __type: "Pointer",
            className: "Categoria",
            objectId: id
          }))
        }
      });
    }
  } catch (error: any) {
    console.error("Erro ao atualizar evento:", error);
    throw new Error("Erro ao atualizar evento");
  }
};

export const deletarEvento = async (id: string): Promise<void> => {
  try {
    await api.delete(`/classes/Evento/${id}`);
  } catch (error: any) {
    console.error("Erro ao deletar evento:", error);
    throw new Error("Erro ao deletar evento");
  }
};