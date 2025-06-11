import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = await searchParams.email || ""

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Account</h1>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm defaultEmail={email} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm defaultEmail={email} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
