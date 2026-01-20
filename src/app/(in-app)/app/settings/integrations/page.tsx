import { redirect } from "next/navigation";

// Redirect to the main integrations page
export default function IntegrationsSettingsPage() {
  redirect("/app/integrations");
}
