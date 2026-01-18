import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

const DB_ENDPOINT = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
const DB_NAMESPACE = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
const DB_TOKEN = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;

const DATA_KEY = "wedding_app_data";

async function dbGet(key: string) {
  if (!DB_ENDPOINT || !DB_TOKEN || !DB_NAMESPACE) {
    console.error("Database configuration missing");
    return null;
  }

  try {
    const response = await fetch(`${DB_ENDPOINT}/kv/${DB_NAMESPACE}/${key}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${DB_TOKEN}`,
      },
    });

    if (response.status === 404) {
      console.log("Key not found, returning null");
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DB GET Error:", errorText);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("DB GET Exception:", error);
    return null;
  }
}

async function dbSet(key: string, value: unknown) {
  if (!DB_ENDPOINT || !DB_TOKEN || !DB_NAMESPACE) {
    console.error("Database configuration missing");
    throw new Error("Database configuration missing");
  }

  const response = await fetch(`${DB_ENDPOINT}/kv/${DB_NAMESPACE}/${key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${DB_TOKEN}`,
    },
    body: JSON.stringify(value),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("DB SET Error:", errorText);
    throw new Error("Database save failed");
  }

  return true;
}

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  completed: z.boolean(),
});

const GuestSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["confirmed", "pending", "declined"]),
  numberOfPeople: z.number(),
  confirmedPeople: z.number(),
  numberOfChildren: z.number(),
  confirmedChildren: z.number(),
  side: z.enum(["groom", "bride"]),
  invitationSent: z.boolean(),
  specialMenuNotes: z.string(),
  tableId: z.string().optional(),
});

const ExpenseSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number(),
  category: z.string(),
});

const TableSchema = z.object({
  id: z.string(),
  number: z.number(),
  seats: z.number(),
});

const WeddingStateSchema = z.object({
  weddingDate: z.string().nullable(),
  partnerName1: z.string(),
  partnerName2: z.string(),
});

const defaultData = {
  weddingState: { weddingDate: null, partnerName1: "", partnerName2: "" },
  tasks: [],
  guests: [],
  expenses: [],
  tables: [],
};

export const weddingRouter = createTRPCRouter({
  getData: publicProcedure.query(async () => {
    try {
      console.log("Fetching wedding data...");
      const data = await dbGet(DATA_KEY);
      
      if (data) {
        console.log("Data found, returning...");
        return {
          weddingState: data.weddingState || defaultData.weddingState,
          tasks: data.tasks || [],
          guests: data.guests || [],
          expenses: data.expenses || [],
          tables: data.tables || [],
        };
      }

      console.log("No data found, returning defaults");
      return defaultData;
    } catch (error) {
      console.error("Error fetching data:", error);
      return defaultData;
    }
  }),

  saveData: publicProcedure
    .input(
      z.object({
        weddingState: WeddingStateSchema,
        tasks: z.array(TaskSchema),
        guests: z.array(GuestSchema),
        expenses: z.array(ExpenseSchema),
        tables: z.array(TableSchema),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const content = {
          weddingState: input.weddingState,
          tasks: input.tasks,
          guests: input.guests,
          expenses: input.expenses,
          tables: input.tables,
          updatedAt: new Date().toISOString(),
        };

        console.log("Saving data to cloud...");
        await dbSet(DATA_KEY, content);
        console.log("Data saved successfully");

        return { success: true };
      } catch (error) {
        console.error("Error saving data:", error);
        throw new Error("Failed to save data");
      }
    }),
});
