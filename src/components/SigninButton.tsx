'use client'
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

const SigninButton = () => {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <div className="flex gap-4 ml-auto items-center">
        <p className="text-sky-600">{session.user.name}</p>
        <Image
          src={session.user.image ?? ""}
          alt={session.user.name ?? ""}
          className="rounded-full"
          width={32}
          height={32}
        />
        <button className="text-red-600" onClick={() => signOut()}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4 ml-auto">
      <button
        className="text-green-600 outline"
        onClick={() => signIn('google')}
      >Sign In with Google</button>
      <button
        className="text-green-600 outline"
        onClick={() => signIn('github')}
      >Sign In with Github</button>
    </div>
  );
};

export default SigninButton;
