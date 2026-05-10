import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { addNote, updateNote } from '../database/db';
import { Colors, Typography } from '../theme';

// ─── Config ──────────────────────────────────────────────────────────────────

const PENS = [
  { id: 'pen',    label: 'Stylo',    fontStyle: 'normal', fontWeight: '400', fontFamily: undefined },
  { id: 'bold',   label: 'Marqueur', fontStyle: 'normal', fontWeight: '700', fontFamily: undefined },
  { id: 'italic', label: 'Italique', fontStyle: 'italic', fontWeight: '400', fontFamily: undefined },
  { id: 'mono',   label: 'Mono',     fontStyle: 'normal', fontWeight: '400', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  { id: 'draw',   label: 'Dessin',   fontStyle: 'normal', fontWeight: '400', fontFamily: undefined },
];

const PALETTE = [
  '#FFFDF7', '#FFD60A', '#FF453A', '#30D158',
  '#0A84FF', '#FF9F0A', '#BF5AF2', '#FF375F',
  '#64D2FF', '#98989D',
];

const SIZES = [14, 17, 20, 26, 34];
const BRUSH_SIZES = [2, 4, 7, 12, 20];

const { width: SCREEN_W } = Dimensions.get('window');
const CANVAS_HEIGHT = 340;

// ─── Canvas de dessin ────────────────────────────────────────────────────────

function DrawingCanvas({ color, brushSize, paths, setPaths }) {
  const currentPath = useRef('');
  const isDrawing   = useRef(false);

  // Convertit les coordonnées touch en coordonnées relatives au canvas
  const canvasRef = useRef(null);
  const offsetY   = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,

      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        isDrawing.current = true;
      },

      onPanResponderMove: (evt) => {
        if (!isDrawing.current) return;
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        // Force re-render par mise à jour d'un path "en cours"
        setPaths((prev) => {
          const next = [...prev];
          // Remplace le dernier élément s'il est "live"
          if (next.length > 0 && next[next.length - 1].live) {
            next[next.length - 1] = { d: currentPath.current, color, brushSize, live: true };
          } else {
            next.push({ d: currentPath.current, color, brushSize, live: true });
          }
          return next;
        });
      },

      onPanResponderRelease: () => {
        isDrawing.current = false;
        setPaths((prev) => {
          const next = [...prev];
          if (next.length > 0 && next[next.length - 1].live) {
            next[next.length - 1] = { ...next[next.length - 1], live: false };
          }
          return next;
        });
        currentPath.current = '';
      },
    })
  ).current;

  return (
    <View
      style={styles.canvas}
      ref={canvasRef}
      {...panResponder.panHandlers}
    >
      {/* Lignes de règle style carnet */}
      {Array.from({ length: Math.floor(CANVAS_HEIGHT / 32) }).map((_, i) => (
        <View
          key={i}
          style={[styles.canvasLine, { top: 40 + i * 32 }]}
        />
      ))}

      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height={CANVAS_HEIGHT}
      >
        {paths.map((p, i) => (
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

      {paths.length === 0 && (
        <Text style={styles.canvasPlaceholder}>Dessinez ici avec votre doigt...</Text>
      )}
    </View>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function NoteFormScreen({ navigation, route }) {
  const existingNote = route.params?.note;

  const [title,       setTitle]       = useState(existingNote?.title   || '');
  const [content,     setContent]     = useState(existingNote?.content || '');
  const [isSaving,    setIsSaving]    = useState(false);
  const [lastSaved,   setLastSaved]   = useState('');
  const [noteId,      setNoteId]      = useState(existingNote?.id || null);
  const [charCount,   setCharCount]   = useState(existingNote?.content?.length || 0);
  const [activePen,   setActivePen]   = useState(PENS[0]);
  const [activeColor, setActiveColor] = useState(PALETTE[0]);
  const [fontSize,    setFontSize]    = useState(17);
  const [brushSize,   setBrushSize]   = useState(4);
  const [showColors,  setShowColors]  = useState(false);
  const [showSizes,   setShowSizes]   = useState(false);
const [drawPaths, setDrawPaths] = useState(
  existingNote?.drawing ? JSON.parse(existingNote.drawing) : []
);
  const isDrawMode = activePen.id === 'draw';

  const saveTimeout = useRef(null);
  const contentRef  = useRef(null);
  const colorAnim   = useRef(new Animated.Value(0)).current;
  const sizeAnim    = useRef(new Animated.Value(0)).current;

  // ── Sauvegarde ──────────────────────────────────────────────────────────────
const saveNote = async (isExiting = false) => {
  if (!title.trim() && !content.trim() && drawPaths.length === 0) return;
  try {
    setIsSaving(true);
    const drawingJson = JSON.stringify(drawPaths);
    if (noteId) {
      await updateNote(noteId, title.trim(), content.trim(), drawingJson);
    } else {
      const newId = await addNote(title.trim(), content.trim(), drawingJson);
      setNoteId(newId);
    }
      if (!isExiting) {
        setLastSaved(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.error('Erreur sauvegarde:', e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveNote(false), 700);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [title, content, drawPaths]);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveNote(true);
    });
    return unsub;
  }, [navigation, title, content, noteId]);

  // ── Panneaux animés ─────────────────────────────────────────────────────────
  const openPanel = (panel) => {
    if (panel === 'colors') {
      const next = !showColors;
      setShowColors(next);
      setShowSizes(false);
      Animated.spring(colorAnim, { toValue: next ? 1 : 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
      Animated.spring(sizeAnim,  { toValue: 0, useNativeDriver: true }).start();
    } else {
      const next = !showSizes;
      setShowSizes(next);
      setShowColors(false);
      Animated.spring(sizeAnim,  { toValue: next ? 1 : 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
      Animated.spring(colorAnim, { toValue: 0, useNativeDriver: true }).start();
    }
  };

  const panelStyle = (anim) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [20, 0] }) }],
  });

  const dynamicStyle = {
    color:      activeColor,
    fontSize:   fontSize,
    fontStyle:  activePen.fontStyle,
    fontWeight: activePen.fontWeight,
    fontFamily: activePen.fontFamily,
    lineHeight: fontSize * 1.65,
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="light-content" />

      {/* Barre de statut */}
      <View style={styles.saveBar}>
        {isSaving ? (
          <View style={styles.row}>
            <ActivityIndicator size="small" color={Colors.yellow} />
            <Text style={styles.savingText}> Enregistrement...</Text>
          </View>
        ) : lastSaved ? (
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.yellow} />
            <Text style={styles.savedText}> Enregistré à {lastSaved}</Text>
          </View>
        ) : (
          <Text style={styles.draftText}>Brouillon</Text>
        )}
        {!isDrawMode && <Text style={styles.charCount}>{charCount} car.</Text>}
        {isDrawMode && (
          <TouchableOpacity onPress={() => setDrawPaths([])} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={14} color={Colors.red} />
            <Text style={styles.clearBtnText}>Effacer tout</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Zone de saisie / dessin ── */}
      {isDrawMode ? (
        // MODE DESSIN
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.titleInput}
            placeholder="Titre"
            placeholderTextColor={Colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <View style={styles.separator} />
          <DrawingCanvas
            color={activeColor}
            brushSize={brushSize}
            paths={drawPaths}
            setPaths={setDrawPaths}
          />
        </View>
      ) : (
        // MODE TEXTE
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            style={styles.titleInput}
            placeholder="Titre"
            placeholderTextColor={Colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            returnKeyType="next"
            onSubmitEditing={() => contentRef.current?.focus()}
          />
          <View style={styles.separator} />
          <TextInput
            ref={contentRef}
            style={[styles.contentInput, dynamicStyle]}
            placeholder="Commencez à écrire..."
            placeholderTextColor={Colors.textTertiary}
            value={content}
            onChangeText={(t) => { setContent(t); setCharCount(t.length); }}
            multiline
            textAlignVertical="top"
            autoFocus={!existingNote}
          />
        </ScrollView>
      )}

      {/* ── Panneau couleurs ── */}
      <Animated.View style={[styles.floatingPanel, panelStyle(colorAnim), !showColors && styles.hidden]}>
        <Text style={styles.panelLabel}>
          {isDrawMode ? 'Couleur du crayon' : 'Couleur du texte'}
        </Text>
        <View style={styles.colorGrid}>
          {PALETTE.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, activeColor === c && styles.colorDotActive]}
              onPress={() => { setActiveColor(c); openPanel('colors'); }}
            />
          ))}
        </View>
      </Animated.View>

      {/* ── Panneau tailles ── */}
      <Animated.View style={[styles.floatingPanel, panelStyle(sizeAnim), !showSizes && styles.hidden]}>
        <Text style={styles.panelLabel}>
          {isDrawMode ? 'Épaisseur du trait' : 'Taille du texte'}
        </Text>
        <View style={styles.sizeRow}>
          {(isDrawMode ? BRUSH_SIZES : SIZES).map((s) => {
            const isActive = isDrawMode ? brushSize === s : fontSize === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.sizeBtn, isActive && styles.sizeBtnActive]}
                onPress={() => {
                  isDrawMode ? setBrushSize(s) : setFontSize(s);
                  openPanel('sizes');
                }}
              >
                {isDrawMode ? (
                  // Aperçu épaisseur
                  <View style={[styles.brushPreview, { height: s, width: s, borderRadius: s, backgroundColor: isActive ? Colors.yellow : Colors.textSecondary }]} />
                ) : (
                  <Text style={{ fontSize: Math.min(s * 0.75, 22), color: isActive ? Colors.yellow : Colors.textSecondary, fontWeight: isActive ? '600' : '400' }}>Aa</Text>
                )}
                <Text style={[styles.sizeLabel, isActive && { color: Colors.yellow }]}>
                  {isDrawMode ? `${s}px` : `${s}px`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* ── Barre d'outils ── */}
      <View style={styles.toolbar}>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pensRow}>
          {PENS.map((pen) => {
            const isActive = activePen.id === pen.id;
            return (
              <TouchableOpacity
                key={pen.id}
                style={[styles.penBtn, isActive && styles.penBtnActive]}
                onPress={() => setActivePen(pen)}
              >
                <PenIllustration penId={pen.id} active={isActive} color={activeColor} />
                <Text style={[styles.penLabel, isActive && styles.penLabelActive]}>{pen.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.toolSep} />

        {/* Couleur */}
        <TouchableOpacity style={styles.toolBtn} onPress={() => openPanel('colors')}>
          <View style={[styles.colorCircle, { backgroundColor: activeColor }, showColors && styles.toolBtnActiveRing]}>
            {activeColor === '#FFFDF7' && <View style={styles.colorCircleInner} />}
          </View>
        </TouchableOpacity>

        {/* Taille */}
        <TouchableOpacity style={styles.toolBtn} onPress={() => openPanel('sizes')}>
          <View style={[styles.sizePill, showSizes && styles.sizePillActive]}>
            <Text style={[styles.sizePillText, showSizes && { color: Colors.background }]}>
              {isDrawMode ? brushSize : fontSize}
            </Text>
          </View>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Illustrations stylos ────────────────────────────────────────────────────

function PenIllustration({ penId, active, color }) {
  const ink  = active ? color : '#555';
  const body = active ? '#2C2C2E' : '#1E1E20';

  if (penId === 'pen') return (
    <View style={ill.wrap}>
      <View style={[ill.penBody, { backgroundColor: body }]} />
      <View style={[ill.penBand, { backgroundColor: ink }]} />
      <View style={ill.penTipOuter} />
      <View style={[ill.penTipInk, { backgroundColor: ink }]} />
    </View>
  );

  if (penId === 'bold') return (
    <View style={ill.wrap}>
      <View style={[ill.markerCap,  { backgroundColor: ink }]} />
      <View style={[ill.markerBody, { backgroundColor: body }]} />
      <View style={[ill.markerBand, { backgroundColor: ink }]} />
      <View style={ill.markerNib} />
    </View>
  );

  if (penId === 'italic') return (
    <View style={ill.wrap}>
      <View style={[ill.pencilBody, { backgroundColor: body }]} />
      <View style={[ill.pencilStripes, { borderColor: ink, opacity: 0.5 }]} />
      <View style={[ill.pencilTip, { borderTopColor: '#C8A96A' }]} />
      <View style={[ill.pencilLead, { backgroundColor: ink }]} />
    </View>
  );

  if (penId === 'mono') return (
    <View style={ill.wrap}>
      <View style={[ill.rulerBody, { backgroundColor: body, borderColor: ink }]}>
        {[0,1,2,3,4,5].map(i => (
          <View key={i} style={[ill.rulerTick, { backgroundColor: ink, width: i % 3 === 0 ? 8 : 5 }]} />
        ))}
      </View>
    </View>
  );

  // 🖌️ Crayon libre
  return (
    <View style={ill.wrap}>
      {/* Corps du crayon libre — pointe en bas, gomme en haut */}
      <View style={[ill.freeGomme, { backgroundColor: active ? '#FF9F9F' : '#555' }]} />
      <View style={[ill.freeBand, { backgroundColor: active ? '#C0C0C0' : '#444' }]} />
      <View style={[ill.freeBody, { backgroundColor: body }]} />
      <View style={[ill.freeWood, { backgroundColor: active ? '#C8A96A' : '#4A3A2A' }]} />
      {/* Trait de couleur sur la pointe */}
      <View style={[ill.freeStreak, { backgroundColor: ink }]} />
    </View>
  );
}

const ill = StyleSheet.create({
  wrap:         { width: 32, height: 70, alignItems: 'center', justifyContent: 'flex-end' },
  penBody:      { width: 12, height: 38, borderRadius: 2 },
  penBand:      { width: 12, height: 4 },
  penTipOuter:  { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#111' },
  penTipInk:    { width: 3, height: 5, borderRadius: 1.5 },
  markerCap:    { width: 18, height: 12, borderRadius: 4 },
  markerBody:   { width: 20, height: 30, borderRadius: 3 },
  markerBand:   { width: 20, height: 4 },
  markerNib:    { width: 12, height: 8, backgroundColor: '#1A1A1C', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  pencilBody:   { width: 14, height: 36, borderRadius: 2 },
  pencilStripes:{ width: 14, height: 4, borderTopWidth: 1.5 },
  pencilTip:    { width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  pencilLead:   { width: 3, height: 5, borderRadius: 1.5 },
  rulerBody:    { width: 20, height: 52, borderRadius: 2, borderWidth: 1, justifyContent: 'space-evenly', alignItems: 'flex-start', paddingLeft: 2 },
  rulerTick:    { height: 1.5 },
  // Crayon libre
  freeGomme:    { width: 14, height: 8,  borderRadius: 3 },
  freeBand:     { width: 14, height: 3 },
  freeBody:     { width: 14, height: 34, borderRadius: 2 },
  freeWood:     { width: 0,  height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 14, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  freeStreak:   { width: 3,  height: 6,  borderRadius: 1.5 },
});

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },

  saveBar:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  row:        { flexDirection: 'row', alignItems: 'center' },
  savingText: { ...Typography.caption, color: Colors.yellow },
  savedText:  { ...Typography.caption, color: Colors.yellow },
  draftText:  { ...Typography.caption, color: Colors.textTertiary },
  charCount:  { ...Typography.caption, color: Colors.textTertiary },
  clearBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: Colors.redDim },
  clearBtnText: { ...Typography.caption, color: Colors.red },

  scrollContent: { flexGrow: 1, padding: 20, paddingBottom: 220 },
  titleInput: {
    ...Typography.title2, color: Colors.textPrimary,
    paddingVertical: 8, paddingHorizontal: 20, backgroundColor: 'transparent',
  },
  separator:    { height: 0.5, backgroundColor: Colors.border, marginHorizontal: 20, marginVertical: 6 },
  contentInput: { flex: 1, minHeight: 400, backgroundColor: 'transparent', paddingVertical: 0, paddingHorizontal: 20 },

  // Canvas de dessin
  canvas: {
    flex: 1,
    backgroundColor: '#1A1A1C',
    margin: 12,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    minHeight: CANVAS_HEIGHT,
  },
  canvasLine: {
    position: 'absolute', left: 16, right: 16,
    height: 0.5, backgroundColor: 'rgba(255,214,10,0.08)',
  },
  canvasPlaceholder: {
    position: 'absolute', top: 16, left: 0, right: 0,
    textAlign: 'center',
    ...Typography.footnote,
    color: Colors.textTertiary,
  },

  // Panneaux flottants
  floatingPanel: { position: 'absolute', bottom: 125, left: 12, right: 12, backgroundColor: '#2A2A2C', borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: Colors.border, zIndex: 20 },
  hidden:        { pointerEvents: 'none' },
  panelLabel:    { ...Typography.caption, color: Colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  colorGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorDot:      { width: 32, height: 32, borderRadius: 16 },
  colorDotActive:{ borderWidth: 3, borderColor: Colors.yellow, transform: [{ scale: 1.1 }] },
  sizeRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  sizeBtn:       { alignItems: 'center', flex: 1, paddingVertical: 10, borderRadius: 10, marginHorizontal: 2 },
  sizeBtnActive: { backgroundColor: Colors.yellowDim },
  sizeLabel:     { ...Typography.caption, color: Colors.textTertiary, marginTop: 6 },
  brushPreview:  { marginVertical: 6 },

  // Barre d'outils
  toolbar:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161618', borderTopWidth: 0.5, borderTopColor: Colors.border, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 28 : 12, paddingHorizontal: 6 },
  pensRow:      { flexDirection: 'row', alignItems: 'flex-end', gap: 2, paddingHorizontal: 2 },
  penBtn:       { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  penBtnActive: { backgroundColor: 'rgba(255,214,10,0.08)' },
  penLabel:     { fontSize: 10, color: Colors.textTertiary, marginTop: 4 },
  penLabelActive: { color: Colors.yellow },
  toolSep:      { width: 0.5, height: 50, backgroundColor: Colors.border, marginHorizontal: 4 },
  toolBtn:      { alignItems: 'center', justifyContent: 'center', padding: 8 },
  colorCircle:  { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: Colors.surfaceElevated, justifyContent: 'center', alignItems: 'center' },
  colorCircleInner: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border },
  toolBtnActiveRing: { borderColor: Colors.yellow },
  sizePill:     { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: Colors.border },
  sizePillActive: { backgroundColor: Colors.yellow },
  sizePillText: { ...Typography.footnote, color: Colors.yellow, fontWeight: '700' },
});