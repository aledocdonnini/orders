import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import HeaderAuth from "@/components/header-auth";
import { EnvVarWarning } from "@/components/env-var-warning";
export default function Header() {
  return (
    <div>
      <div className="flex items-center justify-center mt-[15vh] mb-10">
        <div className="text-center">
          <h1 className="text-6xl font-bold">Orders</h1>
          <p className="text-3xl">The fastest way to create orders</p>
        </div>
      </div>
      {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
    </div>
  );
}
