"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DashboardNav } from "@/components/dashboard-nav"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  FileText
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import mockData from "@/data/mock-data.json"

interface Exam {
  id: number
  moduleName: string
  formation: string
  department: string
  date: string
  startTime: string
  endTime: string
  duration: number
  roomId: number
  room: string
  professorId: number
  professor: string
  studentCount: number
  type: string
  status: 'planned' | 'confirmed' | 'cancelled'
}

interface NewExamForm {
  moduleName: string
  formation: string
  department: string
  date: Date | undefined
  startTime: string
  endTime: string
  roomId: string
  professorId: string
  studentCount: number
  type: string
}

export default function AdminSchedulePage() {
  const { toast } = useToast()
  const [exams, setExams] = useState<Exam[]>(
    mockData.examens.map(exam => ({
      id: exam.id,
      moduleName: exam.moduleName,
      formation: exam.formation,
      department: exam.departement,
      date: exam.date,
      startTime: exam.heureDebut,
      endTime: exam.heureFin,
      duration: exam.dureeMinutes,
      roomId: exam.salleId,
      room: exam.salle,
      professorId: exam.professeurId,
      professor: exam.professeur,
      studentCount: exam.nbEtudiants,
      type: exam.type,
      status: 'planned' as const
    }))
  )

  const [isAddingExam, setIsAddingExam] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [newExam, setNewExam] = useState<NewExamForm>({
    moduleName: '',
    formation: '',
    department: '',
    date: undefined,
    startTime: '',
    endTime: '',
    roomId: '',
    professorId: '',
    studentCount: 0,
    type: 'Écrit'
  })

  // Données mockées pour les formulaires
  const formations = [
    "Licence 1 Informatique",
    "Licence 2 Informatique",
    "Licence 3 Informatique",
    "Master 1 Développement Web",
    "Master 1 Intelligence Artificielle",
    "Master 2 Sécurité Informatique"
  ]

  const departments = mockData.departments.map(dept => dept.name)
  const rooms = mockData.salles
  const professors = [
    { id: 1, name: "Dr. Ahmed Martin" },
    { id: 2, name: "Pr. Fatima Dubois" },
    { id: 3, name: "Dr. Youssef Bennani" },
    { id: 4, name: "Pr. Amina Tazi" },
    { id: 5, name: "Dr. Karim Alaoui" }
  ]

  const examTypes = ["Écrit", "Oral", "TP", "Projet"]

  const handleAddExam = () => {
    if (!newExam.moduleName || !newExam.formation || !newExam.department ||
        !newExam.date || !newExam.startTime || !newExam.endTime ||
        !newExam.roomId || !newExam.professorId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    const selectedRoom = rooms.find(r => r.id.toString() === newExam.roomId)
    const selectedProfessor = professors.find(p => p.id.toString() === newExam.professorId)

    if (!selectedRoom || !selectedProfessor) {
      toast({
        title: "Erreur",
        description: "Salle ou professeur invalide.",
        variant: "destructive",
      })
      return
    }

    // Vérifier les conflits
    const conflict = checkForConflicts(newExam)
    if (conflict) {
      toast({
        title: "Conflit détecté",
        description: conflict,
        variant: "destructive",
      })
      return
    }

    const exam: Exam = {
      id: Math.max(...exams.map(e => e.id)) + 1,
      moduleName: newExam.moduleName,
      formation: newExam.formation,
      department: newExam.department,
      date: format(newExam.date, 'yyyy-MM-dd'),
      startTime: newExam.startTime,
      endTime: newExam.endTime,
      duration: calculateDuration(newExam.startTime, newExam.endTime),
      roomId: parseInt(newExam.roomId),
      room: selectedRoom.name,
      professorId: parseInt(newExam.professorId),
      professor: selectedProfessor.name,
      studentCount: newExam.studentCount,
      type: newExam.type,
      status: 'planned'
    }

    setExams([...exams, exam])
    setNewExam({
      moduleName: '',
      formation: '',
      department: '',
      date: undefined,
      startTime: '',
      endTime: '',
      roomId: '',
      professorId: '',
      studentCount: 0,
      type: 'Écrit'
    })
    setIsAddingExam(false)

    toast({
      title: "Examen ajouté",
      description: `${exam.moduleName} planifié avec succès.`,
      variant: "default",
    })
  }

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam)
    setNewExam({
      moduleName: exam.moduleName,
      formation: exam.formation,
      department: exam.department,
      date: new Date(exam.date),
      startTime: exam.startTime,
      endTime: exam.endTime,
      roomId: exam.roomId.toString(),
      professorId: exam.professorId.toString(),
      studentCount: exam.studentCount,
      type: exam.type
    })
  }

  const handleUpdateExam = () => {
    if (!editingExam) return

    // Vérifier les conflits (en excluant l'examen en cours d'édition)
    const tempExams = exams.filter(e => e.id !== editingExam.id)
    const updatedExam = {
      ...editingExam,
      moduleName: newExam.moduleName,
      formation: newExam.formation,
      department: newExam.department,
      date: newExam.date ? format(newExam.date, 'yyyy-MM-dd') : editingExam.date,
      startTime: newExam.startTime,
      endTime: newExam.endTime,
      duration: calculateDuration(newExam.startTime, newExam.endTime),
      roomId: parseInt(newExam.roomId),
      room: rooms.find(r => r.id.toString() === newExam.roomId)?.name || editingExam.room,
      professorId: parseInt(newExam.professorId),
      professor: professors.find(p => p.id.toString() === newExam.professorId)?.name || editingExam.professor,
      studentCount: newExam.studentCount,
      type: newExam.type
    }

    // Vérifier les conflits avec les autres examens
    const conflict = checkForConflicts(newExam, tempExams)
    if (conflict) {
      toast({
        title: "Conflit détecté",
        description: conflict,
        variant: "destructive",
      })
      return
    }

    setExams(exams.map(e => e.id === editingExam.id ? updatedExam : e))
    setEditingExam(null)
    setNewExam({
      moduleName: '',
      formation: '',
      department: '',
      date: undefined,
      startTime: '',
      endTime: '',
      roomId: '',
      professorId: '',
      studentCount: 0,
      type: 'Écrit'
    })

    toast({
      title: "Examen modifié",
      description: `${updatedExam.moduleName} mis à jour avec succès.`,
      variant: "default",
    })
  }

  const handleDeleteExam = (examId: number) => {
    setExams(exams.filter(e => e.id !== examId))
    toast({
      title: "Examen supprimé",
      description: "L'examen a été supprimé de la planification.",
      variant: "default",
    })
  }

  const handleConfirmExam = (examId: number) => {
    setExams(exams.map(e =>
      e.id === examId ? { ...e, status: 'confirmed' as const } : e
    ))
    toast({
      title: "Examen confirmé",
      description: "L'examen a été confirmé et publié.",
      variant: "default",
    })
  }

  const checkForConflicts = (newExamData: NewExamForm, existingExams = exams): string | null => {
    const examDate = newExamData.date ? format(newExamData.date, 'yyyy-MM-dd') : ''

    // Vérifier conflits de salle
    const roomConflict = existingExams.find(exam =>
      exam.date === examDate &&
      exam.roomId.toString() === newExamData.roomId &&
      (
        (newExamData.startTime >= exam.startTime && newExamData.startTime < exam.endTime) ||
        (newExamData.endTime > exam.startTime && newExamData.endTime <= exam.endTime) ||
        (newExamData.startTime <= exam.startTime && newExamData.endTime >= exam.endTime)
      )
    )

    if (roomConflict) {
      return `Conflit de salle: ${roomConflict.room} occupée par ${roomConflict.moduleName}`
    }

    // Vérifier conflits de professeur
    const professorConflict = existingExams.find(exam =>
      exam.date === examDate &&
      exam.professorId.toString() === newExamData.professorId &&
      (
        (newExamData.startTime >= exam.startTime && newExamData.startTime < exam.endTime) ||
        (newExamData.endTime > exam.startTime && newExamData.endTime <= exam.endTime) ||
        (newExamData.startTime <= exam.startTime && newExamData.endTime >= exam.endTime)
      )
    )

    if (professorConflict) {
      return `Conflit de professeur: ${professorConflict.professor} occupé par ${professorConflict.moduleName}`
    }

    // Vérifier capacité de la salle
    const selectedRoom = rooms.find(r => r.id.toString() === newExamData.roomId)
    if (selectedRoom && newExamData.studentCount > selectedRoom.capacite) {
      return `Capacité insuffisante: ${selectedRoom.name} ne peut accueillir que ${selectedRoom.capacite} étudiants`
    }

    return null
  }

  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-500">Confirmé</Badge>
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500">Annulé</Badge>
      default:
        return <Badge variant="outline">Planifié</Badge>
    }
  }

  const confirmedExams = exams.filter(e => e.status === 'confirmed').length
  const plannedExams = exams.filter(e => e.status === 'planned').length
  const totalStudents = exams.reduce((sum, exam) => sum + exam.studentCount, 0)

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-background">
        <DashboardNav
          title="Planification Manuelle"
          subtitle="Gestion détaillée des examens et conflits"
        />

        <div className="container mx-auto px-4 py-8">
          {/* En-tête avec statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{exams.length}</p>
                    <p className="text-sm text-muted-foreground">Examens totaux</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{confirmedExams}</p>
                    <p className="text-sm text-muted-foreground">Confirmés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{plannedExams}</p>
                    <p className="text-sm text-muted-foreground">Planifiés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Étudiants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions principales */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Gestion des Examens</h2>
              <p className="text-muted-foreground">
                Planifiez, modifiez et validez manuellement les examens
              </p>
            </div>

            <div className="flex gap-2">
              <Dialog open={isAddingExam} onOpenChange={setIsAddingExam}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter Examen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouvel examen</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations pour planifier un nouvel examen
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="moduleName">Nom du module *</Label>
                      <Input
                        id="moduleName"
                        value={newExam.moduleName}
                        onChange={(e) => setNewExam(prev => ({ ...prev, moduleName: e.target.value }))}
                        placeholder="Ex: Algorithmique Avancée"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="formation">Formation *</Label>
                      <Select value={newExam.formation} onValueChange={(value) => setNewExam(prev => ({ ...prev, formation: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une formation" />
                        </SelectTrigger>
                        <SelectContent>
                          {formations.map((formation) => (
                            <SelectItem key={formation} value={formation}>
                              {formation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Département *</Label>
                      <Select value={newExam.department} onValueChange={(value) => setNewExam(prev => ({ ...prev, department: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newExam.date ? format(newExam.date, "PPP", { locale: fr }) : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newExam.date}
                            onSelect={(date) => setNewExam(prev => ({ ...prev, date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startTime">Heure de début *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newExam.startTime}
                        onChange={(e) => setNewExam(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">Heure de fin *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newExam.endTime}
                        onChange={(e) => setNewExam(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="room">Salle *</Label>
                      <Select value={newExam.roomId} onValueChange={(value) => setNewExam(prev => ({ ...prev, roomId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une salle" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id.toString()}>
                              {room.name} (Cap: {room.capacite})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="professor">Professeur *</Label>
                      <Select value={newExam.professorId} onValueChange={(value) => setNewExam(prev => ({ ...prev, professorId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un professeur" />
                        </SelectTrigger>
                        <SelectContent>
                          {professors.map((prof) => (
                            <SelectItem key={prof.id} value={prof.id.toString()}>
                              {prof.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentCount">Nombre d'étudiants</Label>
                      <Input
                        id="studentCount"
                        type="number"
                        value={newExam.studentCount}
                        onChange={(e) => setNewExam(prev => ({ ...prev, studentCount: parseInt(e.target.value) || 0 }))}
                        placeholder="Ex: 45"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Type d'examen</Label>
                      <Select value={newExam.type} onValueChange={(value) => setNewExam(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsAddingExam(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddExam}>
                      <Save className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/admin">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
            </div>
          </div>

          {/* Tableau des examens */}
          <Card>
            <CardHeader>
              <CardTitle>Examens Planifiés</CardTitle>
              <CardDescription>
                Liste complète des examens avec statut et actions disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Formation</TableHead>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Salle</TableHead>
                      <TableHead>Professeur</TableHead>
                      <TableHead>Étudiants</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{exam.moduleName}</p>
                            <Badge variant="outline" className="text-xs">{exam.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{exam.formation}</p>
                            <p className="text-sm text-muted-foreground">{exam.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p>{format(new Date(exam.date), "dd/MM/yyyy")}</p>
                              <p className="text-sm text-muted-foreground">
                                {exam.startTime} - {exam.endTime}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.room}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.professor}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.studentCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(exam.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditExam(exam)}
                              disabled={exam.status === 'confirmed'}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {exam.status === 'planned' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConfirmExam(exam.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteExam(exam.id)}
                              disabled={exam.status === 'confirmed'}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Modal d'édition */}
          {editingExam && (
            <Dialog open={!!editingExam} onOpenChange={() => setEditingExam(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Modifier l'examen</DialogTitle>
                  <DialogDescription>
                    Modifiez les informations de l'examen sélectionné
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-moduleName">Nom du module *</Label>
                    <Input
                      id="edit-moduleName"
                      value={newExam.moduleName}
                      onChange={(e) => setNewExam(prev => ({ ...prev, moduleName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-formation">Formation *</Label>
                    <Select value={newExam.formation} onValueChange={(value) => setNewExam(prev => ({ ...prev, formation: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formations.map((formation) => (
                          <SelectItem key={formation} value={formation}>
                            {formation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newExam.date ? format(newExam.date, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newExam.date}
                          onSelect={(date) => setNewExam(prev => ({ ...prev, date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-startTime">Heure de début *</Label>
                    <Input
                      id="edit-startTime"
                      type="time"
                      value={newExam.startTime}
                      onChange={(e) => setNewExam(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-endTime">Heure de fin *</Label>
                    <Input
                      id="edit-endTime"
                      type="time"
                      value={newExam.endTime}
                      onChange={(e) => setNewExam(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-room">Salle *</Label>
                    <Select value={newExam.roomId} onValueChange={(value) => setNewExam(prev => ({ ...prev, roomId: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {room.name} (Cap: {room.capacite})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setEditingExam(null)}>
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                  <Button onClick={handleUpdateExam}>
                    <Save className="mr-2 h-4 w-4" />
                    Mettre à jour
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
