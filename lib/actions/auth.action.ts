'use server';
import { db } from "@/firebase/client";
import { cookies } from "next/headers";
import { auth } from "@/firebase/client";
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

const ONE_WEEK = 60 * 60 * 24 * 7; // in seconds

export async function SignUp(params: SignUpParams) {
  const { uid, name, email } = params;
  try {
    const userDoc = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      return {
        success: false,
        message: 'User already exists'
      };
    }

    await setDoc(userDoc, {
      uid,
      name,
      email,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'User created successfully'
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      message: 'Error creating user'
    };
  }
}

export async function setSessionCookie(idToken:string){
const cookieStore = await cookies();
const sessionCookie =  await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK*1000,
})

cookieStore.set('session',sessionCookie,{
   maxAge:ONE_WEEK,
   httpOnly:true,
   secure:process.env.NODE_ENV === 'production',
   path:'/',
   sameSite:'lax',
});
}

export async function SignIn(params:SignInParams){
    const {email,idToken} = params;

    try {
        const useRecord = await auth.getUserByEmail(email);
        if (!useRecord) {
            return {
                success: false,
                message: "User not found",
            };
        }
   await setSessionCookie(idToken);
    } catch (e:any) {
        console.log(e);

        return {
            success: false,
            message: "Failed to log into an account.",
        }
    }

}
    
