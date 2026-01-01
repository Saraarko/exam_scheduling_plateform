"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Calendar, MapPin, Clock, User, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSchedule } from "@/contexts/schedule-context"
import { generateStudentSchedulePDF } from "@/lib/pdf-generator"
import mockData from "@/data/mock-data.json"

export default function StudentPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { getStudentExams, exams: allExams } = useSchedule()
  const [selectedDept, setSelectedDept] = useState("Informatique")
  const [selectedFormation, setSelectedFormation] = useState("Licence 2 Informatique")
  const [isExporting, setIsExporting] = useState(false)

  // Utiliser les examens générés ou les données mockées comme fallback
  const generatedExams = getStudentExams(selectedFormation, selectedDept)
  const fallbackExams = mockData.examens
    .filter((e) => e.departement === selectedDept && e.formation === selectedFormation)
    .map((e) => ({
      id: e.id,
      moduleName: e.moduleName,
      formation: e.formation,
      department: e.departement,
      date: e.date,
      startTime: e.heureDebut,
      endTime: e.heureFin,
      duration: e.dureeMinutes,
      roomId: e.salleId,
      room: e.salle,
      professorId: e.professeurId,
      professor: e.professeur,
      studentCount: e.nbEtudiants,
      type: e.type,
      status: 'planned' as const
    }))

  // Prioriser les examens générés, sinon utiliser les données mockées
  const studentExams = generatedExams.length > 0 ? generatedExams : fallbackExams

  const exams = studentExams.map((e) => ({
    date: new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    time: `${e.startTime} - ${e.endTime}`,
    subject: e.moduleName,
    room: e.room,
    professor: e.professor,
    type: e.type,
    duration: e.duration,
  }))

  const totalExams = exams.length
  const totalHours = exams.reduce((sum, e) => sum + e.duration / 60, 0)
  const nextExamDays = 3

  // Gestionnaire pour l'export PDF
  const handleExportPDF = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    toast({
      title: "Export en cours...",
      description: "Génération de votre planning personnel au format PDF.",
    })

    try {
      // Générer le PDF avec les vraies données
      await generateStudentSchedulePDF(user, exams, selectedFormation)

      toast({
        title: "Planning exporté avec succès !",
        description: `Votre planning d'examens (${selectedFormation}) a été téléchargé.`,
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

  return (
    <AuthGuard requiredRole="student">
    <div className="min-h-screen bg-background">
        <DashboardNav
          title="Mon Planning d'Examens"
          subtitle={`${selectedFormation} - Session Janvier 2025`}
        />
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtrer le planning</CardTitle>
            <CardDescription>Sélectionnez votre département et formation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Département</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  {mockData.departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Formation</label>
                <select
                  value={selectedFormation}
                  onChange={(e) => setSelectedFormation(e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  <option>Licence 1 {selectedDept}</option>
                  <option>Licence 2 {selectedDept}</option>
                  <option>Licence 3 {selectedDept}</option>
                  <option>Master 1 {selectedDept}</option>
                  <option>Master 2 {selectedDept}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Examens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-4">{totalExams}</div>
              <p className="text-xs text-muted-foreground mt-1">Du 15 au 22 janvier</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Prochain Examen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-chart-4">Dans {nextExamDays} jours</div>
              <p className="text-xs text-muted-foreground mt-1">{exams[0]?.subject || "N/A"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Heures Totales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-4">{Math.round(totalHours)}h</div>
              <p className="text-xs text-muted-foreground mt-1">Durée totale examens</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Planning Détaillé</CardTitle>
                <CardDescription>Vos examens à venir</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Export en cours..." : "Exporter PDF"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {exams.length > 0 ? (
              <div className="space-y-4">
                {exams.map((exam, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{exam.subject}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{exam.type}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            {exam.duration} min
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{exam.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{exam.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{exam.room}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{exam.professor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">Aucun examen planifié</p>
                <p className="text-sm">Sélectionnez une autre formation pour voir les examens</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations Importantes</CardTitle>
            <CardDescription>Règlement des examens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted">
              <p className="flex items-start gap-2 text-sm">
                <span className="text-chart-4 font-bold mt-1">•</span>
                <span>
                  <strong>Présence obligatoire :</strong> Présentez-vous 15 minutes avant le début de l'examen avec
                  votre carte d'étudiant
                </span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="flex items-start gap-2 text-sm">
                <span className="text-chart-4 font-bold mt-1">•</span>
                <span>
                  <strong>Téléphones interdits :</strong> Les téléphones portables doivent être éteints et rangés dans
                  votre sac
                </span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="flex items-start gap-2 text-sm">
                <span className="text-chart-4 font-bold mt-1">•</span>
                <span>
                  <strong>Documents autorisés :</strong> Consultez le règlement des examens pour la liste des documents
                  autorisés par module
                </span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="flex items-start gap-2 text-sm">
                <span className="text-chart-4 font-bold mt-1">•</span>
                <span>
                  <strong>Retards :</strong> Aucun étudiant ne sera admis après 30 minutes du début de l'examen
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AuthGuard>
  )
}
