import { BackLink } from "@/components/BackLink";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PricingTable } from "@/services/clerk/components/PricingTable";
import { AlertTriangleIcon } from "lucide-react";

export default function UpgradePage() {
  return (
    <div className="container py-4 max-w-6xl">
      <div className="mb-4">
        <BackLink href="/app">Dashboard</BackLink>
      </div>

      <Alert variant="warning">
        <AlertTriangleIcon />
        <AlertTitle>Plan Limit Reached</AlertTitle>

        <AlertDescription>
          You have reached the limit of your current plan. Please upgrade to
          continue using all features.
        </AlertDescription>
      </Alert>
      <PricingTable />
    </div>
  );
}
