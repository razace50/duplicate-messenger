"use client";

import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { BsGithub, BsGoogle } from "react-icons/bs";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import Input from "@/app/components/inputs/Input";
import AuthSocialButton from "./AuthSocialButton";
import Button from "@/app/components/Button";
import { toast } from "react-hot-toast";

type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
  const { data: session, status } = useSession(); // Updated to destructure session and status properly
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/conversations");
    }
  }, [status, router]);

  const toggleVariant = useCallback(() => {
    setVariant(variant === "LOGIN" ? "REGISTER" : "LOGIN");
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      if (variant === "REGISTER") {
        // Register new user
        const response = await axios.post("/api/register", data);
        console.log("Registration successful:", response);

        // Automatically sign in the user after successful registration
        const callback = await signIn("credentials", {
          ...data,
          redirect: false,
        });

        if (callback?.error) {
          toast.error("Invalid credentials!");
        } else if (callback?.ok) {
          toast.success("Registration successful!");
          router.push("/conversations");
        }
      } else if (variant === "LOGIN") {
        // Log in existing user
        const callback = await signIn("credentials", {
          ...data,
          redirect: false,
        });

        if (callback?.error) {
          toast.error("Invalid credentials!");
        } else if (callback?.ok) {
          toast.success("Login successful!");
          router.push("/conversations");
        }
      }
    } catch (error: any) {
      // Enhanced error logging and toast
      console.error("Error during authentication:", error?.response || error);
      toast.error("Something went wrong! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const socialAction = async (action: string) => {
    setIsLoading(true);

    try {
      const callback = await signIn(action, { redirect: false });

      if (callback?.error) {
        toast.error("Social login failed!");
      } else if (callback?.ok) {
        router.push("/conversations");
      }
    } catch (error: any) {
      console.error("Social login error:", error?.response || error);
      toast.error("Something went wrong with social login!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && (
            <Input
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              id="name"
              label="Name"
            />
          )}
          <Input
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            id="email"
            label="Email address"
            type="email"
          />
          <Input
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            id="password"
            label="Password"
            type="password"
          />
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              {variant === "LOGIN" ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction("google")}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>
            {variant === "LOGIN"
              ? "New to Messenger?"
              : "Already have an account?"}
          </div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === "LOGIN" ? "Create an account" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
