"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        await signIn('google', { callbackUrl: '/dashboard' })
    }

    const handleCredentialsLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            setIsLoading(false)
            alert("Invalid email or password") // Simple alert for MVP
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-muted/20">
            <div className="w-full max-w-md space-y-8 rounded-lg border bg-background p-8 shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign in to your account
                    </p>
                </div>

                <div className="space-y-4">
                    <Button 
                        variant="outline" 
                        className="w-full py-6" 
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Sign in with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleCredentialsLogin} className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required placeholder="john@example.com" />
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                         </div>
                         <Button type="submit" className="w-full" disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Sign In
                         </Button>
                    </form>

                    <div className="text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-semibold text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
