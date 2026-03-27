import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useWedding } from "@/context/WeddingContext";
import { Users, UserCheck, UserX, Clock, Baby, Utensils, Heart, TrendingUp, Mail, MailCheck } from "lucide-react-native";

export default function StatisticsScreen() {
  const { guests } = useWedding();
  const router = useRouter();

  const totalInvitations = guests.length;
  
  const confirmedGuests = guests.filter(g => g.status === 'confirmed').length;
  const pendingGuests = guests.filter(g => g.status === 'pending').length;
  const declinedGuests = guests.filter(g => g.status === 'declined').length;
  
  const totalPeople = guests.reduce((sum, g) => sum + g.numberOfPeople + g.numberOfChildren, 0);
  const confirmedPeople = guests
    .filter(g => g.status === 'confirmed')
    .reduce((sum, g) => sum + g.confirmedPeople + g.confirmedChildren, 0);
  
  const totalAdults = guests.reduce((sum, g) => sum + g.numberOfPeople, 0);
  const confirmedAdults = guests
    .filter(g => g.status === 'confirmed')
    .reduce((sum, g) => sum + g.confirmedPeople, 0);
  
  const totalChildren = guests.reduce((sum, g) => sum + g.numberOfChildren, 0);
  const confirmedChildren = guests
    .filter(g => g.status === 'confirmed')
    .reduce((sum, g) => sum + g.confirmedChildren, 0);
  
  const specialMenuCount = guests.filter(g => g.specialMenuNotes.length > 0).length;
  const confirmedSpecialMenuCount = guests.filter(g => g.status === 'confirmed' && g.specialMenuNotes.length > 0).length;
  
  const groomSideTotal = guests.filter(g => g.side === 'groom').length;
  const groomSideConfirmed = guests.filter(g => g.side === 'groom' && g.status === 'confirmed').length;
  const groomSidePeople = guests
    .filter(g => g.side === 'groom' && g.status === 'confirmed')
    .reduce((sum, g) => sum + g.confirmedPeople + g.confirmedChildren, 0);
  
  const brideSideTotal = guests.filter(g => g.side === 'bride').length;
  const brideSideConfirmed = guests.filter(g => g.side === 'bride' && g.status === 'confirmed').length;
  const brideSidePeople = guests
    .filter(g => g.side === 'bride' && g.status === 'confirmed')
    .reduce((sum, g) => sum + g.confirmedPeople + g.confirmedChildren, 0);
  
  const invitationsSent = guests.filter(g => g.invitationSent).length;
  const invitationsNotSent = guests.filter(g => !g.invitationSent).length;
  
  const confirmationRate = totalInvitations > 0 
    ? Math.round((confirmedGuests / totalInvitations) * 100) 
    : 0;
  
  const peopleConfirmationRate = totalPeople > 0 
    ? Math.round((confirmedPeople / totalPeople) * 100) 
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Statistici Invitați",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Prezentare Generală</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{totalInvitations}</Text>
              <Text style={styles.overviewLabel}>Total Invitații</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{totalPeople}</Text>
              <Text style={styles.overviewLabel}>Total Persoane</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Confirmări</Text>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/statistics-detail' as any, params: { type: 'confirmed' } })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#DCFCE7' }]}>
                <UserCheck size={20} color={Colors.success} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Confirmați</Text>
                <Text style={styles.cardSubtitle}>{confirmationRate}% din total</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{confirmedGuests} invitații</Text>
            <Text style={styles.cardDetail}>{confirmedPeople} persoane ({confirmedAdults} adulți + {confirmedChildren} copii)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/statistics-detail' as any, params: { type: 'pending' } })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#FEF3C7' }]}>
                <Clock size={20} color={Colors.secondary} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>În așteptare</Text>
                <Text style={styles.cardSubtitle}>Neconfirmați încă</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{pendingGuests} invitații</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/statistics-detail' as any, params: { type: 'declined' } })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
                <UserX size={20} color={Colors.error} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Refuzați</Text>
                <Text style={styles.cardSubtitle}>Nu vor participa</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{declinedGuests} invitații</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalii Persoane</Text>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/statistics-detail' as any, params: { type: 'adults' } })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#E0E7FF' }]}>
                <Users size={20} color={Colors.primary} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Adulți</Text>
                <Text style={styles.cardSubtitle}>Confirmați din total</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{confirmedAdults} / {totalAdults}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/statistics-detail' as any, params: { type: 'children' } })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#FCE7F3' }]}>
                <Baby size={20} color="#EC4899" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Copii</Text>
                <Text style={styles.cardSubtitle}>Confirmați din total</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{confirmedChildren} / {totalChildren}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/statistics-detail' as any, params: { type: 'specialMenu' } })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#FEF3C7' }]}>
                <Utensils size={20} color="#F59E0B" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Meniuri Speciale</Text>
                <Text style={styles.cardSubtitle}>Vegan, alergii, etc.</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{confirmedSpecialMenuCount} confirmați / {specialMenuCount} total</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partea Mirilor</Text>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/statistics-detail' as any, params: { type: 'groom' } })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#E0E7FF' }]}>
                <Heart size={20} color="#3B82F6" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Mire</Text>
                <Text style={styles.cardSubtitle}>Invitați confirmați</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{groomSideConfirmed} / {groomSideTotal} invitații</Text>
            <Text style={styles.cardDetail}>{groomSidePeople} persoane confirmate</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/statistics-detail' as any, params: { type: 'bride' } })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#FCE7F3' }]}>
                <Heart size={20} color="#EC4899" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Mireasă</Text>
                <Text style={styles.cardSubtitle}>Invitați confirmați</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{brideSideConfirmed} / {brideSideTotal} invitații</Text>
            <Text style={styles.cardDetail}>{brideSidePeople} persoane confirmate</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invitații Trimise</Text>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/statistics-detail' as any, params: { type: 'invitationSent' } })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#DCFCE7' }]}>
                <MailCheck size={20} color={Colors.success} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Trimise</Text>
                <Text style={styles.cardSubtitle}>Invitații distribuite</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{invitationsSent} invitații</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/statistics-detail' as any, params: { type: 'invitationNotSent' } })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
                <Mail size={20} color={Colors.error} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Netrimise</Text>
                <Text style={styles.cardSubtitle}>De distribuit</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{invitationsNotSent} invitații</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rata de Confirmare</Text>
          
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#E0F2FE' }]}>
                <TrendingUp size={20} color="#0EA5E9" />
              </View>
              <Text style={styles.progressTitle}>Persoane</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${peopleConfirmationRate}%` }]} />
            </View>
            <Text style={styles.progressText}>{peopleConfirmationRate}% - {confirmedPeople} din {totalPeople} persoane</Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={[styles.iconBadge, { backgroundColor: '#E0F2FE' }]}>
                <TrendingUp size={20} color="#0EA5E9" />
              </View>
              <Text style={styles.progressTitle}>Invitații</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${confirmationRate}%` }]} />
            </View>
            <Text style={styles.progressText}>{confirmationRate}% - {confirmedGuests} din {totalInvitations} invitații</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  overviewCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    opacity: 0.9,
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    gap: 20,
  },
  overviewItem: {
    flex: 1,
  },
  overviewNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
  },
  overviewDivider: {
    width: 1,
    backgroundColor: "#FFF",
    opacity: 0.2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
