import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { useWedding } from "@/context/WeddingContext";
import { ChevronLeft, Calendar, Save, Download, Upload } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';

export default function SettingsScreen() {
  const { weddingState, updateWeddingDetails } = useWedding();
  const router = useRouter();

  const [partnerName1, setPartnerName1] = useState(weddingState.partnerName1);
  const [partnerName2, setPartnerName2] = useState(weddingState.partnerName2);
  const [weddingDate, setWeddingDate] = useState(weddingState.weddingDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    updateWeddingDetails({
      partnerName1,
      partnerName2,
      weddingDate,
    });
    router.back();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setWeddingDate(selectedDate);
    }
  };

  const handleExportData = async () => {
    try {
      const keys = [
        'wedding_state',
        'wedding_tasks',
        'wedding_guests',
        'wedding_budget',
        'wedding_tables'
      ];
      
      const dataToExport: { [key: string]: any } = {};
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          dataToExport[key] = JSON.parse(value);
        }
      }
      
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wedding-backup-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Succes', 'Backup-ul a fost descărcat cu succes!');
      } else {
        const file = new File(Paths.cache, `wedding-backup-${timestamp}.json`);
        file.create({ overwrite: true });
        file.write(jsonString);
        
        await Share.share({
          url: file.uri,
          message: 'Backup Planificator Nuntă',
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Eroare', 'Nu s-a putut crea backup-ul. Vă rugăm încercați din nou.');
    }
  };

  const handleImportData = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = async (event: any) => {
              try {
                const jsonData = JSON.parse(event.target.result);
                await restoreData(jsonData);
              } catch {
                Alert.alert('Eroare', 'Fișierul selectat nu este valid.');
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const file = new File(result.assets[0].uri);
          const fileContent = await file.text();
          const jsonData = JSON.parse(fileContent);
          await restoreData(jsonData);
        }
      }
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Eroare', 'Nu s-a putut importa backup-ul. Verificați dacă fișierul este valid.');
    }
  };

  const restoreData = async (jsonData: { [key: string]: any }) => {
    Alert.alert(
      'Importă Backup',
      'Ești sigur/ă că vrei să imporți acest backup? Datele curente vor fi înlocuite.',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Importă',
          onPress: async () => {
            try {
              for (const [key, value] of Object.entries(jsonData)) {
                await AsyncStorage.setItem(key, JSON.stringify(value));
              }
              Alert.alert(
                'Succes',
                'Backup-ul a fost importat cu succes! Aplicația se va reîncărca.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (Platform.OS === 'web') {
                        window.location.reload();
                      } else {
                        router.replace('/');
                      }
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error restoring data:', error);
              Alert.alert('Eroare', 'Nu s-a putut restaura backup-ul.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setări</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalii Nuntă</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nume Mire</Text>
            <TextInput
              style={styles.input}
              value={partnerName1}
              onChangeText={setPartnerName1}
              placeholder="Nume mire"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nume Mireasă</Text>
            <TextInput
              style={styles.input}
              value={partnerName2}
              onChangeText={setPartnerName2}
              placeholder="Nume mireasă"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data Nunții</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.dateButtonText}>
                {weddingDate.toLocaleDateString("ro-RO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={weddingDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {Platform.OS === 'ios' && showDatePicker && (
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.doneButtonText}>Gata</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date și Backup</Text>
          <Text style={styles.sectionDescription}>
            Salvează toate datele aplicației (invitați, mese, buget, sarcini) și restaurează-le când schimbi telefonul.
          </Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportData}
          >
            <View style={styles.actionButtonIcon}>
              <Download size={20} color={Colors.primary} />
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Exportă Date</Text>
              <Text style={styles.actionButtonSubtitle}>Salvează un backup al datelor tale</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleImportData}
          >
            <View style={styles.actionButtonIcon}>
              <Upload size={20} color={Colors.primary} />
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Importă Date</Text>
              <Text style={styles.actionButtonSubtitle}>Restaurează dintr-un backup anterior</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Despre Aplicație</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Versiune: 1.0.0</Text>
            <Text style={styles.infoText}>Planificator de Nuntă</Text>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.bottomSafeArea}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Save size={20} color="#FFF" />
            <Text style={styles.saveButtonText}>Salvează Modificările</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  dateButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  doneButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bottomSafeArea: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
