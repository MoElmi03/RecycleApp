import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getUserProgress } from '../../lib/progress';

// ── ALL chapter data in one place ──────────────────────────────────────────
interface Part { id: string; label: string; emoji: string; }
interface ChapterConfig {
  navTitle: string;
  title: string;
  subtitle: string;
  heroEmoji: string;
  heroColor: string;
  returnRoute: string;
  parts: Part[];
}

const CHAPTERS: Record<string, ChapterConfig> = {
  // GLASS & METAL
  'glass-recycling': {
    navTitle: 'Glass Recycling', title: 'Glass Recycling', heroEmoji: '🫙',
    heroColor: '#E8F0DC', subtitle: 'Learn how to recycle glass bottles and jars correctly.',
    returnRoute: '/(tabs)/GlassAndMetal',
    parts: [
      { id: 'glass-recycling-01', label: 'Bottles & Jars',  emoji: '🫙' },
      { id: 'glass-recycling-02', label: 'Removing Lids',   emoji: '🪛' },
      { id: 'glass-recycling-03', label: 'Rinsing Glass',   emoji: '💧' },
    ],
  },
  'metal-recycling': {
    navTitle: 'Metal Recycling', title: 'Metal Recycling', heroEmoji: '🥫',
    heroColor: '#E8F0DC', subtitle: 'Learn the rules for recycling metal tins and cans.',
    returnRoute: '/(tabs)/GlassAndMetal',
    parts: [
      { id: 'metal-recycling-01', label: 'Cans & Tins',          emoji: '🥫' },
      { id: 'metal-recycling-02', label: 'Aluminium vs. Steel',  emoji: '🔍' },
      { id: 'metal-recycling-03', label: 'Aerosols',             emoji: '🧴' },
    ],
  },
  'foil-small-metals': {
    navTitle: 'Foil & Small Metals', title: 'Foil & Small Metals', heroEmoji: '🫕',
    heroColor: '#E8F0DC', subtitle: 'Learn about foil and small metal item recycling.',
    returnRoute: '/(tabs)/GlassAndMetal',
    parts: [
      { id: 'foil-small-metals-01', label: 'Foil Scrunch Test', emoji: '🫕' },
      { id: 'foil-small-metals-02', label: 'Metal Lids',        emoji: '🔩' },
      { id: 'foil-small-metals-03', label: 'Bottle Caps',       emoji: '🍾' },
    ],
  },
  // PLASTIC ITEMS
  'understanding-plastic-types': {
    navTitle: 'Understanding Plastic Types', title: 'Understanding Plastic Types', heroEmoji: '🧴',
    heroColor: '#E3F2FD', subtitle: 'Learn the different types of plastic and which can be recycled.',
    returnRoute: '/(tabs)/PlasticItems',
    parts: [
      { id: 'understanding-plastic-types-01', label: 'PET & HDPE Plastics',     emoji: '🧴' },
      { id: 'understanding-plastic-types-02', label: 'Non-Recyclable Plastics',  emoji: '🚫' },
      { id: 'understanding-plastic-types-03', label: 'Soft Plastics & Film',     emoji: '🛍️' },
    ],
  },
  'preparing-plastics-for-recycling': {
    navTitle: 'Preparing Plastics for Recycling', title: 'Preparing Plastics', heroEmoji: '♻️',
    heroColor: '#E3F2FD', subtitle: 'Learn how to prepare plastics correctly before recycling.',
    returnRoute: '/(tabs)/PlasticItems',
    parts: [
      { id: 'preparing-plastics-for-recycling-01', label: 'Rinsing & Cleaning',      emoji: '💧' },
      { id: 'preparing-plastics-for-recycling-02', label: 'Removing Lids & Labels',  emoji: '🪛' },
      { id: 'preparing-plastics-for-recycling-03', label: 'Crushing Bottles',        emoji: '👊' },
    ],
  },
  'plastic-contamination': {
    navTitle: 'Plastic Contamination', title: 'Plastic Contamination', heroEmoji: '⚠️',
    heroColor: '#E3F2FD', subtitle: 'Learn how contamination affects plastic recycling.',
    returnRoute: '/(tabs)/PlasticItems',
    parts: [
      { id: 'plastic-contamination-01', label: 'Food Soiled Plastics',      emoji: '🍔' },
      { id: 'plastic-contamination-02', label: 'Black Plastic Issues',      emoji: '🖤' },
      { id: 'plastic-contamination-03', label: 'Mixed Material Packaging',  emoji: '📦' },
    ],
  },
  // PAPER & CARDBOARD
  'paper-recycling-basics': {
    navTitle: 'Paper Recycling Basics', title: 'Paper Recycling Basics', heroEmoji: '📄',
    heroColor: '#FFF9C4', subtitle: 'Learn the fundamentals of recycling paper correctly.',
    returnRoute: '/(tabs)/PaperCardboard',
    parts: [
      { id: 'paper-recycling-basics-01', label: 'Clean vs. Dirty Paper',   emoji: '📄' },
      { id: 'paper-recycling-basics-02', label: 'Magazines & Newspapers',  emoji: '🗞️' },
      { id: 'paper-recycling-basics-03', label: 'Envelopes & Windows',     emoji: '✉️' },
    ],
  },
  'cardboard-rules': {
    navTitle: 'Cardboard Rules', title: 'Cardboard Rules', heroEmoji: '📦',
    heroColor: '#FFF9C4', subtitle: 'Learn the rules for recycling cardboard.',
    returnRoute: '/(tabs)/PaperCardboard',
    parts: [
      { id: 'cardboard-rules-01', label: 'Greasy Pizza Boxes', emoji: '🍕' },
      { id: 'cardboard-rules-02', label: 'Flattening Boxes',   emoji: '📦' },
      { id: 'cardboard-rules-03', label: 'Removing Tape',      emoji: '📏' },
    ],
  },
  'composite-paper-packaging': {
    navTitle: 'Composite Paper Packaging', title: 'Composite Paper Packaging', heroEmoji: '🧃',
    heroColor: '#FFF9C4', subtitle: 'Learn about multi-layer paper packaging.',
    returnRoute: '/(tabs)/PaperCardboard',
    parts: [
      { id: 'composite-paper-packaging-01', label: 'Juice Cartons',    emoji: '🧃' },
      { id: 'composite-paper-packaging-02', label: 'Laminated Paper',  emoji: '🗂️' },
      { id: 'composite-paper-packaging-03', label: 'Coffee Cups',      emoji: '☕' },
    ],
  },
  // FOOD & ORGANIC WASTE
  'what-belongs-in-food-waste': {
    navTitle: 'What Belongs in Food Waste', title: 'What Belongs in Food Waste', heroEmoji: '🥦',
    heroColor: '#D4EDDA', subtitle: 'Learn what items belong in your food waste bin.',
    returnRoute: '/(tabs)/FoodOrganicWaste',
    parts: [
      { id: 'what-belongs-in-food-waste-01', label: 'Fruit & Veg Scraps',        emoji: '🥦' },
      { id: 'what-belongs-in-food-waste-02', label: 'Cooked Food',               emoji: '🍲' },
      { id: 'what-belongs-in-food-waste-03', label: 'Tea Bags & Coffee Grounds', emoji: '☕' },
    ],
  },
  'why-food-waste-matters': {
    navTitle: 'Why Food Waste Matters', title: 'Why Food Waste Matters', heroEmoji: '🌍',
    heroColor: '#D4EDDA', subtitle: 'Learn the environmental impact of food waste.',
    returnRoute: '/(tabs)/FoodOrganicWaste',
    parts: [
      { id: 'why-food-waste-matters-01', label: 'Methane & Landfill',     emoji: '🌡️' },
      { id: 'why-food-waste-matters-02', label: 'Composting Process',     emoji: '🌱' },
      { id: 'why-food-waste-matters-03', label: 'Environmental Benefits', emoji: '🌍' },
    ],
  },
  'avoiding-food-waste-contamination': {
    navTitle: 'Avoiding Food Waste Contamination', title: 'Avoiding Contamination', heroEmoji: '🚫',
    heroColor: '#D4EDDA', subtitle: 'Learn how to prevent contamination in your food waste bin.',
    returnRoute: '/(tabs)/FoodOrganicWaste',
    parts: [
      { id: 'avoiding-food-waste-contamination-01', label: 'Keeping Food Out of Recycling', emoji: '♻️' },
      { id: 'avoiding-food-waste-contamination-02', label: 'Bagging Food Waste',            emoji: '🛍️' },
      { id: 'avoiding-food-waste-contamination-03', label: 'Common Mistakes',               emoji: '⚠️' },
    ],
  },
  // COMMON CONTAMINANTS
  'coffee-cups-takeaway-packaging': {
    navTitle: 'Coffee Cups & Takeaway Packaging', title: 'Coffee Cups & Takeaway', heroEmoji: '☕',
    heroColor: '#FDECEA', subtitle: 'Learn why takeaway packaging is hard to recycle.',
    returnRoute: '/(tabs)/CommonContaminants',
    parts: [
      { id: 'coffee-cups-takeaway-packaging-01', label: "Why Coffee Cups Aren't Recyclable", emoji: '☕' },
      { id: 'coffee-cups-takeaway-packaging-02', label: 'Plastic-Lined Packaging',           emoji: '📦' },
      { id: 'coffee-cups-takeaway-packaging-03', label: 'Correct Disposal',                  emoji: '🗑️' },
    ],
  },
  'greasy-food-soiled-items': {
    navTitle: 'Greasy & Food-Soiled Items', title: 'Greasy & Food-Soiled Items', heroEmoji: '🍕',
    heroColor: '#FDECEA', subtitle: 'Learn how food residue contaminates recycling.',
    returnRoute: '/(tabs)/CommonContaminants',
    parts: [
      { id: 'greasy-food-soiled-items-01', label: 'Pizza Boxes',   emoji: '🍕' },
      { id: 'greasy-food-soiled-items-02', label: 'Greasy Paper',  emoji: '🧻' },
      { id: 'greasy-food-soiled-items-03', label: 'Food Residue',  emoji: '🍔' },
    ],
  },
  'problem-plastics': {
    navTitle: 'Problem Plastics', title: 'Problem Plastics', heroEmoji: '🛍️',
    heroColor: '#FDECEA', subtitle: 'Learn which plastics cause recycling problems.',
    returnRoute: '/(tabs)/CommonContaminants',
    parts: [
      { id: 'problem-plastics-01', label: 'Plastic Bags',  emoji: '🛍️' },
      { id: 'problem-plastics-02', label: 'Film & Wrap',   emoji: '🎁' },
      { id: 'problem-plastics-03', label: 'Black Plastic', emoji: '🖤' },
    ],
  },
  // LOCAL RULES
  'bin-colours-meanings': {
    navTitle: 'Bin Colours & Meanings', title: 'Bin Colours & Meanings', heroEmoji: '🗑️',
    heroColor: '#E8EAF6', subtitle: 'Learn what each bin colour means in your area.',
    returnRoute: '/(tabs)/LocalRules',
    parts: [
      { id: 'bin-colours-meanings-01', label: 'Recycling Bin',     emoji: '♻️' },
      { id: 'bin-colours-meanings-02', label: 'General Waste Bin', emoji: '🗑️' },
      { id: 'bin-colours-meanings-03', label: 'Food Waste Bin',    emoji: '🥦' },
    ],
  },
  'accepted-items-by-postcode': {
    navTitle: 'Accepted Items by Postcode', title: 'Accepted Items by Postcode', heroEmoji: '📮',
    heroColor: '#E8EAF6', subtitle: 'Learn what your local area accepts for recycling.',
    returnRoute: '/(tabs)/LocalRules',
    parts: [
      { id: 'accepted-items-by-postcode-01', label: 'What Your Area Accepts', emoji: '✅' },
      { id: 'accepted-items-by-postcode-02', label: 'What Your Area Rejects', emoji: '❌' },
      { id: 'accepted-items-by-postcode-03', label: 'Seasonal Changes',       emoji: '📅' },
    ],
  },
  'collection-service-updates': {
    navTitle: 'Collection & Service Updates', title: 'Collection & Service Updates', heroEmoji: '🚛',
    heroColor: '#E8EAF6', subtitle: 'Stay up to date with your local collection service.',
    returnRoute: '/(tabs)/LocalRules',
    parts: [
      { id: 'collection-service-updates-01', label: 'Collection Days',    emoji: '📅' },
      { id: 'collection-service-updates-02', label: 'Missed Collections', emoji: '🚛' },
      { id: 'collection-service-updates-03', label: 'Service Disruptions',emoji: '⚠️' },
    ],
  },
};

type Tab = 'lesson' | 'quiz';

export default function ChapterDetail() {
  const { chapter } = useLocalSearchParams<{ chapter: string }>();
  const cfg = CHAPTERS[chapter ?? ''];

  const [activeTab, setActiveTab]     = useState<Tab>('lesson');
  const [completedL, setCompletedL]   = useState<string[]>([]);
  const [completedQ, setCompletedQ]   = useState<string[]>([]);
  const [scores, setScores]           = useState<Record<string, number>>({});
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    getUserProgress().then(p => {
      if (p) {
        setCompletedL(p.completedLessons);
        setCompletedQ(p.completedQuizzes);
        setScores(p.quizScores);
      }
      setLoading(false);
    });
  }, []);

  if (!cfg) {
    return (
      <View style={styles.center}>
        <Text>Chapter not found.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>Go back</Text></TouchableOpacity>
      </View>
    );
  }

  const isLesson = activeTab === 'lesson';
  const allLessonsDone = cfg.parts.every(p => completedL.includes(p.id));
  const allQuizzesDone = cfg.parts.every(p => completedQ.includes(p.id));
  const returnParam = encodeURIComponent(`/(tabs)/ChapterDetail?chapter=${chapter}`);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.push(cfg.returnRoute as any)} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{cfg.navTitle}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={[styles.heroBox, { backgroundColor: cfg.heroColor }]}>
          <Text style={styles.heroEmoji}>{cfg.heroEmoji}</Text>
          {(allLessonsDone || allQuizzesDone) && (
            <View style={styles.heroBadge}>
              {allLessonsDone && allQuizzesDone ? (
                <><Feather name="award" size={14} color="#606C38" /><Text style={styles.heroBadgeText}> Chapter Complete!</Text></>
              ) : allLessonsDone ? (
                <><Feather name="book-open" size={14} color="#606C38" /><Text style={styles.heroBadgeText}> Lessons Done</Text></>
              ) : (
                <><Feather name="help-circle" size={14} color="#606C38" /><Text style={styles.heroBadgeText}> Quizzes Done</Text></>
              )}
            </View>
          )}
        </View>

        {/* Title */}
        <View style={styles.titleBox}>
          <Text style={styles.title}>{cfg.title}</Text>
          <Text style={styles.subtitle}>{cfg.subtitle}</Text>
        </View>

        {/* Progress overview */}
        {!loading && (
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNum}>{cfg.parts.filter(p => completedL.includes(p.id)).length}/{cfg.parts.length}</Text>
              <Text style={styles.progressLbl}>Lessons</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <Text style={styles.progressNum}>{cfg.parts.filter(p => completedQ.includes(p.id)).length}/{cfg.parts.length}</Text>
              <Text style={styles.progressLbl}>Quizzes</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <Text style={styles.progressNum}>
                {Math.round(
                  (cfg.parts.filter(p => completedL.includes(p.id)).length +
                   cfg.parts.filter(p => completedQ.includes(p.id)).length) /
                  (cfg.parts.length * 2) * 100
                )}%
              </Text>
              <Text style={styles.progressLbl}>Done</Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tabBtn, isLesson && styles.tabBtnActive]} onPress={() => setActiveTab('lesson')}>
            <Feather name="book-open" size={15} color={isLesson ? '#fff' : '#606C38'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabLabel, isLesson && styles.tabLabelActive]}>Lesson</Text>
            {allLessonsDone && <View style={styles.tabDoneTag}><Feather name="check" size={11} color={isLesson ? '#fff' : '#606C38'} /></View>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, !isLesson && styles.tabBtnActive]} onPress={() => setActiveTab('quiz')}>
            <Feather name="help-circle" size={15} color={!isLesson ? '#fff' : '#606C38'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabLabel, !isLesson && styles.tabLabelActive]}>Quiz</Text>
            {allQuizzesDone && <View style={styles.tabDoneTag}><Feather name="check" size={11} color={!isLesson ? '#fff' : '#606C38'} /></View>}
          </TouchableOpacity>
        </View>

        {/* Part list */}
        <View style={styles.partList}>
          {cfg.parts.map((part, idx) => {
            const isDone  = isLesson ? completedL.includes(part.id) : completedQ.includes(part.id);
            const score   = scores[part.id];
            const route   = isLesson
              ? `/(tabs)/LessonPlayer?id=${part.id}&returnTo=${returnParam}`
              : `/(tabs)/QuizPlayer?id=${part.id}&returnTo=${returnParam}`;

            return (
              <TouchableOpacity
                key={part.id}
                style={[styles.partRow, isDone && styles.partRowDone]}
                activeOpacity={0.75}
                onPress={() => router.push(route as any)}
              >
                <View style={[styles.partThumb, isDone && styles.partThumbDone]}>
                  {isDone ? <Feather name="check" size={20} color="#fff" /> : <Text style={{ fontSize: 22 }}>{part.emoji}</Text>}
                </View>
                <View style={styles.partInfo}>
                  <Text style={styles.partNum}>Part 0{idx + 1}</Text>
                  <Text style={styles.partLabel}>{part.label}</Text>
                  {!isLesson && score !== undefined && (
                    <Text style={styles.partScore}>Best: {score}%</Text>
                  )}
                </View>
                <View style={[styles.partArrow, isDone && styles.partArrowDone]}>
                  {isDone
                    ? <Feather name="refresh-cw" size={15} color="#606C38" />
                    : <Feather name="chevron-right" size={18} color="#606C38" />
                  }
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startBtn, isLesson ? styles.startBtnLesson : styles.startBtnQuiz]}
          onPress={() => router.push(
            isLesson
              ? `/(tabs)/LessonPlayer?id=${cfg.parts[0].id}&returnTo=${returnParam}` as any
              : `/(tabs)/QuizPlayer?id=${cfg.parts[0].id}&returnTo=${returnParam}` as any
          )}
        >
          <Text style={[styles.startBtnText, !isLesson && styles.startBtnTextQuiz]}>
            {isLesson ? (allLessonsDone ? '🔁 Revisit Lessons' : '▶ Start Lesson') : (allQuizzesDone ? '🔁 Retry Quizzes' : '🎯 Start Quiz')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  link:           { color: '#606C38', marginTop: 8, fontWeight: '600' },
  nav:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  backBtn:        { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center' },
  navTitle:       { fontSize: 17, fontWeight: '700', color: '#333', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  heroBox:        { marginHorizontal: 20, marginTop: 4, borderRadius: 20, height: 180, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  heroEmoji:      { fontSize: 72 },
  heroBadge:      { position: 'absolute', bottom: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  heroBadgeText:  { fontSize: 12, fontWeight: '700', color: '#606C38' },
  titleBox:       { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  title:          { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  subtitle:       { fontSize: 13, color: '#888', lineHeight: 19 },
  progressRow:    { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: '#F8F8F8', borderRadius: 16, paddingVertical: 14 },
  progressItem:   { flex: 1, alignItems: 'center' },
  progressNum:    { fontSize: 20, fontWeight: '800', color: '#283618' },
  progressLbl:    { fontSize: 11, color: '#888', fontWeight: '600', marginTop: 2 },
  progressDivider:{ width: 1, backgroundColor: '#E0E0E0' },
  tabRow:         { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: '#F2F2F2', borderRadius: 12, padding: 4, gap: 4 },
  tabBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  tabBtnActive:   { backgroundColor: '#606C38' },
  tabLabel:       { fontSize: 14, fontWeight: '600', color: '#606C38' },
  tabLabelActive: { color: '#fff' },
  tabDoneTag:     { marginLeft: 4 },
  partList:       { paddingHorizontal: 20, marginTop: 14 },
  partRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  partRowDone:    { opacity: 0.85 },
  partThumb:      { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E8F0DC', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  partThumbDone:  { backgroundColor: '#606C38' },
  partInfo:       { flex: 1 },
  partNum:        { fontSize: 11, color: '#999', fontWeight: '600', marginBottom: 2 },
  partLabel:      { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  partScore:      { fontSize: 12, color: '#606C38', fontWeight: '700', marginTop: 2 },
  partArrow:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center' },
  partArrowDone:  { backgroundColor: '#E8F0DC' },
  footer:         { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 34, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  startBtn:       { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  startBtnLesson: { backgroundColor: '#606C38' },
  startBtnQuiz:   { backgroundColor: '#3D2B6B' },
  startBtnText:   { color: '#fff', fontSize: 17, fontWeight: '700' },
  startBtnTextQuiz:{ color: '#fff' },
});