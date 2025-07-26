import { supabase } from "../lib/initSupabase";
import bcrypt from "bcryptjs";

const SCRIBBLING_ROOM_TABLE = "scribble-rooms";
const ROOM_STROKES_TABLE = "room_strokes";

export interface StrokeData {
  stroke_id: string;
  room_id: string;
  user_id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

export async function createScribbleRoom(
  name: string,
  userId: string,
  isPublic: boolean,
  isPasswordProtected: boolean = false,
  password: string | null = null
) {
  let hashedPassword = null;

  if (isPasswordProtected && password) {
    const salt = bcrypt.genSaltSync(10);
    hashedPassword = bcrypt.hashSync(password, salt);
  }

  const { data } = await supabase
    .from(SCRIBBLING_ROOM_TABLE)
    .insert({
      name,
      owner: userId,
      isPublic,
      isPasswordProtected,
      password: hashedPassword,
    })
    .select();

  return data;
}

export async function deleteScribbleRoom(roomId: string, userId: string) {
  const { data, error } = await supabase
    .from(SCRIBBLING_ROOM_TABLE)
    .delete()
    .match({ id: roomId, owner: userId });

  if (error) {
    console.error("Failed to delete Scribble room.", error);
  }

  return data;
}

export async function fetchUserScribbleRooms(userId: string) {
  const { data } = await supabase
    .from(SCRIBBLING_ROOM_TABLE)
    .select()
    .eq("owner", userId)
    .order("created_at", { ascending: false });

  return data;
}

export async function fetchScribbleRoomById(id: string) {
  const { data } = await supabase
    .from(SCRIBBLING_ROOM_TABLE)
    .select()
    .eq("id", id);

  return data;
}

export async function clearRoomScribble(roomId: string) {
  await supabase
    .from(SCRIBBLING_ROOM_TABLE)
    .update({ scribble: null })
    .eq("id", roomId)
    .select();
}

export async function joinScribbleRoom(roomId: string, password: string) {
  const { data, error } = await supabase
    .from(SCRIBBLING_ROOM_TABLE)
    .select()
    .eq("id", roomId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.isPasswordProtected) {
    if (!password) {
      return { success: false, error: "Password is required for this room." };
    }

    const passwordMatch = bcrypt.compareSync(password, data.password);

    if (!passwordMatch) {
      return { success: false, error: "Incorrect password." };
    }
  }

  return { success: true, room: data };
}

export async function saveStroke(strokeData: StrokeData) {
  try {
    const { error } = await supabase.from(ROOM_STROKES_TABLE).insert({
      stroke_id: strokeData.stroke_id,
      room_id: strokeData.room_id,
      user_id: strokeData.user_id,
      points: strokeData.points,
      color: strokeData.color,
      size: strokeData.size,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function loadRoomStrokes(roomId: string) {
  try {
    const { data, error } = await supabase
      .from("room_strokes")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading strokes:", error);
      return { success: false, error, data: [] };
    }

    const strokes = data.map((row) => ({
      id: row.stroke_id,
      userId: row.user_id,
      points: row.points,
      color: row.color,
      size: row.size,
      timestamp: row.created_at,
    }));

    return { success: true, data: strokes };
  } catch (error) {
    console.error("Error loading strokes:", error);
    return { success: false, error, data: [] };
  }
}

export async function clearRoomStrokes(roomId: string) {
  try {
    const { error } = await supabase
      .from("room_strokes")
      .delete()
      .eq("room_id", roomId);

    if (error) {
      console.error("Error clearing strokes:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Error clearing strokes:", error);
    return { success: false, error };
  }
}
