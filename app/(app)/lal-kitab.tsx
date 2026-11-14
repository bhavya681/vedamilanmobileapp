import React from "react";

import { ReportScreen } from "@/components/ReportScreen";
import { useLalKitab } from "@/hooks/useAstrology";

export default function LalKitabScreen() {
  const query = useLalKitab(true);
  return (
    <ReportScreen
      title="Lal Kitab"
      subtitle="Traditional remedial perspective"
      query={{
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: () => void query.refetch(),
      }}
    />
  );
}
