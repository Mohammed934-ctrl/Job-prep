import { BackLink } from "@/components/ui/BackLink";
import { Card, CardContent } from "@/components/ui/card";
import { JobInform } from "@/features/jobInfos/components/jobInfoform";

export default function JobInfonewPage() {
  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <BackLink href="/app">Dashboard</BackLink>
      <h1 className="text-3xl md:text-4xl">Create New Job Description</h1>
      <Card>
        <CardContent>
          <JobInform />
        </CardContent>
      </Card>
    </div>
  );
}
