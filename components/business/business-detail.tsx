"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Loader2, Plus, Send } from "lucide-react";

import { BusinessInfoCard } from "@/components/business/business-info-card";
import { ContactsCard } from "@/components/business/contacts-card";
import { DealDialog } from "@/components/deals/deal-dialog";
import { DealsOfBusinessCard } from "@/components/deals/deals-of-business-card";
import { OpportunityAnalysis } from "@/components/business/opportunity-analysis";
import { PitchCard } from "@/components/business/pitch-card";
import { RecommendedServiceCard } from "@/components/business/recommended-service-card";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { LeadScore } from "@/components/common/lead-score";
import { DetailSkeleton } from "@/components/common/loading-state";
import { StatusBadge } from "@/components/common/status-badge";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCategoryLabel } from "@/data/categories";
import { analyzeBusiness } from "@/services/ai";
import { enrichBusiness, getBusiness } from "@/services/businesses";
import { useDeals } from "@/store/deals-store";
import { useServices } from "@/store/services-store";
import type { Business, BusinessAnalysis, Contact, DealInput } from "@/types";

type ContactChannel = "whatsapp" | "direto";

interface BusinessDetailProps {
  businessId: string;
}

export function BusinessDetail({ businessId }: BusinessDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { dealsOfBusiness, openDealOfBusiness, addDeal, registerContact } =
    useDeals();
  const { catalog, isLoading: isLoadingCatalog } = useServices();

  const [business, setBusiness] = React.useState<Business | null>(null);
  const [analysis, setAnalysis] = React.useState<BusinessAnalysis | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddingDeal, setIsAddingDeal] = React.useState(false);
  const [isContacting, setIsContacting] = React.useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = React.useState(false);
  const [isEnriching, setIsEnriching] = React.useState(false);
  const [hasEnriched, setHasEnriched] = React.useState(false);
  const [primaryContact, setPrimaryContact] = React.useState<Contact | null>(
    null
  );
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [isDealDialogOpen, setIsDealDialogOpen] = React.useState(false);

  React.useEffect(() => {
    // A análise usa o serviço recomendado, então espera o catálogo chegar —
    // sem ele o texto sairia sem preço nem nome de serviço.
    if (isLoadingCatalog) return;

    let active = true;

    async function load() {
      setIsLoading(true);
      setHasEnriched(false);

      const businessResult = await getBusiness(businessId);
      const analysisResult = businessResult
        ? await analyzeBusiness(businessResult, catalog)
        : null;

      if (!active) return;
      setBusiness(businessResult);
      setAnalysis(analysisResult);
      setIsLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [businessId, catalog, isLoadingCatalog]);

  const deals = dealsOfBusiness(businessId);
  const deal = openDealOfBusiness(businessId);

  async function handleAddDeal(input: DealInput) {
    setIsAddingDeal(true);
    try {
      const created = await addDeal(input);
      toast({
        title: "Negócio aberto",
        description: `${created.title} está na etapa Novo do funil.`,
        variant: "success",
      });
    } finally {
      setIsAddingDeal(false);
    }
  }

  async function handleEnrich() {
    if (!business) return;
    setIsEnriching(true);
    try {
      const { instagram, email } = await enrichBusiness(business.id);
      setBusiness({ ...business, instagram, email });
      setHasEnriched(true);

      const found = [instagram && "Instagram", email && "e-mail"].filter(
        Boolean
      );
      toast({
        title: found.length ? `Encontramos ${found.join(" e ")}` : "Nada encontrado",
        description: found.length
          ? "Os dados de contato foram adicionados à ficha da empresa."
          : business.website
            ? "O site da empresa não expõe perfil social nem e-mail de contato."
            : "A empresa não possui site, então não há onde procurar. Preencha manualmente se souber o perfil.",
        variant: found.length ? "success" : "info",
      });
    } catch {
      toast({
        title: "Não foi possível buscar os dados de contato",
        variant: "error",
      });
    } finally {
      setIsEnriching(false);
    }
  }

  async function handleContact(channel: ContactChannel) {
    if (!business) return;
    setIsContacting(true);
    try {
      // Registrar contato sem negócio aberto abre um: o contato precisa de
      // algum negócio a que pertencer no histórico.
      const target =
        deal ??
        (await addDeal({
          businessId: business.id,
          title: "",
          serviceId: business.recommendedServiceId,
          contactId: primaryContact?.id ?? null,
        }));
      await registerContact(target.id);

      // Havendo contato principal, o registro cita a pessoa e o número dela.
      // Sem contato cadastrado, sobra o telefone geral da empresa.
      const destination =
        primaryContact?.whatsapp ?? primaryContact?.phone ?? business.phone;
      const who = primaryContact
        ? `${primaryContact.name} (${destination})`
        : destination;

      toast({
        title:
          channel === "whatsapp"
            ? "Mensagem preparada para envio"
            : "Contato registrado",
        description:
          channel === "whatsapp"
            ? `O envio real pelo WhatsApp para ${who} será conectado na integração.`
            : `${business.name} avançou para a etapa Contatado.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Não foi possível registrar o contato",
        description: "Tente novamente em alguns instantes.",
        variant: "error",
      });
    } finally {
      setIsContacting(false);
    }
  }

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!business || !analysis) {
    return (
      <Card>
        <EmptyState
          icon={Building2}
          title="Empresa não encontrada"
          description="A empresa que você tentou abrir não está mais disponível na base de prospecção."
          action={
            <Button variant="outline" asChild>
              <Link href="/empresas/buscar">Voltar para a busca</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="[--card-spacing:--spacing(6)]">
        <div className="flex flex-col gap-6 px-(--card-spacing) lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-2xl font-medium tracking-tight text-balance">
                {business.name}
              </h1>
              {deal ? <StatusBadge status={deal.status} /> : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {getCategoryLabel(business.category)} · {business.city},{" "}
              {business.state}
            </p>
            <LeadScore
              score={business.score}
              size="lg"
              showMax
              showLabel
              className="pt-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {deal ? (
              <>
                <Button asChild>
                  <Link href={`/negocios/${deal.id}`}>Ver negócio aberto</Link>
                </Button>
                {/*
                  Ter um negócio aberto não impede abrir outro — renovação e
                  upsell acontecem em paralelo. Enquanto esta ação só existia
                  no card lá embaixo, ela era invisível na prática.
                */}
                <Button
                  variant="outline"
                  onClick={() => setIsDealDialogOpen(true)}
                  disabled={isAddingDeal}
                >
                  {isAddingDeal ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plus data-icon="inline-start" />
                  )}
                  Abrir outro
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsDealDialogOpen(true)}
                disabled={isAddingDeal}
              >
                {isAddingDeal ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Plus data-icon="inline-start" />
                )}
                Abrir negócio
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsContactDialogOpen(true)}
              disabled={isContacting}
            >
              <Send data-icon="inline-start" />
              Contatar
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft data-icon="inline-start" />
              Voltar
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_21rem]">
        <BusinessInfoCard
          business={business}
          className="lg:col-start-1 lg:row-start-1"
          isEnriching={isEnriching}
          hasEnriched={hasEnriched}
          onEnrich={() => void handleEnrich()}
        />
        <OpportunityAnalysis
          summary={analysis.summary}
          indicators={analysis.indicators}
          className="lg:col-start-1 lg:row-start-2"
        />
        <RecommendedServiceCard
          service={analysis.service}
          reasons={analysis.reasons}
          isInCrm={Boolean(deal)}
          isPending={isAddingDeal}
          onAddToCrm={() => setIsDealDialogOpen(true)}
          className="lg:col-start-2 lg:row-start-2"
        />
        <ContactsCard
          businessId={business.id}
          onPrimaryChange={setPrimaryContact}
          onContactsChange={setContacts}
          className="lg:col-start-2 lg:row-start-3"
        />
        <DealsOfBusinessCard
          deals={deals}
          onOpenDeal={() => setIsDealDialogOpen(true)}
          className="lg:col-start-2 lg:row-start-1"
        />
        <PitchCard
          pitch={analysis.pitch}
          phone={
            primaryContact?.whatsapp ?? primaryContact?.phone ?? business.phone
          }
          contactName={primaryContact?.name}
          onSendWhatsApp={() => void handleContact("whatsapp")}
          className="lg:col-start-1 lg:row-start-3"
        />
      </div>

      <DealDialog
        open={isDealDialogOpen}
        onOpenChange={setIsDealDialogOpen}
        business={business}
        contacts={contacts}
        existingCount={deals.length}
        onSubmit={handleAddDeal}
      />

      <ConfirmDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        title={`Registrar contato com ${business.name}?`}
        description={
          primaryContact
            ? `O contato com ${primaryContact.name} entra no histórico e o negócio avança para a etapa Contatado.`
            : "O negócio será aberto caso ainda não exista e avançará para a etapa Contatado, com o registro no histórico."
        }
        confirmLabel="Registrar contato"
        onConfirm={() => handleContact("direto")}
      />
    </div>
  );
}
