"use client";

import * as React from "react";

import { CardGridSkeleton } from "@/components/common/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { ProspectingForm } from "@/components/settings/prospecting-form";
import { ServicesSection } from "@/components/settings/services-section";
import { getSettings } from "@/services/settings";
import type { ProspectingPreferences, ServiceOffering } from "@/types";

export default function SettingsPage() {
  const [prospecting, setProspecting] =
    React.useState<ProspectingPreferences | null>(null);
  const [services, setServices] = React.useState<ServiceOffering[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    void getSettings().then((settings) => {
      if (!active) return;
      setProspecting(settings.prospecting);
      setServices(settings.services);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Ajuste seu perfil, os padrões de prospecção e o catálogo de serviços."
      />

      <div className="max-w-4xl space-y-6">
        <ProfileForm />

        {isLoading || !prospecting ? (
          <CardGridSkeleton count={2} className="md:grid-cols-1 xl:grid-cols-1" />
        ) : (
          <>
            <ProspectingForm
              preferences={prospecting}
              onSaved={setProspecting}
            />
            <ServicesSection services={services} onChange={setServices} />
          </>
        )}
      </div>
    </div>
  );
}
