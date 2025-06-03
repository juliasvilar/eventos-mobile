// src/types.ts

// --- Interfaces para objetos formatados (exibidos no front-end) ---

export interface ILocalFormatado {
  id: string;           // ID gerado pelo Parse
  Nome: string;
  Capacidade: number;
}

export interface ICategoriaFormatada {
  id: string;           // ID gerado pelo Parse
  Nome: string;
}

export interface IEventoFormatado {
  id: string;           // ID gerado pelo Parse
  NomeEvt: string;
  Descricao: string;
  Data: Date;
  status: boolean;
  local: ILocalFormatado | null;           // Pode ser null se não houver local associado
  categorias?: ICategoriaFormatada[];      // Pode ser omitido ou array vazio
}

// --- Interfaces para criação/atualização (envio ao Parse via Axios) ---

export interface IEvento {
  NomeEvt: string;
  Descricao: string;
  Data: Date;
  status: boolean;
}

export interface ICategoria {
  Nome: string;
}

export interface ILocal {
  Nome: string;
  Capacidade: number;
}
