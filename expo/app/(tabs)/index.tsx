import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { useWedding } from "@/context/WeddingContext";
import { Heart, Calendar, ArrowRight, Settings } from "lucide-react-native";
import { useRouter } from "expo-router";


export default function DashboardScreen() {
  const { weddingState, tasks, guests, totalBudget } = useWedding();
  const router = useRouter();

  const daysLeft = React.useMemo(() => {
    if (!weddingState.weddingDate) return 0;
    const today = new Date();
    const diffTime = Math.abs(weddingState.weddingDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [weddingState.weddingDate]);

  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const confirmedGuests = guests.filter((g) => g.status === "confirmed").length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header / Countdown Section */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[Colors.primary, "#A3B18A"]}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <SafeAreaView edges={['top']} style={styles.safeArea}>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => router.push('/settings' as any)}
              >
                <Settings size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.namesText}>
                  {weddingState.partnerName2} & {weddingState.partnerName1}
                </Text>
                <View style={styles.countdownContainer}>
                  <View style={styles.countdownItem}>
                    <Text style={styles.countdownNumber}>{daysLeft}</Text>
                    <Text style={styles.countdownLabel}>Zile Rămase</Text>
                  </View>
                </View>
                <Text style={styles.dateText}>
                  {weddingState.weddingDate?.toLocaleDateString("ro-RO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
          <View style={styles.curveMask} />
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: "#E3F2FD" }]}>
              <Calendar size={24} color="#1E88E5" />
            </View>
            <Text style={styles.statValue}>{pendingTasks}</Text>
            <Text style={styles.statLabel}>Sarcini Active</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: "#FCE4EC" }]}>
              <Heart size={24} color="#D81B60" />
            </View>
            <Text style={styles.statValue}>{confirmedGuests}</Text>
            <Text style={styles.statLabel}>Invitați Confirmați</Text>
          </View>
        </View>

        {/* Quick Actions / Highlights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sarcini Prioritare</Text>
            <TouchableOpacity onPress={() => router.push('/tasks' as any)}>
              <Text style={styles.seeAllText}>Vezi tot</Text>
            </TouchableOpacity>
          </View>
          
          {tasks.filter(t => !t.completed).slice(0, 3).map((task) => (
            <View key={task.id} style={styles.taskRow}>
              <View style={styles.taskIndicator} />
              <Text style={styles.taskTitle}>{task.title}</Text>
              <ArrowRight size={16} color={Colors.textSecondary} />
            </View>
          ))}
          
          {tasks.filter(t => !t.completed).length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Toate sarcinile sunt complete! 🎉</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buget Estimativ</Text>
          <View style={styles.budgetCard}>
            <Text style={styles.budgetLabel}>Total Cheltuieli</Text>
            <Text style={styles.budgetAmount}>{totalBudget.toLocaleString()} RON</Text>
            <View style={styles.budgetBarBg}>
              <View style={[styles.budgetBarFill, { width: '40%' }]} /> 
              {/* Mock percentage for now */}
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  safeArea: {
    width: '100%',
  },
  settingsButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  heroGradient: {
    paddingTop: 20,
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  namesText: {
    fontSize: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#FFF',
    marginBottom: 20,
    fontWeight: '600',
  },
  countdownContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  countdownItem: {
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFF',
    lineHeight: 48,
  },
  countdownLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  curveMask: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginTop: -40, // Overlap with header
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  taskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
    marginRight: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  budgetCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  budgetLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  budgetBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
});
