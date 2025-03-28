"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import FormField from "@/components/FormField"

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(1, { message: "Username is required" }) : z.string().optional(),
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  })

}

const AuthForm = ({ type }: { type: FormType }) => {
  const formSchema = authFormSchema(type)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
   try {
    if (type === "sign-in") {
      console.log("SIGN IN", values)
    }else {
      console.log("SIGN UP", values)
    }
   } catch (error) {
      console.log(error)
    }
    
   }
  

  const isSignIn = type === "sign-in"

  return (
    <div className="card-border lg:min-w-[566px]"> 
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" width={38} height={32} />
          <h2 className="text-primary-100">Acevox</h2>
        </div>
        <h3>Ace your interview with AI</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full mt-4 form">
            {!isSignIn && 
            <FormField control = {form.control} 
            name="name"
            label="Name"
            placeholder="Enter your name"
            />}
             <FormField control = {form.control} 
            name="email"
            label="Email"
            placeholder="Enter your email"
            />
             <FormField control = {form.control} 
            name="password"
            label="Password"
            placeholder="Enter your password"
            />
            <Button className="btn" type="submit">
              {isSignIn ? 'Sign in' : 'Create an Account'}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignIn ? 'New to Acevox?' : 'Already have an account?'}
          <Link href={!isSignIn ? '/sign-in' : '/sign-up'} className="font-bold text-user-primary ml-1">
          {!isSignIn ? 'Sign In' : 'Sign Up'}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthForm
