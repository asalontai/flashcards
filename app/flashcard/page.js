"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, writeBatch } from "firebase/firestore"
import { auth, db } from "@/firebase"

import { useRouter, useSearchParams } from "next/navigation"
import { Box, Button, Card, CardActionArea, CardContent, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField, Typography } from "@mui/material";
import Navbar from "../components/Navbar"
import { useAuthState } from "react-firebase-hooks/auth"

export default function Flashcard() {
    const [user] = useAuthState(auth);
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState([]);

    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [newName, setNewName] = useState("");
    const [oldName, setOldName] = useState("");

    const searchParams = useSearchParams();
    const search = searchParams.get("id");

    const router = useRouter()

    useEffect(() => {
        async function getFlashcard() {
            if (!search || !user) {
                return;
            }

            console.log(search)

            const colRef = collection(doc(db, "users", user.uid), search);
            const docs = await getDocs(colRef);
            const flashcards = [];

            docs.forEach((doc) => {
                flashcards.push({ id: doc.id, ...doc.data() });
            });

            setOldName(search)

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
        if (!newName) {
            alert("Please enter a new name");
            return;
        }

        const batch = writeBatch(db);
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || [];
            const oldCollectionExists = collections.find((f) => f.name === oldName);
            const newCollectionExists = collections.find((f) => f.name === newName);

            if (!oldCollectionExists) {
                alert("Old flashcard collection does not exist.");
                return;
            }

            if (newCollectionExists) {
                alert("Flashcard collection with the new name already exists.");
                return;
            }

            const updatedCollections = collections.map((f) => 
                f.name === oldName ? { ...f, name: newName } : f
            );
            
            batch.set(userDocRef, { flashcards: updatedCollections }, { merge: true });

            const oldColRef = collection(userDocRef, oldName);
            const newColRef = collection(userDocRef, newName);

            const snapshot = await getDocs(oldColRef);
            snapshot.forEach((i) => {
                const newDocRef = doc(newColRef, i.id);
                batch.set(newDocRef, i.data());
            });

            snapshot.forEach((i) => {
                const oldDocRef = doc(oldColRef, i.id);
                batch.delete(oldDocRef);
            });

            await batch.commit();
            handleCloseEdit()            
            router.push(`/flashcard?id=${newName}`)
            setNewName("")
        } else {
            alert("No such document!");
        }
    };

    const deleteFlashcard = async () => {
        if (!search) {
            alert("Please enter a collection name to delete");
            return;
        }
        
        const userDocRef = doc(db, 'users', user.uid);
        const colRef = collection(userDocRef, search);
    
        try {
            const snapshot = await getDocs(colRef);

            if (snapshot.empty) {
                alert("No documents found in the collection");
                return;
            }

            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();

            const userDocSnap = await getDoc(userDocRef);
            const collections = userDocSnap.data().flashcards || [];
            const updatedCollections = collections.filter(f => f.name !== search);

            await updateDoc(userDocRef, {
                flashcards: updatedCollections
            });

            router.push("/flashcards")
        } catch (error) {
            console.error("Error deleting collection: ", error);
            alert("Error deleting collection");
        }
    };

    const handleOpenEdit = () => {
        setOpenEdit(true)
    }

    const handleCloseEdit = () => {
        setOpenEdit(false)
    }

    const handleOpenDelete = () => {
        setOpenDelete(true)
    }

    const handleCloseDelete = () => {
        setOpenDelete(false)
    }

    return (
        <Box maxWidth="100vw">
            <Navbar />
            <Box display={"flex"} alignItems={"center"} justifyContent={"center"} flexDirection={"column"}>
                <Typography color={"black"} mt={15} variant="h3">{oldName}</Typography>
                <Button href="/flashcards" variant="contained" sx={{ mt: 5, mb: 5 }}>Back</Button>
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
                <Button variant="contained" color="primary" onClick={handleOpenEdit}>Edit</Button>
                <Button variant="contained" color="primary" onClick={handleOpenDelete}>Delete</Button>
            </Box>
            <Dialog open={openEdit} onClose={handleCloseEdit}>
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
                    <Button onClick={handleCloseEdit}>Cancel</Button>
                    <Button onClick={updateFlashcardName}>Save</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDelete} onClose={handleCloseDelete}>
                <DialogTitle>
                    Delete Flashcard
                </DialogTitle>
                <DialogActions>
                    <Button onClick={handleCloseDelete}>Cancel</Button>
                    <Button onClick={deleteFlashcard}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}