"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormType } from "@/types";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const ModernAuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="flex w-full max-w-5xl">
      {/* Left column with image and features */}
      <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-b from-[#0F2B4C] to-[#071426] p-12 rounded-l-3xl justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Acevox" width={40} height={40} className="w-10 h-10" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#56CCF2] to-[#2D9CDB]">
            Acevox
          </h1>
        </div>
        
        <div className="mt-16 mb-auto">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#56CCF2] mb-6">
            Power your job interviews with AI
          </h2>
          <p className="text-light-100/80 text-lg">
            Practice with our AI interviewer, get instant feedback, and land your dream job
          </p>
          
          <div className="mt-12 space-y-6">
            {/* Feature list */}
            <div className="flex items-start gap-3">
              <div className="size-6 bg-[#2D9CDB]/20 rounded-full flex-center mt-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#56CCF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Realistic interviews</h3>
                <p className="text-light-100/70 text-sm">Practice with our AI that simulates real world interviews</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="size-6 bg-[#2D9CDB]/20 rounded-full flex-center mt-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#56CCF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Detailed feedback</h3>
                <p className="text-light-100/70 text-sm">Get comprehensive insights on your performance</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="size-6 bg-[#2D9CDB]/20 rounded-full flex-center mt-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#56CCF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Tech-specific training</h3>
                <p className="text-light-100/70 text-sm">Customize interviews based on your target role and technologies</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-6 border-t border-light-400/10">
          <p className="text-light-400 text-sm">© {new Date().getFullYear()} Acevox. All rights reserved.</p>
        </div>
      </div>
      
      {/* Right column with form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-b from-[#071426] to-[#030712] p-8 md:p-12 rounded-3xl lg:rounded-l-none lg:rounded-r-3xl">
        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
          <Image src="/logo.svg" alt="Acevox" width={40} height={40} className="w-10 h-10" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#56CCF2] to-[#2D9CDB]">
            Acevox
          </h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isSignIn ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-light-100/70">
            {isSignIn 
              ? "Enter your credentials to access your account" 
              : "Start practicing interviews with AI today"}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-5 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="Enter your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="w-full bg-gradient-to-r from-[#56CCF2] to-[#2D9CDB] hover:from-[#2D9CDB] hover:to-[#2381B0] text-white rounded-full mt-4" type="submit">
              {isSignIn ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-light-400">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
            <Link
              href={isSignIn ? "/sign-up" : "/sign-in"}
              className="text-[#56CCF2] font-medium ml-2 hover:text-[#2D9CDB] transition-colors"
            >
              {isSignIn ? "Sign Up" : "Sign In"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernAuthForm; 