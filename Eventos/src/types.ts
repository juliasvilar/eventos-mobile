// src/types.ts

import Parse from 'parse/react-native';

// --- Interfaces para objetos Parse brutos (retornados diretamente pelo SDK) ---
// Usadas para tipar os Parse.Object quando você os manipula com .get(), .set() etc.
// Importante: NÃO sobrescreva os métodos get() ou relation() aqui.
// Apenas declare as propriedades que você espera manipular ou que Parse.Object possui.

export interface IParseLocal extends Parse.Object {
  // Parse.Object já tem .get('Nome') e .get('Capacidade')
  // Não precisamos redefini-los aqui.
  // Se você for usar .set('Nome', 'novo nome'), o TypeScript infere pelo .set() base.
}

export interface IParseCategoria extends Parse.Object {
  // Parse.Object já tem .get('Nome'), .save(), .set()
  // Não precisamos redefini-los aqui.
}

export interface IParseEvento extends Parse.Object {
  // Parse.Object já tem .get(), .set(), .relation()
  // Não precisamos redefini-los aqui.
}


// --- Interfaces para objetos formatados (usados no estado do React Native) ---
// Estes são os objetos "limpos" e fáceis de usar após a busca e formatação.
// Essas interfaces permanecem as mesmas, pois representam o formato final que você quer.
export interface ILocalFormatado {
  id: string; // ID gerado pelo Parse
  Nome: string;
  Capacidade: number;
}

export interface ICategoriaFormatada {
  id: string; // ID gerado pelo Parse
  Nome: string;
}

export interface IEventoFormatado {
  id: string; // ID gerado pelo Parse
  NomeEvt: string;
  Descricao: string;
  Data: Date;
  status: boolean;
  local: ILocalFormatado | null; // Pode ser null se não houver local associado ou se for buscar sem include
  categorias?: ICategoriaFormatada[]; // É opcional, pode ser um array vazio
}