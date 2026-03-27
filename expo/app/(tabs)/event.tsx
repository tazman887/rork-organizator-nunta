import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useWedding } from "@/context/WeddingContext";
import {
  Clock,
  MapPin,
  Plus,
  Users,
  UtensilsCrossed,
  Trash2,
  Edit2,
  X,
  User,
  ChevronRight,
} from "lucide-react-native";

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: "ceremony" | "cocktail" | "dinner" | "party" | "cake" | "photo";
}

interface MenuItem {
  id: string;
  category: "Aperitiv" | "Fel Principal" | "Desert" | "Băuturi";
  name: string;
  description: string;
}



const iconMap = {
  ceremony: "💍",
  cocktail: "🥂",
  dinner: "🍽️",
  party: "🎉",
  cake: "🎂",
  photo: "📸",
};

export default function EventScreen() {
  const { tables, addTable, deleteTable, guests, assignGuestToTable } = useWedding();
  const [activeTab, setActiveTab] = useState<"program" | "mese" | "meniu" | "locatie">("program");
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showAddGuestsModal, setShowAddGuestsModal] = useState(false);
  const [selectedTableForGuests, setSelectedTableForGuests] = useState<string | null>(null);
  const [guestSearchQuery, setGuestSearchQuery] = useState("");

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { id: "1", time: "15:00", title: "Ceremonie Religioasă", description: "Biserica Sf. Nicolae", icon: "ceremony" },
    { id: "2", time: "17:00", title: "Cocktail", description: "Grădina restaurantului", icon: "cocktail" },
    { id: "3", time: "18:30", title: "Deschiderea mesei", description: "Sala principală", icon: "dinner" },
    { id: "4", time: "21:00", title: "Tortul mirilor", description: "", icon: "cake" },
    { id: "5", time: "22:00", title: "Petrecere", description: "DJ & Dans", icon: "party" },
  ]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: "1", category: "Aperitiv", name: "Platou rece", description: "Brânzeturi și mezeluri" },
    { id: "2", category: "Aperitiv", name: "Somon afumat", description: "Cu lămâie și capere" },
    { id: "3", category: "Fel Principal", name: "Mușchi de vită", description: "Cu legume la grătar" },
    { id: "4", category: "Desert", name: "Tort de nuntă", description: "Ciocolată și vișine" },
  ]);



  const [newEvent, setNewEvent] = useState({ time: "", title: "", description: "", icon: "party" as const });
  const [newMenuItem, setNewMenuItem] = useState<{ category: MenuItem["category"]; name: string; description: string }>({ category: "Aperitiv", name: "", description: "" });
  const [newTable, setNewTable] = useState({ number: 0, seats: 8 });

  const [venueInfo] = useState({
    name: "Restaurant Grand Palace",
    address: "Str. Principală Nr. 123, București",
    phone: "0721234567",
    capacity: "150 persoane",
  });

  const addTimelineEvent = () => {
    if (!newEvent.time || !newEvent.title) {
      Alert.alert("Eroare", "Te rog completează ora și titlul evenimentului");
      return;
    }
    setTimeline([...timeline, { ...newEvent, id: Date.now().toString() }]);
    setNewEvent({ time: "", title: "", description: "", icon: "party" });
    setShowTimelineModal(false);
  };

  const deleteTimelineEvent = (id: string) => {
    Alert.alert("Șterge eveniment", "Ești sigur că vrei să ștergi acest eveniment?", [
      { text: "Anulează", style: "cancel" },
      { text: "Șterge", onPress: () => setTimeline(timeline.filter((e) => e.id !== id)), style: "destructive" },
    ]);
  };

  const addMenuItem = () => {
    if (!newMenuItem.name) {
      Alert.alert("Eroare", "Te rog completează numele preparatului");
      return;
    }
    setMenuItems([...menuItems, { ...newMenuItem, id: Date.now().toString() }]);
    setNewMenuItem({ category: "Aperitiv", name: "", description: "" });
    setShowMenuModal(false);
  };

  const deleteMenuItem = (id: string) => {
    Alert.alert("Șterge preparat", "Ești sigur că vrei să ștergi acest preparat?", [
      { text: "Anulează", style: "cancel" },
      { text: "Șterge", onPress: () => setMenuItems(menuItems.filter((m) => m.id !== id)), style: "destructive" },
    ]);
  };

  const handleAddTable = () => {
    if (!newTable.number || newTable.seats < 1) {
      Alert.alert("Eroare", "Te rog completează numărul mesei și numărul de locuri");
      return;
    }
    addTable(newTable.number, newTable.seats);
    setNewTable({ number: 0, seats: 8 });
    setShowTableModal(false);
  };

  const handleDeleteTable = (id: string) => {
    Alert.alert("Șterge masă", "Ești sigur că vrei să ștergi această masă?", [
      { text: "Anulează", style: "cancel" },
      { text: "Șterge", onPress: () => deleteTable(id), style: "destructive" },
    ]);
  };

  const renderProgram = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Program Eveniment</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowTimelineModal(true)}>
          <Plus size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {timeline
        .sort((a, b) => a.time.localeCompare(b.time))
        .map((event) => (
          <View key={event.id} style={styles.timelineCard}>
            <View style={styles.timelineLeft}>
              <Text style={styles.timelineEmoji}>{iconMap[event.icon]}</Text>
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTime}>{event.time}</Text>
              <Text style={styles.timelineTitle}>{event.title}</Text>
              {event.description ? <Text style={styles.timelineDesc}>{event.description}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => deleteTimelineEvent(event.id)} style={styles.deleteIcon}>
              <Trash2 size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}
    </View>
  );

  const renderMese = () => {
    const totalSeats = tables.reduce((sum, t) => sum + t.seats, 0);
    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Planificare Mese</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowTableModal(true)}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tables.length}</Text>
            <Text style={styles.statLabel}>Mese</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSeats}</Text>
            <Text style={styles.statLabel}>Locuri Totale</Text>
          </View>
        </View>

        {tables
          .sort((a, b) => a.number - b.number)
          .map((table) => (
            <View key={table.id} style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <View style={styles.tableIcon}>
                  <Users size={24} color={Colors.primary} />
                </View>
                <View style={styles.tableInfo}>
                  <Text style={styles.tableName}>Masa {table.number}</Text>
                  <Text style={styles.tableSeats}>{table.seats} locuri</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteTable(table.id)}>
                  <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>

              {(() => {
                const tableGuests = guests.filter(g => g.tableId === table.id);
                const totalPeople = tableGuests.reduce((sum, g) => sum + g.numberOfPeople + g.numberOfChildren, 0);
                const occupancyPercentage = (totalPeople / table.seats) * 100;
                let occupancyColor = Colors.textSecondary;
                
                if (occupancyPercentage > 100) {
                  occupancyColor = "#EF4444";
                } else if (occupancyPercentage === 100) {
                  occupancyColor = "#10B981";
                } else if (occupancyPercentage > 0) {
                  occupancyColor = "#F59E0B";
                }
                
                return (
                  <>
                    <View style={styles.tableStats}>
                      <Text style={[styles.tableStatsText, { color: occupancyColor }]}>
                        {totalPeople} / {table.seats} persoane
                      </Text>
                    </View>

                    {tableGuests.length > 0 && (
                      <View style={styles.guestsList}>
                        {tableGuests.map((guest) => (
                          <View key={guest.id} style={styles.guestRow}>
                            <View style={styles.guestAvatar}>
                              <User size={12} color={Colors.primary} />
                            </View>
                            <Text style={styles.guestName} numberOfLines={1}>
                              {guest.name}
                            </Text>
                            <Text style={styles.guestCount}>
                              ({guest.numberOfPeople + guest.numberOfChildren})
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                Alert.alert(
                                  "Elimină invitat",
                                  `Sigur vrei să elimini pe ${guest.name} de la această masă?`,
                                  [
                                    { text: "Anulează", style: "cancel" },
                                    {
                                      text: "Elimină",
                                      onPress: () => assignGuestToTable(guest.id, undefined),
                                    },
                                  ]
                                );
                              }}
                              style={styles.removeGuestButton}
                            >
                              <X size={14} color={Colors.error} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.addGuestsButton}
                      onPress={() => {
                        setSelectedTableForGuests(table.id);
                        setShowAddGuestsModal(true);
                      }}
                    >
                      <Plus size={16} color={Colors.primary} />
                      <Text style={styles.addGuestsButtonText}>Adaugă Invitați</Text>
                    </TouchableOpacity>
                  </>
                );
              })()}
            </View>
          ))}
      </View>
    );
  };

  const renderMeniu = () => {
    const categories = ["Aperitiv", "Fel Principal", "Desert", "Băuturi"] as const;
    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meniu Nuntă</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowMenuModal(true)}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {categories.map((category) => {
          const items = menuItems.filter((item) => item.category === category);
          if (items.length === 0) return null;

          return (
            <View key={category} style={styles.menuCategory}>
              <Text style={styles.menuCategoryTitle}>{category}</Text>
              {items.map((item) => (
                <View key={item.id} style={styles.menuItem}>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    {item.description ? <Text style={styles.menuItemDesc}>{item.description}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => deleteMenuItem(item.id)}>
                    <Trash2 size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  const renderLocatie = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Locație & Detalii</Text>

      <View style={styles.venueCard}>
        <View style={styles.venueIcon}>
          <MapPin size={32} color={Colors.primary} />
        </View>
        <Text style={styles.venueName}>{venueInfo.name}</Text>
        <Text style={styles.venueDetail}>{venueInfo.address}</Text>
        <Text style={styles.venueDetail}>📞 {venueInfo.phone}</Text>
        <Text style={styles.venueDetail}>👥 Capacitate: {venueInfo.capacity}</Text>
      </View>

      <TouchableOpacity style={styles.editVenueButton}>
        <Edit2 size={18} color={Colors.primary} />
        <Text style={styles.editVenueText}>Editează Detaliile Locației</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planificare Eveniment</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "program" && styles.tabActive]}
          onPress={() => setActiveTab("program")}
        >
          <Clock size={20} color={activeTab === "program" ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === "program" && styles.tabTextActive]}>Program</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "mese" && styles.tabActive]}
          onPress={() => setActiveTab("mese")}
        >
          <Users size={20} color={activeTab === "mese" ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === "mese" && styles.tabTextActive]}>Mese</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "meniu" && styles.tabActive]}
          onPress={() => setActiveTab("meniu")}
        >
          <UtensilsCrossed size={20} color={activeTab === "meniu" ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === "meniu" && styles.tabTextActive]}>Meniu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "locatie" && styles.tabActive]}
          onPress={() => setActiveTab("locatie")}
        >
          <MapPin size={20} color={activeTab === "locatie" ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === "locatie" && styles.tabTextActive]}>Locație</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === "program" && renderProgram()}
        {activeTab === "mese" && renderMese()}
        {activeTab === "meniu" && renderMeniu()}
        {activeTab === "locatie" && renderLocatie()}
      </ScrollView>

      <Modal visible={showTimelineModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adaugă Eveniment</Text>
              <TouchableOpacity onPress={() => setShowTimelineModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Ora (ex: 15:00)"
              value={newEvent.time}
              onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Titlu eveniment"
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Descriere (opțional)"
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={addTimelineEvent}>
              <Text style={styles.primaryButtonText}>Adaugă</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showMenuModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adaugă Preparat</Text>
              <TouchableOpacity onPress={() => setShowMenuModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Categorie:</Text>
              <View style={styles.categoryButtons}>
                {(["Aperitiv", "Fel Principal", "Desert", "Băuturi"] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryBtn, newMenuItem.category === cat && styles.categoryBtnActive]}
                    onPress={() => setNewMenuItem({ ...newMenuItem, category: cat })}
                  >
                    <Text style={[styles.categoryBtnText, newMenuItem.category === cat && styles.categoryBtnTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nume preparat"
              value={newMenuItem.name}
              onChangeText={(text) => setNewMenuItem({ ...newMenuItem, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Descriere (opțional)"
              value={newMenuItem.description}
              onChangeText={(text) => setNewMenuItem({ ...newMenuItem, description: text })}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={addMenuItem}>
              <Text style={styles.primaryButtonText}>Adaugă</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTableModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adaugă Masă</Text>
              <TouchableOpacity onPress={() => setShowTableModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Număr masă"
              keyboardType="number-pad"
              value={newTable.number ? newTable.number.toString() : ""}
              onChangeText={(text) => setNewTable({ ...newTable, number: parseInt(text) || 0 })}
            />
            <TextInput
              style={styles.input}
              placeholder="Număr de locuri"
              keyboardType="number-pad"
              value={newTable.seats.toString()}
              onChangeText={(text) => setNewTable({ ...newTable, seats: parseInt(text) || 8 })}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleAddTable}>
              <Text style={styles.primaryButtonText}>Adaugă</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddGuestsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adaugă Invitați</Text>
              <TouchableOpacity onPress={() => {
                setShowAddGuestsModal(false);
                setGuestSearchQuery("");
              }}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Masa {tables.find(t => t.id === selectedTableForGuests)?.number || ''}
            </Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Caută invitați..."
              value={guestSearchQuery}
              onChangeText={setGuestSearchQuery}
              placeholderTextColor={Colors.textSecondary}
            />

            <ScrollView style={styles.guestsModalList} showsVerticalScrollIndicator={false}>
              {guests
                .filter(g => !g.tableId)
                .filter(g => g.name.toLowerCase().includes(guestSearchQuery.toLowerCase()))
                .map((guest) => (
                  <TouchableOpacity
                    key={guest.id}
                    style={styles.guestSelectItem}
                    onPress={() => {
                      Alert.alert(
                        "Adaugă la masă",
                        `Adaugi pe ${guest.name} la această masă?`,
                        [
                          { text: "Anulează", style: "cancel" },
                          {
                            text: "Adaugă",
                            onPress: () => {
                              if (selectedTableForGuests) {
                                assignGuestToTable(guest.id, selectedTableForGuests);
                              }
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <View style={styles.guestSelectAvatar}>
                      <User size={16} color={Colors.primary} />
                    </View>
                    <View style={styles.guestSelectInfo}>
                      <Text style={styles.guestSelectName}>{guest.name}</Text>
                      <Text style={styles.guestSelectDetails}>
                        {guest.numberOfPeople + guest.numberOfChildren} persoane
                      </Text>
                    </View>
                    <ChevronRight size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              {guests.filter(g => !g.tableId).filter(g => g.name.toLowerCase().includes(guestSearchQuery.toLowerCase())).length === 0 && (
                <Text style={styles.emptyGuestsList}>
                  {guests.filter(g => !g.tableId).length === 0 
                    ? "Toți invitații au fost alocați la mese" 
                    : "Niciun invitat găsit"}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: `${Colors.primary}15`,
  },
  tabText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineCard: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 16,
  },
  timelineEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  deleteIcon: {
    padding: 4,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  tableCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  tableSeats: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  guestsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  guestName: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  menuCategory: {
    marginBottom: 24,
  },
  menuCategoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  menuItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  menuItemDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  venueCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  venueIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  venueName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  venueDetail: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 6,
    textAlign: "center",
  },
  editVenueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  editVenueText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryBtnText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  categoryBtnTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  tableStats: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tableStatsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  guestAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${Colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  guestRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  guestCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  removeGuestButton: {
    marginLeft: "auto",
    padding: 4,
  },
  addGuestsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 6,
  },
  addGuestsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  guestsModalList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  guestSelectItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestSelectAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  guestSelectInfo: {
    flex: 1,
  },
  guestSelectName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  guestSelectDetails: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyGuestsList: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
