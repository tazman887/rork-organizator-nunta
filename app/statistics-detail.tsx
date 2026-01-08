import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useWedding, Guest } from "@/context/WeddingContext";
import { Users, Mail } from "lucide-react-native";

type DetailType = 
  | 'confirmed' 
  | 'pending' 
  | 'declined' 
  | 'adults' 
  | 'children' 
  | 'specialMenu' 
  | 'groom' 
  | 'bride' 
  | 'invitationSent' 
  | 'invitationNotSent';

export default function StatisticsDetailScreen() {
  const { type } = useLocalSearchParams<{ type: DetailType }>();
  const { guests } = useWedding();

  const { filteredGuests, title, description } = useMemo(() => {
    let filtered: Guest[] = [];
    let title = "";
    let description = "";

    switch (type) {
      case 'confirmed':
        filtered = guests.filter(g => g.status === 'confirmed');
        title = "Invitați Confirmați";
        description = `${filtered.length} invitații au confirmat participarea`;
        break;
      case 'pending':
        filtered = guests.filter(g => g.status === 'pending');
        title = "În Așteptare";
        description = `${filtered.length} invitații nu au confirmat încă`;
        break;
      case 'declined':
        filtered = guests.filter(g => g.status === 'declined');
        title = "Invitați Refuzați";
        description = `${filtered.length} invitații au refuzat`;
        break;
      case 'adults':
        filtered = guests.filter(g => g.numberOfPeople > 0);
        title = "Adulți";
        description = `Invitații cu adulți în listă`;
        break;
      case 'children':
        filtered = guests.filter(g => g.numberOfChildren > 0);
        title = "Copii";
        description = `Invitații cu copii în listă`;
        break;
      case 'specialMenu':
        filtered = guests.filter(g => g.specialMenuNotes.length > 0);
        title = "Meniuri Speciale";
        description = `${filtered.length} invitații cu cerințe speciale`;
        break;
      case 'groom':
        filtered = guests.filter(g => g.side === 'groom');
        title = "Partea Mirelui";
        description = `${filtered.length} invitații din partea mirelui`;
        break;
      case 'bride':
        filtered = guests.filter(g => g.side === 'bride');
        title = "Partea Miresei";
        description = `${filtered.length} invitații din partea miresei`;
        break;
      case 'invitationSent':
        filtered = guests.filter(g => g.invitationSent);
        title = "Invitații Trimise";
        description = `${filtered.length} invitații au fost trimise`;
        break;
      case 'invitationNotSent':
        filtered = guests.filter(g => !g.invitationSent);
        title = "Invitații Netrimise";
        description = `${filtered.length} invitații rămase de trimis`;
        break;
      default:
        filtered = guests;
        title = "Toți Invitații";
        description = `${filtered.length} invitații în total`;
    }

    return { filteredGuests: filtered, title, description };
  }, [type, guests]);

  const getStatusColor = (status: Guest['status']) => {
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'declined':
        return Colors.error;
      default:
        return Colors.secondary;
    }
  };

  const getStatusText = (status: Guest['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmat';
      case 'declined':
        return 'Refuzat';
      default:
        return 'În așteptare';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: title,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerShadowVisible: false,
        }}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerDescription}>{description}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filteredGuests.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Nu există invitați în această categorie</Text>
          </View>
        ) : (
          filteredGuests.map((guest) => (
            <View key={guest.id} style={styles.guestCard}>
              <View style={styles.guestHeader}>
                <View style={styles.guestMainInfo}>
                  <Text style={styles.guestName}>{guest.name}</Text>
                  <View style={styles.statusBadge}>
                    <View 
                      style={[
                        styles.statusDot, 
                        { backgroundColor: getStatusColor(guest.status) }
                      ]} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(guest.status) }]}>
                      {getStatusText(guest.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.sideBadge}>
                  <Text style={styles.sideText}>
                    {guest.side === 'groom' ? 'Mire' : 'Mireasă'}
                  </Text>
                </View>
              </View>

              <View style={styles.guestDetails}>
                <View style={styles.detailRow}>
                  <Users size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>
                    Adulți: {guest.confirmedPeople} / {guest.numberOfPeople}
                  </Text>
                </View>
                
                {guest.numberOfChildren > 0 && (
                  <View style={styles.detailRow}>
                    <Users size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>
                      Copii: {guest.confirmedChildren} / {guest.numberOfChildren}
                    </Text>
                  </View>
                )}

                {guest.specialMenuNotes.length > 0 && (
                  <View style={styles.specialMenuSection}>
                    <Text style={styles.specialMenuLabel}>Meniu Special:</Text>
                    <Text style={styles.specialMenuText}>{guest.specialMenuNotes}</Text>
                  </View>
                )}

                <View style={styles.invitationRow}>
                  <Mail size={16} color={guest.invitationSent ? Colors.success : Colors.error} />
                  <Text style={[
                    styles.invitationText,
                    { color: guest.invitationSent ? Colors.success : Colors.error }
                  ]}>
                    {guest.invitationSent ? 'Invitație trimisă' : 'Invitație netrimisă'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  guestCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guestMainInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  sideBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sideText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  guestDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  specialMenuSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  specialMenuLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  specialMenuText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  invitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  invitationText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
