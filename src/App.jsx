import React, { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "./lib/helper/supabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

const App = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(session);
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [session]);

  return (
    <main className="w-100 vh-100 bg-black bg-gradient text-white">
      {!user ? <Login /> : <Dashboard setUser={setUser} user={user} />}
    </main>
  );
};

export default App;
