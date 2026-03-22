import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CHAPTERS = [
  { id: 'bin-colours-meanings',           number: '01', label: 'Bin Colours & Meanings',           emoji: '🗑️' },
  { id: 'accepted-items-by-postcode',     number: '02', label: 'Accepted Items by Postcode',       emoji: '📮' },
  { id: 'collection-service-updates',     number: '03', label: 'Collection & Service Updates',     emoji: '🚛' },
];

export default function LocalRulesScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Local Rules</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.heroBox}>
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroPlaceholderText}>🗑️ 📮 🚛</Text>
          </View>
        </View>
        <View style={styles.descBox}>
          <Text style={styles.descTitle}>Learn about Paper & Cardboard</Text>
          <Text style={styles.descSubtitle}>Explore your Grade 10 Biology topics with fun lessons, quizzes, and games.</Text>
        </View>
        <View style={styles.chapterList}>
          {CHAPTERS.map((ch) => (
            <TouchableOpacity key={ch.id} style={styles.chapterRow} activeOpacity={0.75}
              onPress={() => router.push(`/(tabs)/LocalRulesChapters?chapter=${ch.id}` as any)}>
              <View style={styles.chapterThumb}>
                <View style={styles.chapterThumbPlaceholder}>
                  <Text style={{ fontSize: 20 }}>{ch.emoji}</Text>
                </View>
              </View>
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterNumber}>Chapter {ch.number}</Text>
                <Text style={styles.chapterLabel}>{ch.label}</Text>
              </View>
              <View style={styles.chapterArrow}><Feather name="chevron-right" size={18} color="#606C38" /></View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={() => router.push(`/(tabs)/LocalRulesChapters?chapter=${CHAPTERS[0].id}` as any)} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>Start Lesson</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#fff' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  heroBox: { marginHorizontal: 20, marginTop: 8, borderRadius: 18, overflow: 'hidden' },
  heroPlaceholder: { width: '100%', height: 180, backgroundColor: '#E8F0DC', justifyContent: 'center', alignItems: 'center', borderRadius: 18 },
  heroPlaceholderText: { fontSize: 48, letterSpacing: 8 },
  descBox: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  descTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  descSubtitle: { fontSize: 14, color: '#777', lineHeight: 20 },
  chapterList: { paddingHorizontal: 20, marginTop: 16 },
  chapterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  chapterThumb: { width: 52, height: 52, borderRadius: 10, overflow: 'hidden', marginRight: 14 },
  chapterThumbPlaceholder: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#E8F0DC', justifyContent: 'center', alignItems: 'center' },
  chapterInfo: { flex: 1 },
  chapterNumber: { fontSize: 11, color: '#999', fontWeight: '600', marginBottom: 2 },
  chapterLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  chapterArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 34, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  startBtn: { backgroundColor: '#606C38', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});