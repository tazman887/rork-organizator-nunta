import createContextHook from "@nkzw/create-context-hook";
import { useMemo, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

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

export const [WeddingProvider, useWedding] = createContextHook(() => {
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dataQuery = trpc.wedding.getData.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 1000 * 30,
  });

  const saveMutation = trpc.wedding.saveData.useMutation({
    onSuccess: () => {
      console.log("Data saved to cloud successfully");
    },
    onError: (error) => {
      console.error("Failed to save data to cloud:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
    },
    retry: 2,
    retryDelay: 1000,
  });

  const weddingState: WeddingState = useMemo(() => {
    const state = dataQuery.data?.weddingState;
    return {
      weddingDate: state?.weddingDate ? new Date(state.weddingDate) : null,
      partnerName1: state?.partnerName1 || "",
      partnerName2: state?.partnerName2 || "",
    };
  }, [dataQuery.data?.weddingState]);

  const tasks: Task[] = useMemo(() => {
    return dataQuery.data?.tasks || [];
  }, [dataQuery.data?.tasks]);

  const guests: Guest[] = useMemo(() => {
    return dataQuery.data?.guests || [];
  }, [dataQuery.data?.guests]);

  const expenses: Expense[] = useMemo(() => {
    return dataQuery.data?.expenses || [];
  }, [dataQuery.data?.expenses]);

  const tables: Table[] = useMemo(() => {
    return dataQuery.data?.tables || [];
  }, [dataQuery.data?.tables]);

  const saveToCloud = useCallback((data: {
    weddingState: { weddingDate: string | null; partnerName1: string; partnerName2: string };
    tasks: Task[];
    guests: Guest[];
    expenses: Expense[];
    tables: Table[];
  }) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      console.log("Saving to cloud...");
      saveMutation.mutate(data);
    }, 500);
  }, [saveMutation]);

  const updateLocalAndSave = useCallback((updates: Partial<{
    weddingState: { weddingDate: string | null; partnerName1: string; partnerName2: string };
    tasks: Task[];
    guests: Guest[];
    expenses: Expense[];
    tables: Table[];
  }>) => {
    const currentData = dataQuery.data || {
      weddingState: { weddingDate: null, partnerName1: "", partnerName2: "" },
      tasks: [],
      guests: [],
      expenses: [],
      tables: [],
    };

    const newData = {
      weddingState: updates.weddingState || currentData.weddingState,
      tasks: updates.tasks || currentData.tasks,
      guests: updates.guests || currentData.guests,
      expenses: updates.expenses || currentData.expenses,
      tables: updates.tables || currentData.tables,
    };

    queryClient.setQueryData([["wedding", "getData"], { type: "query" }], newData);
    saveToCloud(newData);
  }, [dataQuery.data, queryClient, saveToCloud]);

  const updateWeddingDetails = useCallback((newState: Partial<WeddingState>) => {
    const currentState = dataQuery.data?.weddingState || {
      weddingDate: null,
      partnerName1: "",
      partnerName2: "",
    };

    const updatedState = {
      weddingDate: newState.weddingDate !== undefined 
        ? (newState.weddingDate?.toISOString() || null)
        : currentState.weddingDate,
      partnerName1: newState.partnerName1 !== undefined ? newState.partnerName1 : currentState.partnerName1,
      partnerName2: newState.partnerName2 !== undefined ? newState.partnerName2 : currentState.partnerName2,
    };

    updateLocalAndSave({ weddingState: updatedState });
  }, [dataQuery.data?.weddingState, updateLocalAndSave]);

  const toggleTask = useCallback((taskId: string) => {
    const currentTasks = dataQuery.data?.tasks || [];
    const newTasks = currentTasks.map((t: Task) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateLocalAndSave({ tasks: newTasks });
  }, [dataQuery.data?.tasks, updateLocalAndSave]);

  const addTask = useCallback((title: string, category: string) => {
    const currentTasks = dataQuery.data?.tasks || [];
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      category,
      completed: false,
    };
    updateLocalAndSave({ tasks: [...currentTasks, newTask] });
  }, [dataQuery.data?.tasks, updateLocalAndSave]);

  const addGuest = useCallback((name: string, side: "groom" | "bride", numberOfPeople: number = 1, numberOfChildren: number = 0, specialMenuNotes: string = "") => {
    const currentGuests = dataQuery.data?.guests || [];
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
    updateLocalAndSave({ guests: [...currentGuests, newGuest] });
  }, [dataQuery.data?.guests, updateLocalAndSave]);

  const updateGuestStatus = useCallback((id: string, status: Guest["status"], confirmedPeople?: number, confirmedChildren?: number) => {
    const currentGuests = dataQuery.data?.guests || [];
    const newGuests = currentGuests.map((g: Guest) => {
      if (g.id === id) {
        const updatedGuest: Guest = { 
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
    updateLocalAndSave({ guests: newGuests });
  }, [dataQuery.data?.guests, updateLocalAndSave]);

  const deleteGuest = useCallback((id: string) => {
    const currentGuests = dataQuery.data?.guests || [];
    const newGuests = currentGuests.filter((g: Guest) => g.id !== id);
    updateLocalAndSave({ guests: newGuests });
  }, [dataQuery.data?.guests, updateLocalAndSave]);

  const updateGuest = useCallback((id: string, name: string, side: "groom" | "bride", numberOfPeople: number, numberOfChildren: number, specialMenuNotes: string) => {
    const currentGuests = dataQuery.data?.guests || [];
    const newGuests = currentGuests.map((g: Guest) =>
      g.id === id ? { ...g, name, side, numberOfPeople, numberOfChildren, specialMenuNotes } : g
    );
    updateLocalAndSave({ guests: newGuests });
  }, [dataQuery.data?.guests, updateLocalAndSave]);

  const toggleInvitationSent = useCallback((id: string) => {
    const currentGuests = dataQuery.data?.guests || [];
    const newGuests = currentGuests.map((g: Guest) =>
      g.id === id ? { ...g, invitationSent: !g.invitationSent } : g
    );
    updateLocalAndSave({ guests: newGuests });
  }, [dataQuery.data?.guests, updateLocalAndSave]);

  const addExpense = useCallback((title: string, amount: number, category: string) => {
    const currentExpenses = dataQuery.data?.expenses || [];
    const newExpense: Expense = {
      id: Date.now().toString(),
      title,
      amount,
      category,
    };
    updateLocalAndSave({ expenses: [...currentExpenses, newExpense] });
  }, [dataQuery.data?.expenses, updateLocalAndSave]);

  const totalBudget = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const addTable = useCallback((number: number, seats: number) => {
    const currentTables = dataQuery.data?.tables || [];
    const newTable: Table = {
      id: Date.now().toString(),
      number,
      seats,
    };
    updateLocalAndSave({ tables: [...currentTables, newTable] });
  }, [dataQuery.data?.tables, updateLocalAndSave]);

  const deleteTable = useCallback((id: string) => {
    const currentTables = dataQuery.data?.tables || [];
    const newTables = currentTables.filter((t: Table) => t.id !== id);
    
    const currentGuests = dataQuery.data?.guests || [];
    const updatedGuests = currentGuests.map((g: Guest) =>
      g.tableId === id ? { ...g, tableId: undefined } : g
    );
    
    updateLocalAndSave({ tables: newTables, guests: updatedGuests });
  }, [dataQuery.data?.tables, dataQuery.data?.guests, updateLocalAndSave]);

  const assignGuestToTable = useCallback((guestId: string, tableId: string | undefined) => {
    const currentGuests = dataQuery.data?.guests || [];
    const newGuests = currentGuests.map((g: Guest) =>
      g.id === guestId ? { ...g, tableId } : g
    );
    updateLocalAndSave({ guests: newGuests });
  }, [dataQuery.data?.guests, updateLocalAndSave]);

  const refetchData = useCallback(() => {
    dataQuery.refetch();
  }, [dataQuery]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    weddingState,
    tasks,
    guests,
    expenses,
    tables,
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
    isLoading: dataQuery.isLoading,
    isSaving: saveMutation.isPending,
    updateWeddingDetails,
    refetchData,
  };
});
