"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, AlertCircle, Sparkles, CheckCircle2, Clock, TrendingUp, Download, FileCheck, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { ResourceOptimizationModal } from "@/components/resource-optimization-modal"
import { AutoResolveModal } from "@/components/auto-resolve-modal"
import { generateAdminReportPDF } from "@/lib/admin-pdf-generator"
import { useSchedule } from "@/contexts/schedule-context"
import { useToast } from "@/hooks/use-toast"
import mockData from "@/data/mock-data.json"

export default function AdminPage() {
  const { toast } = useToast()
  const { generateSchedule, exams } = useSchedule()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const conflicts = mockData.conflits.map((c) => ({
    id: c.id,
    type: c.type,
    message: c.message,
    severity: c.severite === "haute" ? "high" : c.severite === "moyenne" ? "medium" : "low",
    dept: c.departement,
    details: c.details,
  }))

  const amphiCount = mockData.salles.filter((s) => s.type === "amphitheatre").length
  const salleCount = mockData.salles.filter((s) => s.type === "salle").length

  const resources = [
    { name: "Amphithéâtres", total: 8, used: 7, available: 1, utilization: 87 },
    { name: "Salles Examens", total: 45, used: 34, available: 11, utilization: 76 },
    { name: "Laboratoires", total: 12, used: 10, available: 2, utilization: 83 },
    { name: "Salles TD", total: 30, used: 22, available: 8, utilization: 73 },
  ]

  const unresolvedConflicts = conflicts.filter((c) => c.severity === "high").length

  // Gestionnaire pour générer l'EDT automatique
  const handleGenerateSchedule = async () => {
    setIsGenerating(true)
    toast({
      title: "Génération en cours...",
      description: "Génération automatique de l'emploi du temps en cours.",
    })

    // Simulation d'une génération qui prend du temps
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Générer l'emploi du temps partagé
    generateSchedule()

    setIsGenerating(false)
    toast({
      title: "EDT généré avec succès !",
      description: "L'emploi du temps automatique a été créé et est maintenant visible par tous les utilisateurs.",
      variant: "default",
    })
  }

  // Gestionnaire pour l'optimisation des ressources
  const handleOptimizeResources = async () => {
    setIsOptimizing(true)
    toast({
      title: "Optimisation en cours...",
      description: "Réoptimisation des ressources et salles en cours.",
    })

    // Simulation d'une optimisation
    await new Promise(resolve => setTimeout(resolve, 2500))

    setIsOptimizing(false)
    toast({
      title: "Ressources optimisées !",
      description: "L'occupation des salles a été optimisée de 12%.",
      variant: "default",
    })
  }

  // Gestionnaire pour l'export PDF
  const handleExportPDF = async () => {
    setIsExporting(true)
    toast({
      title: "Export en cours...",
      description: "Génération du rapport administratif au format PDF.",
    })

    try {
      // Préparer les données pour le PDF
      const adminStats = {
        totalExams: mockData.kpis.nbExamensPlanifies,
        totalConflicts: conflicts.filter(c => c.severity === "high").length,
        totalStudents: mockData.university.totalStudents,
        totalDepartments: mockData.university.totalDepartments,
        totalFormations: mockData.university.totalFormations,
        totalProfessors: mockData.departments.reduce((sum, dept) => sum + dept.totalProfessors, 0),
        averageGenerationTime: mockData.kpis.tempsGenerationEDT,
        optimizationScore: 94 // Score fixe pour la démo
      }

      const conflictData = conflicts.slice(0, 10).map(conflict => ({
        id: conflict.id,
        type: conflict.type,
        severity: conflict.severite,
        message: conflict.message,
        department: conflict.departement,
        details: conflict.details
      }))

      // Générer le PDF avec les vraies données
      await generateAdminReportPDF(adminStats, conflictData, resources)

      toast({
        title: "Rapport exporté avec succès !",
        description: "Le rapport administratif a été téléchargé.",
        variant: "default",
      })
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error)
      toast({
        title: "Erreur d'export",
        description: "Une erreur s'est produite lors de la génération du PDF.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Gestionnaire pour vérifier les contraintes
  const handleVerifyConstraints = async () => {
    setIsVerifying(true)
    toast({
      title: "Vérification en cours...",
      description: "Vérification de toutes les contraintes métier.",
    })

    // Simulation de la vérification
    await new Promise(resolve => setTimeout(resolve, 1500))

    const violationsFound = Math.floor(Math.random() * 3) // 0-2 violations simulées

    setIsVerifying(false)
    if (violationsFound > 0) {
      toast({
        title: "Contraintes vérifiées",
        description: `${violationsFound} violation(s) détectée(s). Consultez les conflits.`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Toutes les contraintes respectées !",
        description: "Aucune violation détectée. Le planning est valide.",
        variant: "default",
      })
    }
  }


  return (
    <AuthGuard requiredRole="admin">
    <div className="min-h-screen bg-background">
        <DashboardNav
          title="Administrateur Examens"
          subtitle="Service de Planification - Génération et optimisation des emplois du temps"
        />
      <div className="container mx-auto px-4 py-8">

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Temps Génération EDT</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{mockData.kpis.tempsGenerationEDT}s</div>
              <p className="text-xs text-muted-foreground">Objectif: {"<"} 45s</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Examens Planifiés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">{mockData.kpis.nbExamensPlanifies}</div>
              <p className="text-xs text-muted-foreground">Session Janvier 2025</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Conflits Non Résolus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{unresolvedConflicts}</div>
              <p className="text-xs text-muted-foreground">Nécessitent intervention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Taux Optimisation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">94%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +2% vs précédent
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Détection de Conflits</CardTitle>
                  <CardDescription>
                    {conflicts.length} conflits détectés - {unresolvedConflicts} critiques
                  </CardDescription>
                </div>
                <AutoResolveModal
                  conflicts={conflicts.map(c => ({
                    id: c.id,
                    type: c.type,
                    severity: c.severity,
                    message: c.message,
                    department: c.dept,
                    details: c.details
                  }))}
                  trigger={
                    <Button
                      size="sm"
                      disabled={conflicts.length === 0}
                    >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Auto-résoudre
                </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`p-4 rounded-lg border ${
                      conflict.severity === "high"
                        ? "bg-red-500/10 border-red-500/20"
                        : conflict.severity === "medium"
                          ? "bg-yellow-500/10 border-yellow-500/20"
                          : "bg-blue-500/10 border-blue-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <AlertCircle
                          className={`h-5 w-5 mt-0.5 ${
                            conflict.severity === "high"
                              ? "text-red-500"
                              : conflict.severity === "medium"
                                ? "text-yellow-500"
                                : "text-blue-500"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {conflict.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{conflict.dept}</span>
                          </div>
                          <p className="text-sm font-medium mb-1">{conflict.message}</p>
                          <p className="text-xs text-muted-foreground">{conflict.details}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Conflit résolu",
                            description: `Le conflit "${conflict.message}" a été résolu automatiquement.`,
                            variant: "default",
                          })
                        }}
                      >
                        Résoudre
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>Outils de planification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="default"
                onClick={handleGenerateSchedule}
                disabled={isGenerating}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGenerating ? "Génération en cours..." : "Générer EDT Automatique"}
              </Button>
              <Button className="w-full bg-transparent" variant="outline" asChild>
                <Link href="/admin/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Planification Manuelle
                </Link>
              </Button>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-transparent"
                  variant="outline"
                  onClick={handleOptimizeResources}
                  disabled={isOptimizing}
                >
                <Clock className="mr-2 h-4 w-4" />
                  {isOptimizing ? "Optimisation en cours..." : "Optimiser"}
                </Button>
                <ResourceOptimizationModal
                  trigger={
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4" />
              </Button>
                  }
                />
              </div>
              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Export en cours..." : "Exporter Planning (.PDF)"}
              </Button>
              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={handleVerifyConstraints}
                disabled={isVerifying}
              >
                <FileCheck className="mr-2 h-4 w-4" />
                {isVerifying ? "Vérification en cours..." : "Vérifier Contraintes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Optimisation des Ressources</CardTitle>
            <CardDescription>Disponibilité et utilisation des salles et infrastructures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {resources.map((resource) => (
                <div key={resource.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{resource.name}</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-chart-2">
                    {resource.used}/{resource.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {resource.available} disponible{resource.available > 1 ? "s" : ""}
                  </p>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-chart-2" style={{ width: `${resource.utilization}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">Utilisation: {resource.utilization}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Contraintes Appliquées</CardTitle>
            <CardDescription>Règles d'optimisation en vigueur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Maximum 1 examen/jour par étudiant</p>
                  <p className="text-xs text-muted-foreground">Contrainte critique respectée</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Maximum 3 surveillances/jour par prof</p>
                  <p className="text-xs text-muted-foreground">Contrainte critique respectée</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Capacité salles respectée</p>
                  <p className="text-xs text-muted-foreground">Max 20 étudiants en période examen</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Priorisation départementale</p>
                  <p className="text-xs text-muted-foreground">Enseignants surveillent leur département en priorité</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AuthGuard>
  )
}
