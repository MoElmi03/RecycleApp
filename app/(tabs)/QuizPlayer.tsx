import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { checkChallengesAfterProgress, markQuizComplete } from '../../lib/progress';
import { getQuiz } from '../../lib/quizData';

const { width } = Dimensions.get('window');
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPlayer() {
  const { id, returnTo } = useLocalSearchParams<{ id: string; returnTo: string }>();
  const quiz = getQuiz(id ?? '');

  const [qIndex, setQIndex]         = useState(0);
  const [selected, setSelected]     = useState<number | null>(null);
  const [answered, setAnswered]     = useState(false);
  const [answers, setAnswers]       = useState<(number | null)[]>([]);
  const [finished, setFinished]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [ptsEarned, setPtsEarned]   = useState(0);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [newChallenges, setNewChallenges] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardAnim     = useRef(new Animated.Value(1)).current;
  const shakeAnim    = useRef(new Animated.Value(0)).current;
  const rewardAnim   = useRef(new Animated.Value(0)).current;
  const rewardScale  = useRef(new Animated.Value(0.6)).current;
  const optionAnims  = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current;

  if (!quiz) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Quiz not found.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>Go back</Text></TouchableOpacity>
      </View>
    );
  }

  const total   = quiz.questions.length;
  const q       = quiz.questions[qIndex];
  const isLast  = qIndex === total - 1;

  // Stagger option entrance
  useEffect(() => {
    optionAnims.forEach(a => a.setValue(0));
    optionAnims.forEach((a, i) => {
      Animated.timing(a, { toValue: 1, duration: 250, delay: i * 60, useNativeDriver: true }).start();
    });
  }, [qIndex]);

  // Progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (qIndex + (answered ? 1 : 0)) / total,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [qIndex, answered]);

  function shakeCard() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    setShowExplanation(false);
    setAnswers(prev => {
      const next = [...prev];
      next[qIndex] = idx;
      return next;
    });
    if (idx !== q.correct) shakeCard();
  }

  function animateCard(cb: () => void) {
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 0.95, duration: 120, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    setTimeout(cb, 120);
  }

  function goNext() {
    if (qIndex < total - 1) {
      animateCard(() => {
        setQIndex(i => i + 1);
        setSelected(null);
        setAnswered(false);
        setShowExplanation(false);
      });
    }
  }

  function goPrev() {
    if (qIndex > 0) {
      animateCard(() => {
        setQIndex(i => i - 1);
        setSelected(answers[qIndex - 1] ?? null);
        setAnswered(answers[qIndex - 1] !== undefined);
        setShowExplanation(false);
      });
    }
  }

  async function handleFinish() {
    if (!quiz) return;
    setSaving(true);
    const correct = answers.filter((a, i) => a === quiz.questions[i].correct).length;
    const score   = Math.round((correct / total) * 100);
    const { pointsEarned, alreadyDone: done } = await markQuizComplete(id!, score, correct, total);
    const newC = await checkChallengesAfterProgress();
    setPtsEarned(pointsEarned);
    setAlreadyDone(done);
    setNewChallenges(newC);
    setFinished(true);
    setSaving(false);
    Animated.parallel([
      Animated.spring(rewardAnim,  { toValue: 1, useNativeDriver: true }),
      Animated.spring(rewardScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }

  function handleBack() {
    if (returnTo) router.push(returnTo as any);
    else router.back();
  }

  // ── RESULTS SCREEN ───────────────────────────────────────────────────────
  if (finished) {
    const correct = answers.filter((a, i) => a === quiz.questions[i].correct).length;
    const pct     = Math.round((correct / total) * 100);
    const isPerfect = pct === 100;
    const emoji   = pct === 100 ? '🏆' : pct >= 80 ? '⭐' : pct >= 60 ? '👍' : '📚';
    const msg     = pct === 100 ? 'Perfect Score!' : pct >= 80 ? 'Great work!' : pct >= 60 ? 'Good effort!' : 'Keep practising!';

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.resultsBg}>
          <Animated.View style={[styles.resultsCard, { opacity: rewardAnim, transform: [{ scale: rewardScale }] }]}>
            <Text style={styles.resultsEmoji}>{emoji}</Text>
            <Text style={styles.resultsTitle}>{msg}</Text>
            <Text style={styles.resultsSub}>{quiz.partTitle}</Text>

            <View style={styles.scoreBig}>
              <Text style={styles.scorePct}>{pct}%</Text>
              <Text style={styles.scoreDetail}>{correct} / {total} correct</Text>
            </View>

            {/* Score bar */}
            <View style={styles.scoreBarTrack}>
              <Animated.View style={[styles.scoreBarFill, {
                width: `${pct}%`,
                backgroundColor: pct >= 80 ? '#606C38' : pct >= 60 ? '#DDA15E' : '#E76F51',
              }]} />
            </View>

            {alreadyDone && !isPerfect ? (
              <View style={styles.alreadyBadge}>
                <Feather name="info" size={16} color="#606C38" />
                <Text style={styles.alreadyText}>Already completed — points earned on first attempt</Text>
              </View>
            ) : ptsEarned > 0 ? (
              <View style={styles.ptsBox}>
                <Text style={styles.ptsLabel}>Points Earned</Text>
                <Text style={styles.ptsValue}>+{ptsEarned} pts</Text>
                {isPerfect && <Text style={styles.perfectTag}>🎯 Perfect score bonus!</Text>}
              </View>
            ) : null}

            {newChallenges.length > 0 && (
              <View style={styles.challengeBanner}>
                <Feather name="zap" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.challengeBannerText}>🏆 Challenge milestone unlocked!</Text>
              </View>
            )}

            <View style={styles.resultsActions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={handleBack}>
                <Text style={styles.btnSecondaryText}>Chapter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnRetry} onPress={() => {
                setQIndex(0); setSelected(null); setAnswered(false);
                setAnswers([]); setFinished(false); setShowExplanation(false);
                rewardAnim.setValue(0); rewardScale.setValue(0.6);
              }}>
                <Text style={styles.btnRetryText}>Retry Quiz</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }

  // ── QUIZ QUESTION SCREEN ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.qBadge}>
          <Text style={styles.qBadgeText}>Question {qIndex + 1} of {total}</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, {
          width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }]} />
      </View>

      <ScrollView contentContainerStyle={styles.quizScroll} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }, { scale: cardAnim }] }}>
          <Text style={styles.questionText}>{q.question}</Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsList}>
          {q.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect  = idx === q.correct;
            let bgColor = 'rgba(255,255,255,0.12)';
            let borderColor = 'transparent';
            let textColor = '#fff';
            let labelBg = 'rgba(255,255,255,0.2)';

            if (answered) {
              if (isCorrect) {
                bgColor = '#4CAF50'; borderColor = '#388E3C'; labelBg = 'rgba(255,255,255,0.3)';
              } else if (isSelected) {
                bgColor = '#EF5350'; borderColor = '#C62828'; labelBg = 'rgba(255,255,255,0.3)';
              }
            } else if (isSelected) {
              bgColor = 'rgba(254,250,224,0.2)'; borderColor = '#FEFAE0';
            }

            return (
              <Animated.View key={idx} style={{
                opacity: optionAnims[idx],
                transform: [{ translateY: optionAnims[idx].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              }}>
                <TouchableOpacity
                  style={[styles.optionBtn, { backgroundColor: bgColor, borderColor, borderWidth: 1.5 }]}
                  onPress={() => handleSelect(idx)}
                  activeOpacity={answered ? 1 : 0.75}
                >
                  <View style={[styles.optionLabel, { backgroundColor: labelBg }]}>
                    {answered && isCorrect ? (
                      <Feather name="check" size={14} color="#fff" />
                    ) : answered && isSelected && !isCorrect ? (
                      <Feather name="x" size={14} color="#fff" />
                    ) : (
                      <Text style={[styles.optionLabelText, { color: textColor }]}>{OPTION_LABELS[idx]}</Text>
                    )}
                  </View>
                  <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Explanation */}
        {answered && (
          <View>
            <TouchableOpacity
              style={styles.explainToggle}
              onPress={() => setShowExplanation(v => !v)}
            >
              <Feather name={showExplanation ? 'chevron-up' : 'chevron-down'} size={16} color="#FEFAE0" />
              <Text style={styles.explainToggleText}>{showExplanation ? 'Hide explanation' : 'Show explanation'}</Text>
            </TouchableOpacity>

            {showExplanation && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationText}>{q.explanation}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, qIndex === 0 && styles.navBtnDisabled]}
          onPress={goPrev}
          disabled={qIndex === 0}
        >
          <Feather name="chevron-left" size={22} color={qIndex === 0 ? 'rgba(255,255,255,0.3)' : '#FEFAE0'} />
          <Text style={[styles.navBtnText, qIndex === 0 && styles.navBtnTextDisabled]}>Back</Text>
        </TouchableOpacity>

        {answered && (
          isLast ? (
            <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} disabled={saving}>
              <Text style={styles.finishBtnText}>{saving ? 'Saving…' : '🏁 Finish Quiz'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Next</Text>
              <Feather name="chevron-right" size={22} color="#283618" />
            </TouchableOpacity>
          )
        )}

        {!answered && <View style={{ width: 80 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#3D2B6B' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText:     { fontSize: 16, color: '#333', marginBottom: 12 },
  link:          { color: '#606C38', fontSize: 15, fontWeight: '600' },

  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  backBtn:       { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  qBadge:        { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  qBadgeText:    { color: '#fff', fontWeight: '700', fontSize: 14 },

  progressTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 20, borderRadius: 3 },
  progressFill:  { height: 5, backgroundColor: '#A78BFA', borderRadius: 3 },

  quizScroll:    { padding: 24, paddingBottom: 20 },
  questionText:  { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 36, marginVertical: 24 },

  optionsList:   { gap: 12 },
  optionBtn:     { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, gap: 14 },
  optionLabel:   { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  optionLabelText:{ fontSize: 14, fontWeight: '700' },
  optionText:    { flex: 1, fontSize: 16, fontWeight: '600', lineHeight: 22 },

  explainToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, gap: 6 },
  explainToggleText: { color: '#FEFAE0', fontWeight: '600', fontSize: 13 },
  explanationBox: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 16, marginTop: 10 },
  explanationText:{ color: '#FEFAE0', fontSize: 14, lineHeight: 22 },

  navRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 34, paddingTop: 8, backgroundColor: '#3D2B6B' },
  navBtn:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)' },
  navBtnDisabled:{ opacity: 0.4 },
  navBtnText:    { fontSize: 15, color: '#FEFAE0', fontWeight: '600', marginLeft: 4 },
  navBtnTextDisabled: { opacity: 0.4 },
  nextBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEFAE0', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 },
  nextBtnText:   { fontSize: 16, color: '#3D2B6B', fontWeight: '800', marginRight: 6 },
  finishBtn:     { backgroundColor: '#4CAF50', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
  finishBtnText: { fontSize: 15, color: '#fff', fontWeight: '800' },

  // Results
  resultsBg:     { flex: 1, backgroundColor: '#3D2B6B', justifyContent: 'center', alignItems: 'center', padding: 24 },
  resultsCard:   { backgroundColor: '#fff', borderRadius: 28, padding: 32, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, elevation: 8 },
  resultsEmoji:  { fontSize: 72, marginBottom: 8 },
  resultsTitle:  { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  resultsSub:    { fontSize: 14, color: '#888', marginBottom: 20 },
  scoreBig:      { alignItems: 'center', marginBottom: 12 },
  scorePct:      { fontSize: 52, fontWeight: '900', color: '#3D2B6B' },
  scoreDetail:   { fontSize: 14, color: '#888', marginTop: 2 },
  scoreBarTrack: { height: 10, backgroundColor: '#F0F0F0', borderRadius: 5, width: '100%', marginBottom: 20, overflow: 'hidden' },
  scoreBarFill:  { height: 10, borderRadius: 5 },
  alreadyBadge:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F0DC', borderRadius: 12, padding: 12, marginBottom: 16, gap: 8, width: '100%' },
  alreadyText:   { flex: 1, fontSize: 12, color: '#606C38', fontWeight: '600' },
  ptsBox:        { backgroundColor: '#EDE9FE', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center', marginBottom: 16, width: '100%' },
  ptsLabel:      { fontSize: 12, color: '#3D2B6B', fontWeight: '600', marginBottom: 2 },
  ptsValue:      { fontSize: 32, fontWeight: '900', color: '#3D2B6B' },
  perfectTag:    { fontSize: 12, color: '#606C38', fontWeight: '700', marginTop: 4 },
  challengeBanner:{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#606C38', borderRadius: 12, padding: 12, marginBottom: 16, width: '100%', justifyContent: 'center' },
  challengeBannerText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  resultsActions:{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  btnSecondary:  { flex: 1, borderWidth: 2, borderColor: '#3D2B6B', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnSecondaryText: { color: '#3D2B6B', fontWeight: '700', fontSize: 14 },
  btnRetry:      { flex: 1, backgroundColor: '#3D2B6B', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnRetryText:  { color: '#fff', fontWeight: '700', fontSize: 14 },
});