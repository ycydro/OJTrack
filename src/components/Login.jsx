import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "../lib/helper/supabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import "boxicons";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
      }}
    >
      <div style={{ width: 320 }}>
        <Auth
          supabaseClient={supabase}
          providers={["google"]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#4285F4",
                  brandAccent: "#3367D6",
                },
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                social_provider_text: "Sign in with Google",
              },
            },
          }}
          onlyThirdPartyProviders={true}
          view="sign_in"
        />
      </div>
    </div>
  );
};

export default Login;
