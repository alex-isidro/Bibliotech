// ============================================================================
// TELA: LISTAGEM DE LIVROS
// ============================================================================
// Mostra todos os livros usando o BooksContext.
// Tem botões para adicionar, editar, excluir e filtrar a lista.
//
// O QUE JÁ ESTÁ PRONTO:
//   - Estrutura visual da tela (cabeçalho, lista, botão flutuante)
//   - Confirmação antes de excluir (Alert)
//   - Navegação para a tela de formulário (criar / editar)
// ============================================================================

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import { BookCard } from "../components/BookCard";
import { useBooks } from "../contexts/BooksContext";
import { loadFilter, saveFilter } from "../storage/preferences";
import type { BookFilter } from "../storage/preferences";
import type { Book } from "../types/Book";
import type { RootStackParamList } from "../../App";

// Tipo das props quando esta tela é usada via React Navigation
type Props = NativeStackScreenProps<RootStackParamList, "BookList">;

export function BookListScreen({ navigation }: Props) {
  // Pega tudo que o Context expõe
  const { books, loading, error, reload, removeBook } = useBooks();

  // Estado local: o filtro selecionado pelo usuário
  const [filter, setFilter] = useState<BookFilter>("all");

  // Estado local: o texto da busca por título
  const [search, setSearch] = useState("");

    // Estado local: controla se ordena por título ou por ano
  const [sortBy, setSortBy] = useState<"titulo" | "ano">("titulo");



  // ------------------------------------------------------------------------
  // useEffect: ao montar a tela, busca o filtro que estava salvo da última vez
  // ------------------------------------------------------------------------
useEffect(() => {
  async function carregarFiltroSalvo() {
    const filtroSalvo = await loadFilter();
    setFilter(filtroSalvo);
  }

  carregarFiltroSalvo();
}, []);

  // ------------------------------------------------------------------------
  // Função chamada quando o usuário toca em um botão de filtro.
  // ------------------------------------------------------------------------
async function handleChangeFilter(novoFiltro: BookFilter) {
  setFilter(novoFiltro);
  await saveFilter(novoFiltro);
}

  // ------------------------------------------------------------------------
  // Aplica o filtro na lista vinda do Context.
  // ------------------------------------------------------------------------
  const livrosFiltrados: Book[] = books
    .filter((book) => {
      // 1. Filtro de leitura
      if (filter === "read" && book.read === false) return false;
      if (filter === "unread" && book.read === true) return false;
      return true;
    })
    .filter((book) => {
      // 2. Filtro de Busca por título
      if (search === "") return true;
      return book.title.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      // 3. Ordenação (NOVO)
      if (sortBy === "ano") {
        return b.year - a.year; // Mais recentes primeiro
      } else {
        return a.title.localeCompare(b.title); // Ordem alfabética (A-Z)
      }
    });


  // ------------------------------------------------------------------------
  // Confirmação antes de excluir
  // ------------------------------------------------------------------------
  function confirmDelete(book: Book) {
    Alert.alert(
      "Excluir livro",
      `Tem certeza que deseja excluir "${book.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await removeBook(book.id);
            } catch (e) {
              Alert.alert("Erro", "Não foi possível excluir o livro.");
            }
          },
        },
      ]
    );
  }

  // ------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // ------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Botões de Ordenação */}
      <View style={styles.filters}>
        <Text style={{ alignSelf: 'center', marginRight: 8, color: '#374151', fontWeight: '600' }}>Ordenar por:</Text>
        <FilterButton label="Título (A-Z)" active={sortBy === "titulo"} onPress={() => setSortBy("titulo")} />
        <FilterButton label="Ano (Mais novos)" active={sortBy === "ano"} onPress={() => setSortBy("ano")} />
      </View>

      {/* Barra de Busca */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar livro por título..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Contador de Livros */}
      <Text style={styles.counter}>
        Mostrando {livrosFiltrados.length} {livrosFiltrados.length === 1 ? 'livro' : 'livros'}
      </Text>


      {/* Botões de filtro */}
      <View style={styles.filters}>
        <FilterButton label="Todos" active={filter === "all"} onPress={() => handleChangeFilter("all")} />
        <FilterButton label="Lidos" active={filter === "read"} onPress={() => handleChangeFilter("read")} />
        <FilterButton label="Não lidos" active={filter === "unread"} onPress={() => handleChangeFilter("unread")} />
      </View>

      {/* Mensagem de erro */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Loading */}
      {loading && <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 16 }} />}

      {/* Lista */}
      <FlatList
        data={livrosFiltrados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={reload} // pull-to-refresh já configurado
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onEdit={(b) => navigation.navigate("BookForm", { book: b })}
            onDelete={confirmDelete}
            onPress={(b) => navigation.navigate("BookDetail", { book: b })}
          />
        )}

        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>Nenhum livro encontrado.</Text>
          ) : null
        }
      />

      {/* Botão flutuante para adicionar */}
      <Pressable style={styles.fab} onPress={() => navigation.navigate("BookForm", {})}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Componente local para os botões de filtro (poderia estar em outro arquivo,
// mas é usado só aqui).
// ----------------------------------------------------------------------------
function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 12,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#7c3aed",
  },
  filterText: {
    color: "#374151",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },
  list: {
    paddingBottom: 80,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
  },
  error: {
    color: "#e63946",
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  counter: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    fontWeight: "500",
  },

});
