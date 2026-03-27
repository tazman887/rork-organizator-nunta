import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useWedding, Task } from "@/context/WeddingContext";
import { Check, Plus } from "lucide-react-native";

export default function TasksScreen() {
  const { tasks, toggleTask, addTask } = useWedding();
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      Alert.alert(
        "Adaugă Sarcină",
        `Ești sigur/ă că vrei să adaugi sarcina "${newTaskTitle.trim()}"?`,
        [
          { text: "Anulează", style: "cancel" },
          {
            text: "Adaugă",
            onPress: () => {
              addTask(newTaskTitle.trim(), "General");
              setNewTaskTitle("");
            },
          },
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskCard, item.completed && styles.taskCardCompleted]}
      onPress={() => {
        Alert.alert(
          item.completed ? "Marchează ca Incompletă" : "Marchează ca Completă",
          `Ești sigur/ă că vrei să ${item.completed ? 'anulezi completarea' : 'completezi'} sarcina "${item.title}"?`,
          [
            { text: "Anulează", style: "cancel" },
            { text: "Da", onPress: () => toggleTask(item.id) },
          ]
        );
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
        {item.completed && <Check size={14} color="#FFF" />}
      </View>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
          {item.title}
        </Text>
        <Text style={styles.taskCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lista de Sarcini</Text>
        <Text style={styles.headerSubtitle}>
          {tasks.filter(t => t.completed).length}/{tasks.length} Complete
        </Text>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={styles.inputContainerWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Adaugă o sarcină nouă..."
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.addButton, !newTaskTitle.trim() && styles.addButtonDisabled]}
            onPress={handleAddTask}
            disabled={!newTaskTitle.trim()}
          >
            <Plus size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  taskCardCompleted: {
    backgroundColor: "#F8FAF9",
    borderColor: "transparent",
    opacity: 0.8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textSecondary,
  },
  taskCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inputContainerWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.surface,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 12,
    color: Colors.text,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: Colors.tabIconDefault,
    shadowOpacity: 0,
  },
});
