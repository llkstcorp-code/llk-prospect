"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/format";
import { useProfile } from "@/store/profile-store";

export function ProfileForm() {
  const { profile, saveProfile } = useProfile();
  const { toast } = useToast();
  const [form, setForm] = React.useState(profile);
  const [loadedProfile, setLoadedProfile] = React.useState(profile);
  const [isSaving, setIsSaving] = React.useState(false);

  // O perfil chega de forma assíncrona: quando ele muda, o formulário reflete
  // o valor mais recente (ajuste de estado durante a renderização).
  if (loadedProfile !== profile) {
    setLoadedProfile(profile);
    setForm(profile);
  }

  const isDirty =
    form.name !== profile.name ||
    form.email !== profile.email ||
    form.company !== profile.company;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await saveProfile({ ...form, initials: getInitials(form.name) });
      toast({ title: "Perfil atualizado", variant: "success" });
    } catch {
      toast({ title: "Não foi possível salvar o perfil", variant: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="[--card-spacing:--spacing(5)]">
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>
          Dados usados nas abordagens e na identificação da sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Nome</Label>
              <Input
                id="profile-name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="profile-company">Empresa</Label>
              <Input
                id="profile-company"
                value={form.company}
                onChange={(event) =>
                  setForm({ ...form, company: event.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving || !isDirty}>
              {isSaving ? <Loader2 className="animate-spin" /> : null}
              Salvar alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
