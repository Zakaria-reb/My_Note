import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { formatDate } from '../utils/formatDate';
import { Colors, Typography } from '../theme';

export default function NoteDetailScreen({ route, navigation }) {
  const { note } = route.params;

  // Parse le dessin une seule fois
  const drawPaths = React.useMemo(() => {
    try {
      return note.drawing ? JSON.parse(note.drawing) : [];
    } catch {
      return [];
    }
  }, [note.drawing]);

  const handleShareAsFile = async () => {
    try {
      const fileContent = `${note.title}\n\n${note.content}`;
      const sanitizedTitle =
        note.title.replace(/[^a-zA-Z0-9\s]/g, '_').trim() || 'ma_note';
      const fileName = `${sanitizedTitle}.txt`;
      const file = new File(Paths.cache, fileName);
      await file.write(fileContent);
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erreur', 'Le partage n\'est pas disponible sur cet appareil');
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/plain',
        dialogTitle: `Partager ${fileName}`,
        UTI: 'public.plain-text',
      });
    } catch (error) {
      console.error('Erreur partage:', error);
      Alert.alert('Erreur', 'Impossible de partager la note');
    }
  };

  const handleEdit = () => navigation.navigate('NoteForm', { note });

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la note',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const wordCount = note.content
    ? note.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Titre */}
        <Text style={styles.title}>{note.title || 'Sans titre'}</Text>

        {/* Meta : date + nb mots */}
        <View style={styles.meta}>
          <Text style={styles.metaText}>{formatDate(note.updated_at)}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>
            {wordCount} {wordCount === 1 ? 'mot' : 'mots'}
          </Text>
        </View>

        {/* Séparateur */}
        <View style={styles.separator} />

        {/* Corps texte */}
        {note.content ? (
          <Text style={styles.content}>{note.content}</Text>
        ) : null}

        {/* ── Dessin SVG ── */}
        {drawPaths.length > 0 && (
          <View style={styles.drawingContainer}>
            {note.content ? <View style={styles.drawingSeparator} /> : null}
            <View style={styles.drawingWrapper}>
              {/* Lignes de règle comme dans l'éditeur */}
              {Array.from({ length: 10 }).map((_, i) => (
                <View key={i} style={[styles.canvasLine, { top: 40 + i * 32 }]} />
              ))}
              <Svg width="100%" height={340}>
                {drawPaths.map((p, i) => (
                  <Path
                    key={i}
                    d={p.d}
                    stroke={p.color}
                    strokeWidth={p.brushSize}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))}
              </Svg>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Barre d'actions */}
      <View style={styles.actionBar}>
        <ActionBtn icon="create-outline" label="Modifier" onPress={handleEdit} />
        <ActionBtn icon="share-outline" label="Partager" onPress={handleShareAsFile} />
        <ActionBtn icon="trash-outline" label="Supprimer" onPress={handleDelete} danger />
      </View>
    </View>
  );
}

function ActionBtn({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, danger && styles.actionBtnDanger]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={22} color={danger ? Colors.red : Colors.yellow} />
      <Text style={[styles.actionLabel, danger && styles.actionLabelDanger]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  title: { ...Typography.title1, color: Colors.textPrimary, marginBottom: 10 },

  meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  metaText: { ...Typography.caption, color: Colors.textSecondary },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textTertiary, marginHorizontal: 8 },

  separator: { height: 0.5, backgroundColor: Colors.border, marginBottom: 20 },

  content: { ...Typography.body, color: Colors.textPrimary, lineHeight: 28 },

  // Dessin
  drawingContainer: { marginTop: 8 },
  drawingSeparator: { height: 0.5, backgroundColor: Colors.border, marginVertical: 20 },
  drawingWrapper: {
    borderRadius: 14,
    backgroundColor: '#1A1A1C',
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    height: 340,
  },
  canvasLine: {
    position: 'absolute', left: 16, right: 16,
    height: 0.5, backgroundColor: 'rgba(255,214,10,0.08)',
  },

  // Barre d'actions
  actionBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 28,
    justifyContent: 'space-around',
  },
  actionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: 12, marginHorizontal: 4, backgroundColor: Colors.yellowDim,
  },
  actionBtnDanger: { backgroundColor: Colors.redDim },
  actionLabel: { ...Typography.caption, color: Colors.yellow, marginTop: 5, fontWeight: '500' },
  actionLabelDanger: { color: Colors.red },
});