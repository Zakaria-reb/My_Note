import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllNotes, deleteNote } from '../database/db';
import { formatDate } from '../utils/formatDate';
import { Colors, Typography } from '../theme';

export default function HomeScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const fabScale = new Animated.Value(1);

  const loadNotes = async () => {
    const allNotes = await getAllNotes();
    setNotes(allNotes);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadNotes);
    return unsubscribe;
  }, [navigation]);

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    Alert.alert(
      'Supprimer la note',
      'Voulez-vous vraiment supprimer cette note ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(id);
            loadNotes();
          },
        },
      ]
    );
  };

  const onFabPressIn = () =>
    Animated.spring(fabScale, { toValue: 0.9, useNativeDriver: true }).start();
  const onFabPressOut = () =>
    Animated.spring(fabScale, { toValue: 1, useNativeDriver: true }).start();

  const getPreviewLines = (content) => content?.split('\n').slice(0, 2).join(' ') || '';

  const renderNote = ({ item, index }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => navigation.navigate('NoteDetail', { note: item })}
      activeOpacity={0.7}
    >
      {/* Bande jaune gauche */}
      <View style={styles.noteAccent} />

      <View style={styles.noteBody}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {item.title || 'Sans titre'}
          </Text>
          <Text style={styles.noteDate}>{formatDate(item.updated_at)}</Text>
        </View>

        <Text style={styles.noteContent} numberOfLines={2}>
          {getPreviewLines(item.content)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.deleteBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notes</Text>
        <Text style={styles.headerCount}>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher"
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Liste ou état vide */}
      {filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="document-text-outline" size={44} color={Colors.yellow} />
          </View>
          <Text style={styles.emptyText}>
            {search ? 'Aucun résultat' : 'Aucune note'}
          </Text>
          <Text style={styles.emptySubText}>
            {search
              ? 'Essayez un autre mot-clé'
              : 'Appuyez sur + pour créer votre première note'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNote}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bouton flottant */}
      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={styles.fabInner}
          onPress={() => navigation.navigate('NoteForm')}
          onPressIn={onFabPressIn}
          onPressOut={onFabPressOut}
          activeOpacity={1}
        >
          <Ionicons name="pencil" size={24} color={Colors.background} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 8,
  },
  headerTitle: {
    ...Typography.largeTitle,
    color: Colors.yellow,
  },
  headerCount: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Recherche
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...Typography.subhead,
    color: Colors.textPrimary,
    height: 40,
  },

  // Liste
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Carte note
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  noteAccent: {
    width: 4,
    height: '100%',
    backgroundColor: Colors.yellow,
  },
  noteBody: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  noteTitle: {
    ...Typography.headline,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  noteDate: {
    ...Typography.caption,
    color: Colors.textTertiary,
    flexShrink: 0,
  },
  noteContent: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  // État vide
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    backgroundColor: Colors.yellowDim,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    ...Typography.title3,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubText: {
    ...Typography.subhead,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.yellow,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  fabInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
});