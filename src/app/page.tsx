import AuthProtector from "@/components/auth-protector";
import Dashboard from "@/components/dashboard";

export default function Home() {
  return (
    <AuthProtector>
      <Dashboard />
    </AuthProtector>
  );
}
