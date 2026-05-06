// ============================================================================
// CONTEXT DE LIVROS
// ============================================================================
// Este Context centraliza o ESTADO GLOBAL dos livros.
// Em vez de cada tela buscar os livros sozinha, todas usam o mesmo Context.
// Vantagens:
//   - Uma única fonte de verdade (não há duas listas inconsistentes)
//   - Não precisa "passar props pra todo lado" (prop drilling)
//   - Toda atualização (criar, editar, deletar) reflete em todas as telas
// ============================================================================

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "../services/api";
import type { Book, BookInput } from "../types/Book";

// ----------------------------------------------------------------------------
// 1) TIPO DO QUE O CONTEXT VAI EXPOR
// ----------------------------------------------------------------------------
// Pense em quais "ferramentas" as telas vão querer usar.
// Sugestão (você pode ajustar se quiser):
//   - books: a lista atual de livros
//   - loading: indica se uma requisição está em andamento
//   - error: mensagem de erro, se houver
//   - reload(): força uma nova busca dos livros na API
//   - addBook(input): cria um novo livro
//   - editBook(id, input): atualiza um livro
//   - removeBook(id): remove um livro
type BooksContextValue = {
  books: Book[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addBook: (input: BookInput) => Promise<void>;
  editBook: (id: number, input: BookInput) => Promise<void>;
  removeBook: (id: number) => Promise<void>;
};


// ----------------------------------------------------------------------------
// 2) CRIA O CONTEXT
// ----------------------------------------------------------------------------
// Começamos com `undefined` para conseguir DETECTAR se alguém usar este
// Context fora de um Provider (e lançar um erro claro).
const BooksContext = createContext<BooksContextValue | undefined>(undefined);

// ----------------------------------------------------------------------------
// 3) PROVIDER - componente que envolve a árvore e fornece o estado
// ----------------------------------------------------------------------------
type BooksProviderProps = {
  children: React.ReactNode;
};

export function BooksProvider({ children }: BooksProviderProps) {
  // Estados básicos do contexto
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------------------
  // reload(): busca a lista de livros na API e atualiza o estado
  // ------------------------------------------------------------------------
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await api.listBooks();
      setBooks(resultado);
    } catch (e) {
      setError("Não foi possível carregar a lista de livros.");
    } finally {
      setLoading(false);
    }
  }, []);


  // ------------------------------------------------------------------------
  // addBook(input): cria um novo livro
  // ------------------------------------------------------------------------
  const addBook = useCallback(async (input: BookInput) => {
    setError(null);

    try {
      const novoLivro = await api.createBook(input);
      setBooks((prev) => [...prev, novoLivro]);
    } catch (e) {
      setError("Não foi possível adicionar o livro.");
      throw e;
    }
  }, []);

  // ------------------------------------------------------------------------
  // editBook(id, input): atualiza um livro existente
  // ------------------------------------------------------------------------
  const editBook = useCallback(async (id: number, input: BookInput) => {
    setError(null);

    try {
      const livroAtualizado = await api.updateBook(id, input);

      setBooks((prev) =>
        prev.map((book) => (book.id === id ? livroAtualizado : book))
      );
    } catch (e) {
      setError("Não foi possível editar o livro.");
      throw e;
    }
  }, []);

  // ------------------------------------------------------------------------
  // removeBook(id): deleta um livro
  // ------------------------------------------------------------------------
  const removeBook = useCallback(async (id: number) => {
    setError(null);

    try {
      await api.deleteBook(id);

      setBooks((prev) => prev.filter((book) => book.id !== id));
    } catch (e) {
      setError("Não foi possível remover o livro.");
      throw e;
    }
  }, []);

  // ------------------------------------------------------------------------
  // useEffect: carrega a lista assim que o Provider monta
  // ------------------------------------------------------------------------
  useEffect(() => {
    reload();
  }, [reload]);

  // ------------------------------------------------------------------------
  // O valor que vamos expor para os componentes filhos
  // ------------------------------------------------------------------------
  const value: BooksContextValue = {
    books,
    loading,
    error,
    reload,
    addBook,
    editBook,
    removeBook,
  };

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

// ----------------------------------------------------------------------------
// 4) HOOK CUSTOMIZADO - facilita o consumo do Context
// ----------------------------------------------------------------------------
// Por que? Em vez de toda tela escrever:
//    const ctx = useContext(BooksContext);
//    if (!ctx) throw new Error(...);
// Encapsulamos isso aqui e as telas só fazem:
//    const { books, addBook } = useBooks();
//
// É a convenção da comunidade React.
export function useBooks(): BooksContextValue {
  const context = useContext(BooksContext);
  if (context === undefined) {
    throw new Error(
      "useBooks() precisa ser usado DENTRO de um <BooksProvider>. " +
      "Você esqueceu de envolver seu app com <BooksProvider>?"
    );
  }
  return context;
}
