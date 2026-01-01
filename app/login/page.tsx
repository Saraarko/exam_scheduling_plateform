"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, AlertCircle, Eye, EyeOff } from "lucide-react"
import mockData from "@/data/mock-data.json"

interface User {
  id: string
  email: string
  password: string
  role: "admin" | "dean" | "department" | "student"
  name: string
  department?: string
  formation?: string
}

// Données utilisateurs mockées pour l'authentification
const mockUsers: User[] = [
  {
    id: "admin-1",
    email: "saraarkoub@gmail.com",
    password: "sara123",
    role: "admin",
    name: "Administrateur Système"
  },
  {
    id: "dean-1",
    email: "ayaat@gmail.com",
    password: "ayaat123",
    role: "dean",
    name: "Vice-Doyen"
  },
  {
    id: "dept-info-1",
    email: "belkacemi@gmail.com",
    password: "belkacemi123",
    role: "department",
    name: "Dr. Belkacemi",
    department: "Informatique"
  },
  {
    id: "student-1",
    email: "rayankh@univ.ma",
    password: "rayan123",
    role: "student",
    name: "Rayan Kh",
    department: "Informatique",
    formation: "Licence 2 Informatique"
  }
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "" as User["role"] | ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Pré-remplir le rôle depuis l'URL
  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam && ['admin', 'dean', 'department', 'student'].includes(roleParam)) {
      setFormData(prev => ({ ...prev, role: roleParam as User["role"] }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulation d'une requête API
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      // Recherche de l'utilisateur
      const user = mockUsers.find(
        u => u.email === formData.email &&
             u.password === formData.password &&
             u.role === formData.role
      )

      if (user) {
        // Stocker les informations utilisateur (dans un vrai projet, utiliser un système d'authentification)
        localStorage.setItem("user", JSON.stringify({
          id: user.id,
          name: user.name,
          role: user.role,
          department: user.department,
          formation: user.formation
        }))

        // Redirection selon le rôle
        switch (user.role) {
          case "admin":
            router.push("/admin")
            break
          case "dean":
            router.push("/dean")
            break
          case "department":
            router.push("/department")
            break
          case "student":
            router.push("/student")
            break
          default:
            setError("Rôle non reconnu")
        }
      } else {
        setError("Email, mot de passe ou rôle incorrect")
      }
    } catch (err) {
      setError("Erreur lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({ ...prev, role: role as User["role"] }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">UMBB Faculté de Science</h1>
              <p className="text-gray-600">Système de Planification d'Examens</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Accédez à votre espace personnel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="dean">Vice-Doyen/Doyen</SelectItem>
                    <SelectItem value="department">Chef de Département</SelectItem>
                    <SelectItem value="student">Étudiant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@univ.ma"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !formData.role}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Comptes de démonstration :</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div><strong>Admin:</strong> saraarkoub@gmail.com / sara123</div>
                <div><strong>Doyen:</strong> ayaat@gmail.com / ayaat123</div>
                <div><strong>Chef Dept:</strong> belkacemi@gmail.com / belkacemi123</div>
                <div><strong>Étudiant:</strong> rayankh@univ.ma / rayan123</div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="p-3 bg-blue-600 rounded-xl inline-block mb-4">
            <GraduationCap className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
