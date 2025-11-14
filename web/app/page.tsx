"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [message, setMessage] = useState("Checking Supabase…");

  useEffect(() => {
    const testSupabase = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setMessage("Supabase error: " + error.message);
      } else {
        setMessage("Supabase connected ✔ (no session yet)");
      }
    };

    testSupabase();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-6 border rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2">CityFix QR – Web</h1>
        <p>{message}</p>
      </div>
    </main>
  );
}
