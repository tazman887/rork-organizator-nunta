import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useWedding, Guest } from "@/context/WeddingContext";
import { useRouter } from "expo-router";
import { Plus, User, Check, X, Clock, Trash2, Mail, Pencil, Search, BarChart3, Filter, Download } from "lucide-react-native";

export default function GuestsScreen() {
  const router = useRouter();
  const { guests, tables, addGuest, updateGuestStatus, deleteGuest, updateGuest, toggleInvitationSent, assignGuestToTable } = useWedding();
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestPeople, setNewGuestPeople] = useState(1);
  const [newGuestCustom, setNewGuestCustom] = useState("");
  const [newGuestChildren, setNewGuestChildren] = useState(0);
  const [newGuestChildrenCustom, setNewGuestChildrenCustom] = useState("");
  const [newGuestHasSpecialMenu, setNewGuestHasSpecialMenu] = useState(false);
  const [newGuestSpecialMenuNotes, setNewGuestSpecialMenuNotes] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [confirmedCustom, setConfirmedCustom] = useState("");
  const [confirmedChildrenCount, setConfirmedChildrenCount] = useState(0);
  const [confirmedChildrenCustom, setConfirmedChildrenCustom] = useState("");
  const [selectedSide, setSelectedSide] = useState<"groom" | "bride">("groom");
  const [newGuestSide, setNewGuestSide] = useState<"groom" | "bride">("groom");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editGuestName, setEditGuestName] = useState("");
  const [editGuestPeople, setEditGuestPeople] = useState(1);
  const [editGuestCustom, setEditGuestCustom] = useState("");
  const [editGuestSide, setEditGuestSide] = useState<"groom" | "bride">("groom");
  const [editGuestChildren, setEditGuestChildren] = useState(0);
  const [editGuestChildrenCustom, setEditGuestChildrenCustom] = useState("");
  const [editGuestHasSpecialMenu, setEditGuestHasSpecialMenu] = useState(false);
  const [editGuestSpecialMenuNotes, setEditGuestSpecialMenuNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableGuestsModalVisible, setTableGuestsModalVisible] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    noTable: boolean;
    withChildren: boolean;
    specialMenu: boolean;
    groupByTable: boolean;
  }>({
    noTable: false,
    withChildren: false,
    specialMenu: false,
    groupByTable: false,
  });

  const handleAddGuest = () => {
    if (newGuestName.trim()) {
      const numPeople = newGuestPeople === 0 ? (parseInt(newGuestCustom) || 1) : newGuestPeople;
      const numChildren = newGuestChildren === -1 ? (parseInt(newGuestChildrenCustom) || 0) : newGuestChildren;
      const specialNotes = newGuestHasSpecialMenu ? newGuestSpecialMenuNotes : "";
      Alert.alert(
        "Adaugă Invitat",
        `Ești sigur/ă că vrei să adaugi ${newGuestName.trim()} în lista de ${newGuestSide === 'groom' ? 'mire' : 'mireasă'}?`,
        [
          { text: "Anulează", style: "cancel" },
          {
            text: "Adaugă",
            onPress: () => {
              addGuest(newGuestName.trim(), newGuestSide, numPeople, numChildren, specialNotes);
              setNewGuestName("");
              setNewGuestPeople(1);
              setNewGuestCustom("");
              setNewGuestChildren(0);
              setNewGuestChildrenCustom("");
              setNewGuestHasSpecialMenu(false);
              setNewGuestSpecialMenuNotes("");
              setModalVisible(false);
            },
          },
        ]
      );
    }
  };

  const handleConfirm = (guest: Guest) => {
    setSelectedGuest(guest);
    setConfirmedCount(guest.numberOfPeople <= 5 ? guest.numberOfPeople : 0);
    setConfirmedCustom(guest.numberOfPeople > 5 ? guest.numberOfPeople.toString() : "");
    setConfirmedChildrenCount(guest.numberOfChildren <= 5 ? guest.numberOfChildren : 0);
    setConfirmedChildrenCustom(guest.numberOfChildren > 5 ? guest.numberOfChildren.toString() : "");
    setConfirmModalVisible(true);
  };

  const handleConfirmSubmit = () => {
    if (selectedGuest) {
      const count = confirmedCount === 0 ? (parseInt(confirmedCustom) || 0) : confirmedCount;
      const childrenCount = confirmedChildrenCount === -1 ? (parseInt(confirmedChildrenCustom) || 0) : confirmedChildrenCount;
      const totalCount = count + childrenCount;
      Alert.alert(
        "Confirmă Participarea",
        `Ești sigur/ă că vrei să confirmi participarea pentru ${selectedGuest.name} cu ${count} adulți și ${childrenCount} copii (total ${totalCount} persoane)?`,
        [
          { text: "Anulează", style: "cancel" },
          {
            text: "Confirmă",
            onPress: () => {
              updateGuestStatus(selectedGuest.id, "confirmed", count, childrenCount);
              setConfirmModalVisible(false);
              setSelectedGuest(null);
              setConfirmedCount(0);
              setConfirmedCustom("");
              setConfirmedChildrenCount(0);
              setConfirmedChildrenCustom("");
            },
          },
        ]
      );
    }
  };

  const handleToggleInvitation = (guest: Guest) => {
    Alert.alert(
      guest.invitationSent ? "Marchează invitația ca netrimisă" : "Marchează invitația ca trimisă",
      `Ești sigur/ă că vrei să ${guest.invitationSent ? 'anulezi marcarea invitatiei' : 'marchezi invitația ca trimisă'} pentru ${guest.name}?`,
      [
        { text: "Anulează", style: "cancel" },
        { text: "Da", onPress: () => toggleInvitationSent(guest.id) },
      ]
    );
  };

  let filteredGuests = guests
    .filter(g => g.side === selectedSide)
    .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (activeFilters.noTable) {
    filteredGuests = filteredGuests.filter(g => !g.tableId);
  }
  if (activeFilters.withChildren) {
    filteredGuests = filteredGuests.filter(g => g.numberOfChildren > 0);
  }
  if (activeFilters.specialMenu) {
    filteredGuests = filteredGuests.filter(g => g.specialMenuNotes.length > 0);
  }

  if (activeFilters.groupByTable) {
    filteredGuests = filteredGuests.sort((a, b) => {
      if (!a.tableId && !b.tableId) return a.name.localeCompare(b.name);
      if (!a.tableId) return 1;
      if (!b.tableId) return -1;
      const tableA = tables.find(t => t.id === a.tableId)?.number || 0;
      const tableB = tables.find(t => t.id === b.tableId)?.number || 0;
      if (tableA !== tableB) return tableA - tableB;
      return a.name.localeCompare(b.name);
    });
  } else {
    filteredGuests = filteredGuests.sort((a, b) => a.name.localeCompare(b.name));
  }
  const groomCount = guests.filter(g => g.side === "groom").length;
  const brideCount = guests.filter(g => g.side === "bride").length;

  const confirmedPeopleCount = guests
    .filter(g => g.status === 'confirmed')
    .reduce((sum, g) => sum + g.confirmedPeople + g.confirmedChildren, 0);
  
  const totalPeopleCount = guests.reduce((sum, g) => sum + g.numberOfPeople + g.numberOfChildren, 0);
  
  const invitationsSentCount = guests.filter(g => g.invitationSent).length;
  const totalInvitationsCount = guests.length;

  const confirmedPercentage = totalPeopleCount > 0 
    ? Math.round((confirmedPeopleCount / totalPeopleCount) * 100) 
    : 0;
  
  const invitationsSentPercentage = totalInvitationsCount > 0 
    ? Math.round((invitationsSentCount / totalInvitationsCount) * 100) 
    : 0;

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setEditGuestName(guest.name);
    setEditGuestPeople(guest.numberOfPeople <= 5 ? guest.numberOfPeople : 0);
    setEditGuestCustom(guest.numberOfPeople > 5 ? guest.numberOfPeople.toString() : "");
    setEditGuestChildren(guest.numberOfChildren <= 5 ? guest.numberOfChildren : 0);
    setEditGuestChildrenCustom(guest.numberOfChildren > 5 ? guest.numberOfChildren.toString() : "");
    setEditGuestHasSpecialMenu(guest.specialMenuNotes.length > 0);
    setEditGuestSpecialMenuNotes(guest.specialMenuNotes);
    setEditGuestSide(guest.side);
    setEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    if (editingGuest && editGuestName.trim()) {
      const numPeople = editGuestPeople === 0 ? (parseInt(editGuestCustom) || 1) : editGuestPeople;
      const numChildren = editGuestChildren === -1 ? (parseInt(editGuestChildrenCustom) || 0) : editGuestChildren;
      const specialNotes = editGuestHasSpecialMenu ? editGuestSpecialMenuNotes : "";
      Alert.alert(
        "Editează Invitat",
        `Ești sigur/ă că vrei să salvezi modificările pentru ${editGuestName.trim()}?`,
        [
          { text: "Anulează", style: "cancel" },
          {
            text: "Salvează",
            onPress: () => {
              updateGuest(editingGuest.id, editGuestName.trim(), editGuestSide, numPeople, numChildren, specialNotes);
              
              const updatedGuest = {
                ...editingGuest,
                name: editGuestName.trim(),
                side: editGuestSide,
                numberOfPeople: numPeople,
                numberOfChildren: numChildren,
                specialMenuNotes: specialNotes,
              };
              
              setEditModalVisible(false);
              setEditingGuest(null);
              setEditGuestCustom("");
              setEditGuestChildren(0);
              setEditGuestChildrenCustom("");
              setEditGuestHasSpecialMenu(false);
              setEditGuestSpecialMenuNotes("");
              
              setSelectedGuest(updatedGuest);
              setConfirmedCount(numPeople <= 5 ? numPeople : 0);
              setConfirmedCustom(numPeople > 5 ? numPeople.toString() : "");
              setConfirmedChildrenCount(numChildren <= 5 ? numChildren : 0);
              setConfirmedChildrenCustom(numChildren > 5 ? numChildren.toString() : "");
              setConfirmModalVisible(true);
            },
          },
        ]
      );
    }
  };

  const handleDeleteFromEdit = () => {
    if (editingGuest) {
      setEditModalVisible(false);
      Alert.alert(
        "Șterge Invitat",
        `Sigur vrei să ștergi pe ${editingGuest.name}?`,
        [
          { text: "Anulează", style: "cancel" },
          { 
            text: "Șterge", 
            style: "destructive", 
            onPress: () => {
              deleteGuest(editingGuest.id);
              setEditingGuest(null);
            }
          },
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: Guest }) => (
    <View style={styles.guestCard}>
      <View style={styles.avatar}>
        <User size={20} color={Colors.primary} />
      </View>
      <View style={styles.guestInfo}>
        <Text style={styles.guestName}>{item.name}</Text>
        <Text style={styles.guestDetails}>
          {item.status === "confirmed" 
            ? `${item.confirmedPeople + item.confirmedChildren} din ${item.numberOfPeople + item.numberOfChildren} persoane (${item.confirmedPeople} adulți, ${item.confirmedChildren} copii)` 
            : `${item.numberOfPeople + item.numberOfChildren} persoane (${item.numberOfPeople} adulți, ${item.numberOfChildren} copii)`}
        </Text>
        {item.specialMenuNotes.length > 0 && (
          <Text style={styles.specialMenuBadge}>🍽️ Meniu special</Text>
        )}
        {item.tableId ? (
          <TouchableOpacity
            onPress={() => {
              setSelectedTableId(item.tableId!);
              setTableGuestsModalVisible(true);
            }}
            style={styles.tableBadgeContainer}
          >
            <Text style={styles.tableBadge}>
              Masa {tables.find(t => t.id === item.tableId)?.number || '?'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noTableBadge}>Fără masă</Text>
        )}
      </View>
      <View style={styles.statusActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.invitationSent ? styles.invitationSentButton : styles.invitationPendingButton,
          ]}
          onPress={() => handleToggleInvitation(item)}
        >
          <Mail size={16} color={item.invitationSent ? "#FFF" : Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statusButton,
            item.status === "confirmed" && { backgroundColor: Colors.success },
            item.status === "pending" && { backgroundColor: Colors.secondary },
            item.status === "declined" && { backgroundColor: Colors.error },
          ]}
          onPress={() => {
            setSelectedGuest(item);
            setStatusModalVisible(true);
          }}
        >
          {item.status === "confirmed" && <Check size={16} color="#FFF" />}
          {item.status === "pending" && <Clock size={16} color="#FFF" />}
          {item.status === "declined" && <X size={16} color="#FFF" />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Pencil size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Invitați</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{confirmedPeopleCount}/{totalPeopleCount} - {confirmedPercentage}%</Text>
              <Text style={styles.statLabel}>Persoane confirmate</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{invitationsSentCount}/{totalInvitationsCount} - {invitationsSentPercentage}%</Text>
              <Text style={styles.statLabel}>Invitații trimise</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.statsButton}
            onPress={() => router.push('/statistics' as any)}
          >
            <BarChart3 size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setNewGuestSide(selectedSide);
              setModalVisible(true);
            }}
          >
            <Plus size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={18} color={Colors.primary} />
          <Text style={styles.filterButtonText}>Filtrează</Text>
          {(activeFilters.noTable || activeFilters.withChildren || activeFilters.specialMenu || activeFilters.groupByTable) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={async () => {
            const allGuests = guests.filter(g => g.side === selectedSide);
            let content = `Lista de Invitați - ${selectedSide === 'groom' ? 'Mire' : 'Mireasă'}\n\n`;
            allGuests.forEach(guest => {
              content += `${guest.name}\n`;
              content += `  Status: ${guest.status === 'confirmed' ? 'Confirmat' : guest.status === 'pending' ? 'În așteptare' : 'Refuzat'}\n`;
              content += `  Persoane: ${guest.numberOfPeople} adulți, ${guest.numberOfChildren} copii\n`;
              if (guest.status === 'confirmed') {
                content += `  Confirmați: ${guest.confirmedPeople} adulți, ${guest.confirmedChildren} copii\n`;
              }
              if (guest.tableId) {
                const table = tables.find(t => t.id === guest.tableId);
                content += `  Masă: ${table?.number || '?'}\n`;
              } else {
                content += `  Masă: Nealocată\n`;
              }
              if (guest.specialMenuNotes) {
                content += `  Meniu special: ${guest.specialMenuNotes}\n`;
              }
              content += `  Invitație trimisă: ${guest.invitationSent ? 'Da' : 'Nu'}\n\n`;
            });
            try {
              await Share.share({ message: content });
            } catch (error) {
              console.error('Error sharing:', error);
            }
          }}
        >
          <Download size={18} color={Colors.primary} />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            selectedSide === "groom" && styles.segmentButtonActive,
          ]}
          onPress={() => setSelectedSide("groom")}
        >
          <Text
            style={[
              styles.segmentText,
              selectedSide === "groom" && styles.segmentTextActive,
            ]}
          >
            Mire ({groomCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            selectedSide === "bride" && styles.segmentButtonActive,
          ]}
          onPress={() => setSelectedSide("bride")}
        >
          <Text
            style={[
              styles.segmentText,
              selectedSide === "bride" && styles.segmentTextActive,
            ]}
          >
            Mireasă ({brideCount})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Caută după nume..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredGuests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adaugă Invitat</Text>
            
            <View style={styles.sideSelector}>
              <TouchableOpacity
                style={[
                  styles.sideButton,
                  newGuestSide === "groom" && styles.sideButtonActive,
                ]}
                onPress={() => setNewGuestSide("groom")}
              >
                <Text
                  style={[
                    styles.sideButtonText,
                    newGuestSide === "groom" && styles.sideButtonTextActive,
                  ]}
                >
                  Mire
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sideButton,
                  newGuestSide === "bride" && styles.sideButtonActive,
                ]}
                onPress={() => setNewGuestSide("bride")}
              >
                <Text
                  style={[
                    styles.sideButtonText,
                    newGuestSide === "bride" && styles.sideButtonTextActive,
                  ]}
                >
                  Mireasă
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nume Prenume"
              value={newGuestName}
              onChangeText={setNewGuestName}
              autoFocus
            />
            <Text style={styles.inputLabel}>Număr de persoane</Text>
            <View style={styles.peopleSelector}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.peopleOption,
                    newGuestPeople === num && styles.peopleOptionActive,
                  ]}
                  onPress={() => setNewGuestPeople(num)}
                >
                  <Text
                    style={[
                      styles.peopleOptionText,
                      newGuestPeople === num && styles.peopleOptionTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.peopleOption,
                  styles.peopleOptionMore,
                  newGuestPeople === 0 && styles.peopleOptionActive,
                ]}
                onPress={() => setNewGuestPeople(0)}
              >
                <Text
                  style={[
                    styles.peopleOptionText,
                    newGuestPeople === 0 && styles.peopleOptionTextActive,
                  ]}
                >
                  mai mult
                </Text>
              </TouchableOpacity>
            </View>
            {newGuestPeople === 0 && (
              <TextInput
                style={styles.input}
                placeholder="Introdu numărul"
                value={newGuestCustom}
                onChangeText={setNewGuestCustom}
                keyboardType="number-pad"
                autoFocus
              />
            )}
            <Text style={styles.inputLabel}>Număr de copii</Text>
            <View style={styles.peopleSelector}>
              {[0, 1, 2, 3, 4].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.peopleOption,
                    newGuestChildren === num && styles.peopleOptionActive,
                  ]}
                  onPress={() => setNewGuestChildren(num)}
                >
                  <Text
                    style={[
                      styles.peopleOptionText,
                      newGuestChildren === num && styles.peopleOptionTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.peopleOption,
                  styles.peopleOptionMore,
                  newGuestChildren === -1 && styles.peopleOptionActive,
                ]}
                onPress={() => setNewGuestChildren(-1)}
              >
                <Text
                  style={[
                    styles.peopleOptionText,
                    newGuestChildren === -1 && styles.peopleOptionTextActive,
                  ]}
                >
                  mai mult
                </Text>
              </TouchableOpacity>
            </View>
            {newGuestChildren === -1 && (
              <TextInput
                style={styles.input}
                placeholder="Introdu numărul"
                value={newGuestChildrenCustom}
                onChangeText={setNewGuestChildrenCustom}
                keyboardType="number-pad"
                autoFocus
              />
            )}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setNewGuestHasSpecialMenu(!newGuestHasSpecialMenu)}
              >
                {newGuestHasSpecialMenu && <Check size={20} color={Colors.primary} />}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Meniu special (vegan, lactovegetarian, alergii)</Text>
            </View>
            {newGuestHasSpecialMenu && (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex: Vegan, Alergic la nuci, Lactovegetarian"
                value={newGuestSpecialMenuNotes}
                onChangeText={setNewGuestSpecialMenuNotes}
                multiline
                numberOfLines={3}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddGuest}
              >
                <Text style={styles.saveButtonText}>Salvează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmă Participarea</Text>
            <Text style={styles.modalSubtitle}>
              {selectedGuest?.name} - {(selectedGuest?.numberOfPeople || 0) + (selectedGuest?.numberOfChildren || 0)} persoane ({selectedGuest?.numberOfPeople} adulți, {selectedGuest?.numberOfChildren} copii)
            </Text>
            <Text style={styles.inputLabel}>Câți adulți confirmă?</Text>
            <View style={styles.peopleSelector}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.peopleOption,
                    confirmedCount === num && styles.peopleOptionActive,
                  ]}
                  onPress={() => setConfirmedCount(num)}
                >
                  <Text
                    style={[
                      styles.peopleOptionText,
                      confirmedCount === num && styles.peopleOptionTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.peopleOption,
                  styles.peopleOptionMore,
                  confirmedCount === 0 && styles.peopleOptionActive,
                ]}
                onPress={() => setConfirmedCount(0)}
              >
                <Text
                  style={[
                    styles.peopleOptionText,
                    confirmedCount === 0 && styles.peopleOptionTextActive,
                  ]}
                >
                  mai mult
                </Text>
              </TouchableOpacity>
            </View>
            {confirmedCount === 0 && (
              <TextInput
                style={styles.input}
                placeholder="Introdu numărul"
                value={confirmedCustom}
                onChangeText={setConfirmedCustom}
                keyboardType="number-pad"
                autoFocus
              />
            )}
            <Text style={styles.inputLabel}>Câți copii confirmă?</Text>
            <View style={styles.peopleSelector}>
              {[0, 1, 2, 3, 4].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.peopleOption,
                    confirmedChildrenCount === num && styles.peopleOptionActive,
                  ]}
                  onPress={() => setConfirmedChildrenCount(num)}
                >
                  <Text
                    style={[
                      styles.peopleOptionText,
                      confirmedChildrenCount === num && styles.peopleOptionTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.peopleOption,
                  styles.peopleOptionMore,
                  confirmedChildrenCount === -1 && styles.peopleOptionActive,
                ]}
                onPress={() => setConfirmedChildrenCount(-1)}
              >
                <Text
                  style={[
                    styles.peopleOptionText,
                    confirmedChildrenCount === -1 && styles.peopleOptionTextActive,
                  ]}
                >
                  mai mult
                </Text>
              </TouchableOpacity>
            </View>
            {confirmedChildrenCount === -1 && (
              <TextInput
                style={styles.input}
                placeholder="Introdu numărul"
                value={confirmedChildrenCustom}
                onChangeText={setConfirmedChildrenCustom}
                keyboardType="number-pad"
                autoFocus
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleConfirmSubmit}
              >
                <Text style={styles.saveButtonText}>Confirmă</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.statusModalOverlay}
          activeOpacity={1}
          onPress={() => setStatusModalVisible(false)}
        >
          <View style={styles.statusModalContent}>
            <Text style={styles.statusModalTitle}>Schimbă Status</Text>
            <Text style={styles.statusModalSubtitle}>{selectedGuest?.name}</Text>
            
            <TouchableOpacity
              style={styles.statusOption}
              onPress={() => {
                setStatusModalVisible(false);
                if (selectedGuest) {
                  handleConfirm(selectedGuest);
                }
              }}
            >
              <View style={[styles.statusOptionIcon, { backgroundColor: Colors.success }]}>
                <Check size={20} color="#FFF" />
              </View>
              <Text style={styles.statusOptionText}>Confirmat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statusOption}
              onPress={() => {
                if (selectedGuest) {
                  setStatusModalVisible(false);
                  Alert.alert(
                    "Schimbă Status",
                    `Ești sigur/ă că vrei să marchezi ${selectedGuest.name} ca în așteptare?`,
                    [
                      { text: "Anulează", style: "cancel" },
                      { text: "Da", onPress: () => updateGuestStatus(selectedGuest.id, "pending") },
                    ]
                  );
                }
              }}
            >
              <View style={[styles.statusOptionIcon, { backgroundColor: Colors.secondary }]}>
                <Clock size={20} color="#FFF" />
              </View>
              <Text style={styles.statusOptionText}>În așteptare</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statusOption}
              onPress={() => {
                if (selectedGuest) {
                  setStatusModalVisible(false);
                  Alert.alert(
                    "Refuz Participare",
                    `Ești sigur/ă că vrei să marchezi ${selectedGuest.name} ca refuzat?`,
                    [
                      { text: "Anulează", style: "cancel" },
                      { 
                        text: "Da", 
                        onPress: () => {
                          const hasTable = !!selectedGuest.tableId;
                          updateGuestStatus(selectedGuest.id, "declined", 0);
                          if (hasTable) {
                            // Using setTimeout to ensure the first alert closes properly before showing the second one,
                            // although on some platforms consecutive alerts queue up.
                            setTimeout(() => {
                              Alert.alert(
                                "Locuri eliberate", 
                                "Invitatul a fost eliminat de la masă și locurile au fost eliberate."
                              );
                            }, 500);
                          }
                        } 
                      },
                    ]
                  );
                }
              }}
            >
              <View style={[styles.statusOptionIcon, { backgroundColor: Colors.error }]}>
                <X size={20} color="#FFF" />
              </View>
              <Text style={styles.statusOptionText}>Refuzat</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editează Invitat</Text>
            
            <View style={styles.sideSelector}>
              <TouchableOpacity
                style={[
                  styles.sideButton,
                  editGuestSide === "groom" && styles.sideButtonActive,
                ]}
                onPress={() => setEditGuestSide("groom")}
              >
                <Text
                  style={[
                    styles.sideButtonText,
                    editGuestSide === "groom" && styles.sideButtonTextActive,
                  ]}
                >
                  Mire
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sideButton,
                  editGuestSide === "bride" && styles.sideButtonActive,
                ]}
                onPress={() => setEditGuestSide("bride")}
              >
                <Text
                  style={[
                    styles.sideButtonText,
                    editGuestSide === "bride" && styles.sideButtonTextActive,
                  ]}
                >
                  Mireasă
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nume Prenume"
              value={editGuestName}
              onChangeText={setEditGuestName}
              autoFocus
            />
            <Text style={styles.inputLabel}>Număr de persoane</Text>
            <View style={styles.peopleSelector}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.peopleOption,
                    editGuestPeople === num && styles.peopleOptionActive,
                  ]}
                  onPress={() => setEditGuestPeople(num)}
                >
                  <Text
                    style={[
                      styles.peopleOptionText,
                      editGuestPeople === num && styles.peopleOptionTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.peopleOption,
                  styles.peopleOptionMore,
                  editGuestPeople === 0 && styles.peopleOptionActive,
                ]}
                onPress={() => setEditGuestPeople(0)}
              >
                <Text
                  style={[
                    styles.peopleOptionText,
                    editGuestPeople === 0 && styles.peopleOptionTextActive,
                  ]}
                >
                  mai mult
                </Text>
              </TouchableOpacity>
            </View>
            {editGuestPeople === 0 && (
              <TextInput
                style={styles.input}
                placeholder="Introdu numărul"
                value={editGuestCustom}
                onChangeText={setEditGuestCustom}
                keyboardType="number-pad"
                autoFocus
              />
            )}
            <Text style={styles.inputLabel}>Număr de copii</Text>
            <View style={styles.peopleSelector}>
              {[0, 1, 2, 3, 4].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.peopleOption,
                    editGuestChildren === num && styles.peopleOptionActive,
                  ]}
                  onPress={() => setEditGuestChildren(num)}
                >
                  <Text
                    style={[
                      styles.peopleOptionText,
                      editGuestChildren === num && styles.peopleOptionTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.peopleOption,
                  styles.peopleOptionMore,
                  editGuestChildren === -1 && styles.peopleOptionActive,
                ]}
                onPress={() => setEditGuestChildren(-1)}
              >
                <Text
                  style={[
                    styles.peopleOptionText,
                    editGuestChildren === -1 && styles.peopleOptionTextActive,
                  ]}
                >
                  mai mult
                </Text>
              </TouchableOpacity>
            </View>
            {editGuestChildren === -1 && (
              <TextInput
                style={styles.input}
                placeholder="Introdu numărul"
                value={editGuestChildrenCustom}
                onChangeText={setEditGuestChildrenCustom}
                keyboardType="number-pad"
                autoFocus
              />
            )}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setEditGuestHasSpecialMenu(!editGuestHasSpecialMenu)}
              >
                {editGuestHasSpecialMenu && <Check size={20} color={Colors.primary} />}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Meniu special (vegan, lactovegetarian, alergii)</Text>
            </View>
            {editGuestHasSpecialMenu && (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex: Vegan, Alergic la nuci, Lactovegetarian"
                value={editGuestSpecialMenuNotes}
                onChangeText={setEditGuestSpecialMenuNotes}
                multiline
                numberOfLines={3}
              />
            )}
            
            <TouchableOpacity
              style={styles.deleteButtonLarge}
              onPress={handleDeleteFromEdit}
            >
              <Trash2 size={20} color={Colors.error} />
              <Text style={styles.deleteButtonText}>Șterge Invitatul</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditSubmit}
              >
                <Text style={styles.saveButtonText}>Salvează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={tableGuestsModalVisible}
        onRequestClose={() => setTableGuestsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { flex: 1, textAlign: "left", marginBottom: 0 }]}>
                Invitați la Masa {tables.find(t => t.id === selectedTableId)?.number || ''}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setTableGuestsModalVisible(false)}
              >
                <X size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              {tables.find(t => t.id === selectedTableId)?.seats || 0} locuri disponibile
            </Text>
            
            <View style={styles.tableGuestsList}>
              {guests
                .filter(g => g.tableId === selectedTableId)
                .map((guest) => (
                  <View key={guest.id} style={styles.tableGuestCard}>
                    <View style={styles.tableGuestAvatar}>
                      <User size={16} color={Colors.primary} />
                    </View>
                    <View style={styles.tableGuestInfo}>
                      <Text style={styles.tableGuestName}>{guest.name}</Text>
                      <Text style={styles.tableGuestDetails}>
                        {guest.numberOfPeople + guest.numberOfChildren} persoane
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeFromTableButton}
                      onPress={() => {
                        Alert.alert(
                          "Elimină de la masă",
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
                    >
                      <X size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              {guests.filter(g => g.tableId === selectedTableId).length === 0 && (
                <Text style={styles.emptyTableText}>Niciun invitat alocat la această masă</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={() => setTableGuestsModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrează Invitați</Text>
            
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setActiveFilters(prev => ({ ...prev, noTable: !prev.noTable }))}
            >
              <View style={styles.filterCheckbox}>
                {activeFilters.noTable && <Check size={20} color={Colors.primary} />}
              </View>
              <Text style={styles.filterOptionText}>Fără masă alocată</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setActiveFilters(prev => ({ ...prev, withChildren: !prev.withChildren }))}
            >
              <View style={styles.filterCheckbox}>
                {activeFilters.withChildren && <Check size={20} color={Colors.primary} />}
              </View>
              <Text style={styles.filterOptionText}>Cu copii</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setActiveFilters(prev => ({ ...prev, specialMenu: !prev.specialMenu }))}
            >
              <View style={styles.filterCheckbox}>
                {activeFilters.specialMenu && <Check size={20} color={Colors.primary} />}
              </View>
              <Text style={styles.filterOptionText}>Meniu special</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setActiveFilters(prev => ({ ...prev, groupByTable: !prev.groupByTable }))}
            >
              <View style={styles.filterCheckbox}>
                {activeFilters.groupByTable && <Check size={20} color={Colors.primary} />}
              </View>
              <Text style={styles.filterOptionText}>Grupați pe masă</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setActiveFilters({
                    noTable: false,
                    withChildren: false,
                    specialMenu: false,
                    groupByTable: false,
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Resetează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Aplică</Text>
              </TouchableOpacity>
            </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statColumn: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  statsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: {
    padding: 20,
  },
  guestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0Fdf4", // Light green bg
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  guestDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  invitationSentButton: {
    backgroundColor: Colors.primary,
  },
  invitationPendingButton: {
    backgroundColor: "#F0F4FF",
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.error,
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
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: Colors.text,
    textAlign: "center",
  },
  input: {
    height: 50,
    backgroundColor: "#F8FAF9",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  segmentedControl: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: "#FFF",
  },
  sideSelector: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  sideButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderColor: "#F1F5F9",
  },
  sideButtonActive: {
    backgroundColor: "#FFF",
    borderColor: Colors.primary,
  },
  sideButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  sideButtonTextActive: {
    color: Colors.primary,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  statusModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  statusModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  statusModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  statusModalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F8FAF9",
    marginBottom: 12,
  },
  statusOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  peopleSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  peopleOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F1F5F9",
  },
  peopleOptionMore: {
    flex: 1,
    minWidth: 100,
  },
  peopleOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  peopleOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  peopleOptionTextActive: {
    color: "#FFF",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  specialMenuBadge: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#F8FAF9",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  tableBadgeContainer: {
    marginTop: 4,
  },
  tableBadge: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  noTableBadge: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tableGuestsList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  tableGuestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableGuestAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  tableGuestInfo: {
    flex: 1,
  },
  tableGuestName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  tableGuestDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  removeFromTableButton: {
    padding: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  emptyTableText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F8FAF9",
    marginBottom: 12,
  },
  filterCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
});
