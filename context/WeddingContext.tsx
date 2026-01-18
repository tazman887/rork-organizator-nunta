import createContextHook from "@nkzw/create-context-hook";
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

export interface Guest {
  id: string;
  name: string;
  status: "confirmed" | "pending" | "declined";
  numberOfPeople: number;
  confirmedPeople: number;
  numberOfChildren: number;
  confirmedChildren: number;
  side: "groom" | "bride";
  invitationSent: boolean;
  specialMenuNotes: string;
  tableId?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
}

interface WeddingState {
  weddingDate: Date | null;
  partnerName1: string;
  partnerName2: string;
}

const STORAGE_KEYS = {
  STATE: "wedding_state",
  TASKS: "wedding_tasks",
  GUESTS: "wedding_guests",
  BUDGET: "wedding_budget",
  TABLES: "wedding_tables",
};

export const [WeddingProvider, useWedding] = createContextHook(() => {
  const queryClient = useQueryClient();

  // --- Wedding Details ---
  const weddingStateQuery = useQuery({
    queryKey: ["weddingState"],
    queryFn: async (): Promise<WeddingState> => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.STATE);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          weddingDate: parsed.weddingDate ? new Date(parsed.weddingDate) : null,
        };
      }
      return {
        weddingDate: null,
        partnerName1: "",
        partnerName2: "",
      };
    },
  });

  const updateWeddingStateMutation = useMutation({
    mutationFn: async (newState: WeddingState) => {
      await AsyncStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(newState));
      return newState;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["weddingState"], data);
    },
  });

  const updateWeddingDetails = (newState: Partial<WeddingState>) => {
    const currentState = weddingStateQuery.data || {
      weddingDate: null,
      partnerName1: "",
      partnerName2: "",
    };
    updateWeddingStateMutation.mutate({ ...currentState, ...newState });
  };

  // --- Tasks ---
  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<Task[]> => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (stored) return JSON.parse(stored);
      return [];
    },
  });

  const updateTasksMutation = useMutation({
    mutationFn: async (newTasks: Task[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
      return newTasks;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tasks"], data);
    },
  });

  const toggleTask = (taskId: string) => {
    const currentTasks = tasksQuery.data || [];
    const newTasks = currentTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateTasksMutation.mutate(newTasks);
  };

  const addTask = (title: string, category: string) => {
    const currentTasks = tasksQuery.data || [];
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      category,
      completed: false,
    };
    updateTasksMutation.mutate([...currentTasks, newTask]);
  };

  // --- Guests ---
  const guestsQuery = useQuery({
    queryKey: ["guests"],
    queryFn: async (): Promise<Guest[]> => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.GUESTS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const updateGuestsMutation = useMutation({
    mutationFn: async (newGuests: Guest[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(newGuests));
      return newGuests;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["guests"], data);
    },
  });

  const addGuest = (name: string, side: "groom" | "bride", numberOfPeople: number = 1, numberOfChildren: number = 0, specialMenuNotes: string = "") => {
    const currentGuests = guestsQuery.data || [];
    const newGuest: Guest = {
      id: Date.now().toString(),
      name,
      status: "pending",
      numberOfPeople,
      confirmedPeople: 0,
      numberOfChildren,
      confirmedChildren: 0,
      side,
      invitationSent: false,
      specialMenuNotes,
    };
    updateGuestsMutation.mutate([...currentGuests, newGuest]);
  };

  const updateGuestStatus = (id: string, status: Guest["status"], confirmedPeople?: number, confirmedChildren?: number) => {
    const currentGuests = guestsQuery.data || [];
    const newGuests = currentGuests.map((g) => {
      if (g.id === id) {
        const updatedGuest = { 
          ...g, 
          status, 
          confirmedPeople: confirmedPeople !== undefined ? confirmedPeople : (status === 'confirmed' ? g.numberOfPeople : 0),
          confirmedChildren: confirmedChildren !== undefined ? confirmedChildren : (status === 'confirmed' ? g.numberOfChildren : 0)
        };

        if (status === 'declined') {
          updatedGuest.tableId = undefined;
        }

        return updatedGuest;
      }
      return g;
    });
    updateGuestsMutation.mutate(newGuests);
  };

  const deleteGuest = (id: string) => {
    const currentGuests = guestsQuery.data || [];
    const newGuests = currentGuests.filter((g) => g.id !== id);
    updateGuestsMutation.mutate(newGuests);
  };

  const updateGuest = (id: string, name: string, side: "groom" | "bride", numberOfPeople: number, numberOfChildren: number, specialMenuNotes: string) => {
    const currentGuests = guestsQuery.data || [];
    const newGuests = currentGuests.map((g) =>
      g.id === id ? { ...g, name, side, numberOfPeople, numberOfChildren, specialMenuNotes } : g
    );
    updateGuestsMutation.mutate(newGuests);
  };

  const toggleInvitationSent = (id: string) => {
    const currentGuests = guestsQuery.data || [];
    const newGuests = currentGuests.map((g) =>
      g.id === id ? { ...g, invitationSent: !g.invitationSent } : g
    );
    updateGuestsMutation.mutate(newGuests);
  };

  // --- Budget ---
  const budgetQuery = useQuery({
    queryKey: ["budget"],
    queryFn: async (): Promise<Expense[]> => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.BUDGET);
      if (stored) return JSON.parse(stored);
      return [];
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async (newExpenses: Expense[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(newExpenses));
      return newExpenses;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["budget"], data);
    },
  });

  const addExpense = (title: string, amount: number, category: string) => {
    const currentExpenses = budgetQuery.data || [];
    const newExpense: Expense = {
      id: Date.now().toString(),
      title,
      amount,
      category,
    };
    updateBudgetMutation.mutate([...currentExpenses, newExpense]);
  };

  const totalBudget = useMemo(() => {
    return (budgetQuery.data || []).reduce((acc, curr) => acc + curr.amount, 0);
  }, [budgetQuery.data]);

  // --- Tables ---
  const tablesQuery = useQuery({
    queryKey: ["tables"],
    queryFn: async (): Promise<Table[]> => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TABLES);
      if (stored) return JSON.parse(stored);
      return [];
    },
  });

  const updateTablesMutation = useMutation({
    mutationFn: async (newTables: Table[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(newTables));
      return newTables;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tables"], data);
    },
  });

  const addTable = (number: number, seats: number) => {
    const currentTables = tablesQuery.data || [];
    const newTable: Table = {
      id: Date.now().toString(),
      number,
      seats,
    };
    updateTablesMutation.mutate([...currentTables, newTable]);
  };

  const deleteTable = (id: string) => {
    const currentTables = tablesQuery.data || [];
    const newTables = currentTables.filter((t) => t.id !== id);
    updateTablesMutation.mutate(newTables);
    
    const currentGuests = guestsQuery.data || [];
    const updatedGuests = currentGuests.map((g) =>
      g.tableId === id ? { ...g, tableId: undefined } : g
    );
    updateGuestsMutation.mutate(updatedGuests);
  };

  const assignGuestToTable = (guestId: string, tableId: string | undefined) => {
    const currentGuests = guestsQuery.data || [];
    const newGuests = currentGuests.map((g) =>
      g.id === guestId ? { ...g, tableId } : g
    );
    updateGuestsMutation.mutate(newGuests);
  };

  return {
    weddingState: weddingStateQuery.data || {
      weddingDate: null,
      partnerName1: "",
      partnerName2: "",
    },
    tasks: tasksQuery.data || [],
    guests: guestsQuery.data || [],
    expenses: budgetQuery.data || [],
    tables: tablesQuery.data || [],
    totalBudget,
    toggleTask,
    addTask,
    addGuest,
    updateGuestStatus,
    deleteGuest,
    updateGuest,
    toggleInvitationSent,
    addExpense,
    addTable,
    deleteTable,
    assignGuestToTable,
    isLoading: tasksQuery.isLoading || guestsQuery.isLoading || budgetQuery.isLoading || weddingStateQuery.isLoading || tablesQuery.isLoading,
    updateWeddingDetails,
  };
});
