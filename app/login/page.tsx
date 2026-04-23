import { LoginForm } from "@/components/login-form"
import { Theater } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Theater className="h-6 w-6" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">UCB Show Confirmation</h1>
            <p className="text-sm text-muted-foreground text-pretty">Every show, confirmed in 300 clicks.</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
