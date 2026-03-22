import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ALL_CHALLENGES, Challenge, completeChallenge } from '../../lib/challenges';
import { auth, db } from '../../lib/firebase';

export default function ChallengeScreen() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null); // id of challenge being processed

  // 🔐 Real-time listener — keeps completedChallenges in sync with Firestore
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) {
        setCompletedIds(snap.data().completedChallenges ?? []);
      }
    });
    return unsub;
  }, []);

  async function handleComplete(challenge: Challenge) {
    if (completedIds.includes(challenge.id)) return;
    setLoading(challenge.id);
    try {
      const success = await completeChallenge(challenge, completedIds);
      if (success) {
        Alert.alert('🎉 Challenge Complete!', `You earned ${challenge.points} points!`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(null);
    }
  }

  const daily = ALL_CHALLENGES.filter(c => c.type === 'daily');
  const weekly = ALL_CHALLENGES.filter(c => c.type === 'weekly');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Challenges</Text>
          <View style={styles.headerSubtitle}>
            <Text style={styles.subtitleText}>Complete challenges to get points </Text>
            <Text style={styles.trophy}>🏆</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Challenges</Text>
          {daily.map(c => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              completed={completedIds.includes(c.id)}
              processing={loading === c.id}
              onPress={() => handleComplete(c)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Challenges</Text>
          {weekly.map(c => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              completed={completedIds.includes(c.id)}
              processing={loading === c.id}
              onPress={() => handleComplete(c)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ChallengeCard({
  challenge, completed, processing, onPress,
}: {
  challenge: Challenge;
  completed: boolean;
  processing: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.challengeCard, completed && styles.completedCard]}
      activeOpacity={completed ? 1 : 0.8}
      onPress={completed ? undefined : onPress}
      disabled={processing}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.cardIcon}>{challenge.icon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{challenge.title}</Text>
          <Text style={styles.cardPoints}>
            {completed ? '✅ Completed' : `Earn ${challenge.points} points`}
          </Text>
        </View>
      </View>
      {!completed && (
        <Ionicons
          name={processing ? 'ellipsis-horizontal' : 'chevron-forward'}
          size={24}
          color="#fff"
        />
      )}
    </TouchableOpacity>
  );
}

function Sparkles() {
  return (
    <Svg width={211} height={232} viewBox="0 0 211 232" style={styles.sparkles}>
      <Path d="M101 104C101 104 103.207 124.6 111.804 133.196C120.4 141.793 141 144 141 144C141 144 120.4 146.207 111.804 154.804C103.207 163.4 101 184 101 184C101 184 98.793 163.4 90.1964 154.804C81.5997 146.207 61 144 61 144C61 144 81.5997 141.793 90.1964 133.196C98.793 124.6 101 104 101 104Z" fill="white" fillOpacity={0.35} />
      <Path d="M171 152C171 152 173.207 172.6 181.804 181.196C190.4 189.793 211 192 211 192C211 192 190.4 194.207 181.804 202.804C173.207 211.4 171 232 171 232C171 232 168.793 211.4 160.196 202.804C151.6 194.207 131 192 131 192C131 192 151.6 189.793 160.196 181.196C168.793 172.6 171 152 171 152Z" fill="white" fillOpacity={0.2} />
      <Path d="M161.5 0C161.5 0 163.183 30.3846 169.738 43.0646C176.293 55.7447 192 59 192 59C192 59 176.293 62.2553 169.738 74.9354C163.183 87.6154 161.5 118 161.5 118C161.5 118 159.817 87.6154 153.262 74.9354C146.707 62.2553 131 59 131 59C131 59 146.707 55.7447 153.262 43.0646C159.817 30.3846 161.5 0 161.5 0Z" fill="white" fillOpacity={0.2} />
      <Path d="M30.5 39C30.5 39 32.1828 54.4498 38.7378 60.8973C45.2927 67.3447 61 69 61 69C61 69 45.2927 70.6553 38.7378 77.1027C32.1828 83.5502 30.5 99 30.5 99C30.5 99 28.8172 83.5502 22.2622 77.1027C15.7073 70.6553 0 69 0 69C0 69 15.7073 67.3447 22.2622 60.8973C28.8172 54.4498 30.5 39 30.5 39Z" fill="white" fillOpacity={0.2} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#606C38' },
  header: { backgroundColor: '#606C38', paddingTop: 50, paddingBottom: 24, paddingHorizontal: 16, position: 'relative', overflow: 'hidden' },
  sparkles: { position: 'absolute', top: 0, right: 0, opacity: 0.8 },
  headerContent: { zIndex: 2, marginBottom: 16 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8 },
  headerSubtitle: { flexDirection: 'row', alignItems: 'center' },
  subtitleText: { fontSize: 14, color: '#D4C4B0', fontWeight: '500' },
  trophy: { fontSize: 18, marginLeft: 4 },
  headerIcons: { position: 'absolute', top: 50, right: 16, flexDirection: 'row', gap: 12, zIndex: 2 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, backgroundColor: '#F5F5F5', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 20, paddingHorizontal: 16 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  challengeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#606C38', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 12 },
  completedCard: { backgroundColor: '#9AA084', opacity: 0.85 },
  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  cardIcon: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 4 },
  cardPoints: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
});
