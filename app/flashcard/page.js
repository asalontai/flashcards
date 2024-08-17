"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, writeBatch } from "firebase/firestore"
import { auth, db } from "@/firebase"

import { useSearchParams } from "next/navigation"
import { Box, Button, Card, CardActionArea, CardContent, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField, Typography } from "@mui/material";
import Navbar from "../components/Navbar"
import { useAuthState } from "react-firebase-hooks/auth"

export default function Flashcard() {
    const [user] = useAuthState(auth);
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState([]);

    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [oldName, setOldName] = useState("");
    const [collectionId, setCollectionId] = useState("");

    const searchParams = useSearchParams();
    const search = searchParams.get("id");

    useEffect(() => {
        async function getFlashcard() {
            if (!search || !user) {
                return;
            }

            setCollectionId(search);
            const colRef = collection(doc(db, "users", user.uid), search);
            const docs = await getDocs(colRef);
            const flashcards = [];

            docs.forEach((doc) => {
                flashcards.push({ id: doc.id, ...doc.data() });
            });

            if (flashcards.length > 0) {
                setOldName(flashcards[0].name);
            }

            setFlashcards(flashcards);
        }
        getFlashcard();
    }, [user, search]);

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const updateFlashcardName = async () => {
        if (!collectionId || !newName || !user || !oldName) return;
    
        // Reference to the user's document in Firestore
        const userDocRef = doc(db, "users", user.uid);
        
        // Reference to the flashcard collection
        const colRef = collection(userDocRef, collectionId);
        const docs = await getDocs(colRef);
    
        const updatedFlashcards = [];
    
        // Loop through each document in the collection
        docs.forEach((doc) => {
            const flashcard = doc.data();
            // Replace the name if it matches the old name
            if (flashcard.name === oldName) {
                updatedFlashcards.push({ ...flashcard, name: newName });
            } else {
                updatedFlashcards.push(flashcard);
            }
        });
    
        // Write the updated flashcards back to Firestore
        // Note: Firestore requires you to update documents individually
        const batch = writeBatch(db);
        docs.forEach((doc) => {
            const flashcard = updatedFlashcards.find(fc => fc.id === doc.id);
            if (flashcard) {
                const flashcardRef = doc.ref;
                batch.update(flashcardRef, flashcard);
            }
        });
    
        await batch.commit();
    
        // Log the updated flashcards to verify the change
        console.log("Updated flashcards:", updatedFlashcards);
    
        // Update the local state
        setFlashcards(updatedFlashcards);
        handleClose();
    };
    

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Box maxWidth="100vw">
            <Navbar />
            <Box display={"flex"} alignItems={"center"} justifyContent={"center"} flexDirection={"column"}>
                <Button href="/flashcards" variant="contained" sx={{ mt: 20, mb: 5 }}>Back</Button>
                <Grid container spacing={3}>
                    {flashcards.map((flashcard, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card>
                                <CardActionArea
                                    onClick={() => {
                                        handleCardClick(index)
                                    }}
                                >
                                    <CardContent>
                                        <Box
                                            sx={{
                                                perspective: "1000px",
                                                "& > div": {
                                                    transition: "transform 0.6s",
                                                    transformStyle: "preserve-3d",
                                                    position: "relative",
                                                    width: "100%",
                                                    height: "200px",
                                                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
                                                    transform: flipped[index]
                                                        ? "rotateY(180deg)"
                                                        : "rotateY(0deg)"
                                                },
                                                "& > div > div": {
                                                    position: "absolute",
                                                    width: "100%",
                                                    height: "100%",
                                                    backfaceVisibility: "hidden",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    padding: 2,
                                                    boxSizing: "border-box"
                                                },
                                                "& > div > div:nth-of-type(2)": {
                                                    transform: "rotateY(180deg)"
                                                }
                                            }}
                                        >
                                            <div>
                                                <div>
                                                    <Typography variant="h5" component={"div"}>
                                                        {flashcard.front}
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <Typography variant="h5" component={"div"}>
                                                        {flashcard.back}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Button variant="contained" color="primary" onClick={handleOpen}>Edit</Button>
            </Box>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    Edit Flashcard Name
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please rename
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Collection"
                        type="text"
                        fullWidth
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        variant="outlined"
                    />                 
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={updateFlashcardName}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}