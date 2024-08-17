"use client";

import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import GoogleIcon from "@/public/google-icon.svg";
import Image from "next/image";

export default function Login() {
  const [user, loading] = useAuthState(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [loading, user, router]);

  const handleSignIn = async () => {
    setError("");
    setProcessing(true);

    if (!email || !password) {
      setError("All fields are required.");
      setProcessing(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", email);
      router.push("/");
    } catch (error) {
      setError(error.message);
      console.log("Error signing up:", error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setProcessing(true);

    try {
      await signInWithPopup(auth, googleProvider);
      console.log("User signed in with Google");
      router.push("/");
    } catch (error) {
      setError(error.message);
      console.log("Error signing in with Google:", error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box
      width={"100vw"}
      minHeight="100vh"
      display={"flex"}
      flexDirection={"column"}
      color={"white"}
    >
      <Box
        textAlign={"center"}
        text
        width={"500px"}
        height={"545px"}
        gap={4}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        bgcolor={"whie"}
        color={"black"}
        sx={{
          boxShadow: "0px 4px 8px rgba(255, 255, 255, 0.2)",
          userSelect: "none",
          borderRadius: "8px",
          margin: "auto",
          border: "1px solid black",
        }}
      >
        <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            height={"80px"}
            width={"500px"}
            bgcolor={"#007BFF"}
            borderRadius={"6px 6px 0 0"}
        >
            <Typography variant="h3">FlashCard SaaS</Typography>
        </Box>
        <Typography variant="h4" marginTop={"-20px"} sx={{ fontWeight: "bold" }}>
          Sign In
        </Typography>
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            width: "400px",
            marginTop: "-10px",
            "& .MuiInputLabel-root": {
                color: "black",
            },
            "& .MuiOutlinedInput-root": {
                "& fieldset": {
                    borderColor: "black",
                },
                "&:hover fieldset": {
                    borderColor: "black",
                },
                "&.Mui-focused fieldset": {
                    borderColor: "black",
                },
                "& input": {
                    color: "black",
                },
            },
            "& .MuiInputLabel-outlined": {
                color: "black",
                "&.Mui-focused": {
                    color: "black",
                },
            },
          }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            width: "400px",
            "& .MuiInputLabel-root": {
                color: "black",
            },
            "& .MuiOutlinedInput-root": {
                "& fieldset": {
                    borderColor: "black",
                },
                "&:hover fieldset": {
                    borderColor: "black",
                },
                "&.Mui-focused fieldset": {
                    borderColor: "black",
                },
                "& input": {
                    color: "black",
                },
            },
            "& .MuiInputLabel-outlined": {
                color: "black",
                "&.Mui-focused": {
                    color: "black",
                },
            },
          }}
        />
        {error && (
          <Typography
            sx={{
              marginTop: "-20px",
              marginBottom: "-36px",
            }}
            color="error"
          >
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleSignIn}
          sx={{
            marginTop: "10px",
            bgcolor: "#007BFF",
            '&:hover': {
                backgroundColor: '#66B2FF',
            },
          }}
        >
          {processing ? "Signing In..." : "Sign In"}
        </Button>
        <Box display={"flex"} gap={1} marginTop={"-10px"}>
          <Typography>Don&apos;t have an account?</Typography>
          <Link href={"/sign-up"} className="custom-link">
            Create an account
          </Link>
        </Box>
        <Divider 
            sx={{ 
                width: '400px', 
                marginTop: "-15px", 
                color: "black",
                borderColor: "black",
                "&::before, &::after": {
                    borderColor: "black",
                },
                "&.MuiDivider-root": {
                    "&::before, &::after": {
                        borderTop: "thin solid black",
                    },
                },
            }}
        >
            or
        </Divider>
        <Button
          sx={{
          marginTop: "-15px",
          textTransform: "none",
          bgcolor: "#007BFF",
          '&:hover': {
              backgroundColor: '#66B2FF',
          },
        }} 
          variant="contained"
          onClick={handleGoogle}
        >
          <Box display={"flex"} alignItems={"center"} gap={1}>
            <Image src={GoogleIcon} height={35} width={35} alt="" />
            <Typography>Sign in with Google</Typography>
          </Box>
        </Button>
      </Box>
    </Box>
  );
}