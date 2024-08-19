import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import Image from 'next/image';

export default function Navbar({ }) {
  const [user] = useAuthState(auth)

  const router = useRouter();

  const handleSignOut = async () => {
    signOut(auth).then(() => {
      router.push("/");
    });
  };

  return (
    <>
      {user ? (
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: 'primary',
            boxShadow: 'none', 
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1201,
          }}
        >
          <Toolbar>
            <Typography variant='h4' mr={"auto"} sx={{ cursor: "pointer"}} onClick={() => {router.push("/")}}>Flashcard SaaS</Typography>
            <Image src={user.photoURL} width={40} height={40} style={{ borderRadius: '100%' }} />
            <Button color="inherit" href='/generate' sx={{ ml: 1 }}>Create</Button>
            <Button color="inherit" href='/flashcards'>Flashcards</Button>
            <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
          </Toolbar>
        </AppBar>
      ) : (
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: 'primary',
            boxShadow: 'none', 
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1201,
          }}
        >
          <Toolbar>
            <Typography variant='h4' mr={"auto"} sx={{ cursor: "pointer"}} onClick={() => {router.push("/")}}>Flashcard SaaS</Typography>
            <Button color="inherit" href='/'>Home</Button>
            <Button color="inherit" href='/sign-in'>Login</Button>
            <Button color="inherit" href='/sign-up'>Sign Up</Button>
          </Toolbar>
        </AppBar>
      )
    
    
    }
    
    </>
  );
};