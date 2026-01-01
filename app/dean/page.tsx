"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, AlertTriangle, CheckCircle, Building2, Clock, Calendar, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { useToast } from "@/hooks/use-toast"
import mockData from "@/data/mock-data.json"

export default function DeanPage() {
  const { toast } = useToast()
  const [isValidating, setIsValidating] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const globalStats = [
    {
      label: "Occupation Amphis",
      value: `${mockData.kpis.occupationAmphis}%`,
      trend: "+5%",
      color: "text-chart-1",
      icon: Building2,
    },
    {
      label: "Occupation Salles",
      value: `${mockData.kpis.occupationSalles}%`,
      trend: "+3%",
      color: "text-chart-2",
      icon: Building2,
    },
    {
      label: "Taux Conflits Global",
      value: `${mockData.kpis.tauxConflits}%`,
      trend: "-1.2%",
      color: "text-chart-3",
      icon: AlertTriangle,
    },
    {
      label: "Heures Prof Planifiées",
      value: `${mockData.kpis.heuresProfPlanifiees}h`,
      trend: "+12h",
      color: "text-chart-4",
      icon: Clock,
    },
  ]

  const departmentData = mockData.departments.map((dept) => ({
    name: dept.name,
    conflicts: mockData.conflits.filter((c) => c.departement === dept.name).length,
    occupancy: Math.floor(70 + Math.random() * 20),
    validated: Math.random() > 0.3,
    students: dept.totalStudents,
    formations: dept.formations,
  }))

  const totalConflicts = mockData.conflits.filter((c) => c.status === "non_resolu").length
  const validatedDepts = departmentData.filter((d) => d.validated).length

  // Gestionnaire pour valider l'emploi du temps global
  const handleValidateGlobalSchedule = async () => {
    setIsValidating(true)
    toast({
      title: "Validation en cours...",
      description: "Validation globale de l'emploi du temps en cours.",
    })

    // Simulation d'une validation qui prend du temps
    await new Promise(resolve => setTimeout(resolve, 4000))

    setIsValidating(false)
    setIsValidated(true)

    toast({
      title: "Emploi du temps validé !",
      description: "L'emploi du temps global a été validé avec succès et publié aux étudiants.",
      variant: "default",
    })
  }

  return (
    <AuthGuard requiredRole="dean">
    <div className="min-h-screen bg-background">
        <DashboardNav
          title="Tableau de Bord Vice-Doyen / Doyen"
          subtitle={`${mockData.university.name} - Vue stratégique globale et KPIs académiques`}
        />
      <div className="container mx-auto px-4 py-8">

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {globalStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs flex items-center gap-2">
                    <Icon className="h-3 w-3" />
                    {stat.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend} vs période précédente
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Vue d'ensemble</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Étudiants</span>
                <span className="text-lg font-bold">{mockData.university.totalStudents.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Départements</span>
                <span className="text-lg font-bold">{mockData.university.totalDepartments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Formations</span>
                <span className="text-lg font-bold">{mockData.university.totalFormations}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Performance Système</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Examens Planifiés</span>
                <span className="text-lg font-bold">{mockData.kpis.nbExamensPlanifies}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Temps Génération</span>
                <span className="text-lg font-bold text-green-500">{mockData.kpis.tempsGenerationEDT}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taux Validation</span>
                <span className="text-lg font-bold">{mockData.kpis.tauxValidation}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Charges Enseignants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Moy. Surveillances/Prof</span>
                <span className="text-lg font-bold">{mockData.kpis.nbSurveillancesParProf}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Professeurs</span>
                <span className="text-lg font-bold">
                  {mockData.departments.reduce((sum, d) => sum + d.totalProfessors, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Heures Planifiées</span>
                <span className="text-lg font-bold">{mockData.kpis.heuresProfPlanifiees}h</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Vue par Département</CardTitle>
              <CardDescription>
                État des validations et conflits ({mockData.university.totalDepartments} départements)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentData.map((dept) => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-medium">{dept.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({dept.students.toLocaleString()} étudiants • {dept.formations} formations)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {dept.validated ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        {dept.conflicts > 0 && (
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                            {dept.conflicts} conflit{dept.conflicts > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress value={dept.occupancy} className="h-2" />
                    <span className="text-xs text-muted-foreground">Occupation salles: {dept.occupancy}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions Requises</CardTitle>
              <CardDescription>Validation et décisions stratégiques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.conflits
                  .filter((c) => c.severite === "haute" && c.status === "non_resolu")
                  .slice(0, 2)
                  .map((conflict) => (
                    <div key={conflict.id} className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{conflict.departement}</p>
                          <p className="text-xs text-muted-foreground">{conflict.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{validatedDepts} départements validés</p>
                      <p className="text-xs text-muted-foreground">Prêts pour publication aux étudiants</p>
                    </div>
                  </div>
                </div>
                {isValidated ? (
                  <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Emploi du temps validé
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleValidateGlobalSchedule}
                    disabled={isValidating}
                  >
                  <Calendar className="mr-2 h-4 w-4" />
                    {isValidating ? "Validation en cours..." : "Valider l'emploi du temps global"}
                </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </AuthGuard>
  )
}
