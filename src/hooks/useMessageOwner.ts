import { useEffect, useState } from "react";
import { assignSampleEvents } from "@/api/messageDraw";
import { supabase } from "@/lib/supabase";

// The management route is already protected. Scope local fixtures to its signed-in user.
export function useMessageOwner() {
  const [owner, setOwner] = useState("");
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id ?? "";
      assignSampleEvents(id);
      setOwner(id);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return owner;
}
