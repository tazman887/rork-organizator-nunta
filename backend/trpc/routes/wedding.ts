import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

const DB_ENDPOINT = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
const DB_NAMESPACE = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
const DB_TOKEN = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;

async function dbQuery(query: string) {
  if (!DB_ENDPOINT || !DB_TOKEN) {
    console.error("Database configuration missing", { DB_ENDPOINT: !!DB_ENDPOINT, DB_TOKEN: !!DB_TOKEN });
    throw new Error("Database configuration missing");
  }

  const response = await fetch(`${DB_ENDPOINT}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "Accept": "application/json",
      "Authorization": `Bearer ${DB_TOKEN}`,
      "surreal-ns": DB_NAMESPACE || "default",
      "surreal-db": "wedding",
    },
    body: query,
  });

  if (!response.ok) {
    console.error("DB Error:", await response.text());
    throw new Error("Database query failed");
  }

  const result = await response.json();
  return result;
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

export const weddingRouter = createTRPCRouter({
  getData: publicProcedure.query(async () => {
    try {
      const result = await dbQuery(`
        SELECT * FROM wedding_data:main;
      `);

      console.log("getData result:", JSON.stringify(result));

      const data = result?.[0]?.result?.[0];
      if (data) {
        return {
          weddingState: data.weddingState || { weddingDate: null, partnerName1: "", partnerName2: "" },
          tasks: data.tasks || [],
          guests: data.guests || [],
          expenses: data.expenses || [],
          tables: data.tables || [],
        };
      }

      return {
        weddingState: { weddingDate: null, partnerName1: "", partnerName2: "" },
        tasks: [],
        guests: [],
        expenses: [],
        tables: [],
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      return {
        weddingState: { weddingDate: null, partnerName1: "", partnerName2: "" },
        tasks: [],
        guests: [],
        expenses: [],
        tables: [],
      };
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
        };

        const query = `UPSERT wedding_data:main CONTENT ${JSON.stringify(content)};`;

        console.log("Saving data to cloud...");
        const result = await dbQuery(query);
        console.log("Save result:", JSON.stringify(result));

        return { success: true };
      } catch (error) {
        console.error("Error saving data:", error);
        throw new Error("Failed to save data");
      }
    }),
});
