import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, XCircle, Clock, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { FormationDetailsModal } from "@/components/formation-details-modal"
import mockData from "@/data/mock-data.json"

export default function DepartmentPage() {
  const currentDept = mockData.departments[0] // Informatique

  const formations = [
    { name: "Licence 1 Informatique", exams: 8, status: "validated", conflicts: 0, students: 120, modules: 8 },
    { name: "Licence 2 Informatique", exams: 10, status: "pending", conflicts: 2, students: 98, modules: 9 },
    { name: "Licence 3 Informatique", exams: 12, status: "validated", conflicts: 0, students: 85, modules: 9 },
    { name: "Master 1 Développement Web", exams: 7, status: "pending", conflicts: 1, students: 52, modules: 7 },
    { name: "Master 1 Intelligence Artificielle", exams: 6, status: "pending", conflicts: 1, students: 45, modules: 6 },
    { name: "Master 2 Sécurité Informatique", exams: 5, status: "draft", conflicts: 0, students: 32, modules: 5 },
    { name: "Master 2 Data Science", exams: 5, status: "validated", conflicts: 0, students: 38, modules: 5 },
  ]

  const totalExams = formations.reduce((sum, f) => sum + f.exams, 0)
  const totalConflicts = formations.reduce((sum, f) => sum + f.conflicts, 0)
  const validatedCount = formations.filter((f) => f.status === "validated").length
  const totalStudents = formations.reduce((sum, f) => sum + f.students, 0)

  const stats = [
    { label: "Examens Planifiés", value: totalExams.toString(), color: "text-chart-3" },
    { label: "Formations", value: formations.length.toString(), color: "text-chart-3" },
    {
      label: "Conflits Actifs",
      value: totalConflicts.toString(),
      color: totalConflicts > 0 ? "text-destructive" : "text-green-500",
    },
    { label: "Étudiants Totaux", value: totalStudents.toString(), color: "text-chart-3" },
  ]

  return (
    <AuthGuard requiredRole="department">
    <div className="min-h-screen bg-background">
        <DashboardNav
          title={`Chef de Département - ${currentDept.name}`}
          subtitle={`Validation et statistiques par formation • ${currentDept.totalProfessors} professeurs • ${currentDept.formations} formations`}
        />
      <div className="container mx-auto px-4 py-8">

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">{stat.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Formations du Département</CardTitle>
                <CardDescription>État de validation des emplois du temps par formation</CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {validatedCount}/{formations.length} validées
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formations.map((formation) => (
                <div
                  key={formation.name}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{formation.name}</h3>
                      {formation.status === "validated" && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Validé
                        </Badge>
                      )}
                      {formation.status === "pending" && (
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          <Clock className="mr-1 h-3 w-3" />
                          En attente
                        </Badge>
                      )}
                      {formation.status === "draft" && <Badge variant="outline">Brouillon</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formation.exams} examens</span>
                      <span>•</span>
                      <span>{formation.modules} modules</span>
                      <span>•</span>
                      <span>{formation.students} étudiants</span>
                      {formation.conflicts > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-destructive flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            {formation.conflicts} conflit{formation.conflicts > 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {formation.status !== "validated" && (
                      <FormationDetailsModal formation={formation} />
                    )}
                    {formation.status === "pending" && formation.conflicts === 0 && <Button size="sm">Valider</Button>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques du Département</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Taux de validation</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-chart-3">
                      {Math.round((validatedCount / formations.length) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {validatedCount} sur {formations.length} formations
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Heures d'examen totales</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-chart-3">147h</p>
                    <p className="text-xs text-muted-foreground">Sur 2 semaines</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Professeurs mobilisés</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-chart-3">{currentDept.totalProfessors}</p>
                    <p className="text-xs text-muted-foreground">Département {currentDept.name}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des Conflits</CardTitle>
              <CardDescription>Analyse par type de conflit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.conflits
                  .filter((c) => c.departement === "Informatique")
                  .map((conflict) => (
                    <div key={conflict.id} className="p-3 rounded-lg bg-muted">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {conflict.type}
                        </Badge>
                        <Badge
                          variant={conflict.severite === "haute" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {conflict.severite}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{conflict.message}</p>
                      <p className="text-xs text-muted-foreground">{conflict.details}</p>
                    </div>
                  ))}
                {mockData.conflits.filter((c) => c.departement === "Informatique").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>Aucun conflit détecté</p>
                  </div>
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
