"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

import { collection, doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/firebase"
import { useRouter } from "next/navigation"
import { Box, Card, CardActionArea, CardContent, Container, Dialog, DialogContent, DialogContentText, DialogTitle, Grid, Typography } from "@mui/material"
import Navbar from "../components/Navbar"
import { useAuthState } from "react-firebase-hooks/auth"

export default function Flashcards() {
    const [user] = useAuthState(auth);
    const [flashcards, setFlashcards] = useState([])
    
    const router = useRouter()

    useEffect(() => {
        async function getFlashcards() {
            if (!user) {
                return;
            }
            const docRef = doc(collection(db, "users"), user.uid)
            console.log(docRef)
            const docSnap = await getDoc(docRef)
            console.log(docSnap)


            if (docSnap.exists()) {
                const collections = docSnap.data().flashcards || []
                console.log(collections)
                setFlashcards(collections)
            } else {
                await setDoc(docRef, { flashcards: [] })
            }
        }
        getFlashcards()
    }, [user])

    const handleCardClick = (id) => {
        router.push(`/flashcard?id=${id}`)
    }

    return (
        <Box maxWidth="100vw" maxHeight={"100vh"} display={"flex"}>
            <Navbar />
            <Box display={"flex"} alignItems={"center"} flexDirection={"column"} justifyContent={"center"} textAlign={"center"} ml={"auto"} mr={"auto"} width={"1000px"}  mt={10}>
                <Typography variant="h3" mb={7}>Flashcards:</Typography>
                <Grid container spacing={3} xs={{ mt: 10 }} >
                    {flashcards.map((flashcard, index) => (
                        <Grid item sx={12} sm={6} md={3} key={index}>
                            <Card>
                                <CardActionArea sx={{ display: "flex", alignItems:"center", justifyContent: "center" }} onClick={() => {
                                    handleCardClick(flashcard.name)
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight={"bold"}>
                                            {flashcard.name}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    )
}