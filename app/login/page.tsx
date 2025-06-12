// import { LoginForm } from "@/components/login-form"
// import { RegisterForm } from "@/components/register-form"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// export default function LoginPage({
//   searchParams,
// }: {
//   searchParams: { email?: string }
// }) {
//   const email = searchParams.email || ""

//   return (
//     <div className="container mx-auto px-4 py-16 flex justify-center">
//       <div className="w-full max-w-md">
//         <h1 className="text-3xl font-bold mb-8 text-center">Account</h1>

//         <Tabs defaultValue="login">
//           <TabsList className="grid w-full grid-cols-2 mb-8">
//             <TabsTrigger value="login">Login</TabsTrigger>
//             <TabsTrigger value="register">Register</TabsTrigger>
//           </TabsList>
//           <TabsContent value="login">
//             <LoginForm defaultEmail={email} />
//           </TabsContent>
//           <TabsContent value="register">
//             <RegisterForm defaultEmail={email} />
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   )
// }
// app/login/page.tsx// app/login/page.tsx// app/login/page.tsx
// app/login/page.tsx

import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import Link from "next/link";

// Define the shape of the props
interface LoginPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

// The page just passes the searchParams object down
export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <div className="w-full ">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          {/* Pass the ENTIRE searchParams object to the client component */}
          <LoginForm searchParams={searchParams} />
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}