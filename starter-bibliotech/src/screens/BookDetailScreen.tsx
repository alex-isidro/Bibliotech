// ============================================================================
// TELA: DETALHES DO LIVRO
// ============================================================================
// Esta tela foi criada como DESAFIO BÔNUS e tem duas funções:
//   1) Mostrar todas as informações de um livro de forma expandida e elegante.
//   2) Salvar o ID do livro nas preferências (AsyncStorage) assim que é aberta.
//
// O QUE ESTÁ IMPLEMENTADO AQUI:
//   - Recebimento do parâmetro `book` via rota de navegação.
//   - Uso do `useEffect` para chamar `saveLastViewedId(book.id)`.
//   - Renderização dos dados completos e estilo de estrelas da avaliação.
// ============================================================================
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../../App";
import { saveLastViewedId } from "../storage/preferences";

type Props = NativeStackScreenProps<RootStackParamList, "BookDetail">;

export function BookDetailScreen({ route }: Props) {
  const { book } = route.params;

  // Ao abrir a tela, salva o ID deste livro nas preferências!
  useEffect(() => {
    saveLastViewedId(book.id);
  }, [book.id]);

  const stars = "★".repeat(book.rating) + "☆".repeat(5 - book.rating);

  // ------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // ------------------------------------------------------------------------
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>Por: {book.author}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ano de Lançamento:</Text>
          <Text style={styles.value}>{book.year}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Gênero:</Text>
          <Text style={styles.value}>{book.genre}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.status, book.read ? styles.statusRead : styles.statusUnread]}>
            {book.read ? "Lido" : "Não Lido"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Avaliação:</Text>
          <Text style={styles.stars}>{stars}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    color: "#4b5563",
    marginBottom: 24,
    fontStyle: "italic",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  label: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: "#1a1a2e",
    fontWeight: "bold",
  },
  stars: {
    color: "#f59e0b",
    fontSize: 20,
    letterSpacing: 2,
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "bold",
    overflow: "hidden",
  },
  statusRead: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
  },
  statusUnread: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
});
