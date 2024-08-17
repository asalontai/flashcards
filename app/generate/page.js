"use client"

import { auth, db } from "@/firebase";
import { Box, Button, Card, CardActionArea, CardContent, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Paper, TextField, Typography } from "@mui/material";
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { useAuthState } from "react-firebase-hooks/auth";
import getStripe from "@/utils/get-stripe";

export default function Generate() {
    const [user] = useAuthState(auth);
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [text, setText] = useState("")
    const [name, setName] = useState("")
    const [open, setOpen] = useState(false)
    const [generateCount, setGenerateCount] = useState(0);
    const [pricingOpen, setPricingOpen] = useState(false);

    const router = useRouter()

    const handleSubmit = async () => {
        setGenerateCount((prevCount) => {
            const newCount = prevCount + 1;
    
            if (newCount >= 3) { 
                setPricingOpen(true); 
                
            }
    
            return newCount; 
        });
        fetch("api/generate", {
            method: "POST",
            body: text,
        })
            .then((res) => res.json())
            .then((data) => setFlashcards(data))
    }
    const handleSubmitsubscription = async (plan) => {
        const price = plan === 'Pro' ? 10 : 5;
        const checkoutSession = await fetch("/api/checkout_session", {
          method: "POST",
          body: JSON.stringify({ price }),
          headers: {
            origins: "http://localhost:3000"
          }
          
        })
        const checkoutSessionJson = await checkoutSession.json()
    
        if (checkoutSession.statusCode === 500) {
          console.log(checkoutSession.message)
          return
        }
    
        const stripe = await getStripe()
        const { error } = await stripe.redirectToCheckout({
          sessionId: checkoutSessionJson.id
        })
    
        if (error) {
          console.log(error.message)
        }
      } 

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }
    const handlePricingClose = () => {
        setPricingOpen(false); 
    }


    const saveFashcards = async () => {
        if (!name) {
            alert("Please enter a name")
            return
        }

        const batch = writeBatch(db)
        const userDocRef = doc(collection(db, 'users'), user.uid)
        const docSnap = await getDoc(userDocRef)

        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || []
            if (collections.find((f) => f.name === name)) {
                alert("Flashcard collection with the same name already exists.")
                return
            } else {
                collections.push({ name })
                batch.set(userDocRef, {flashcards: collections }, { merge: true })
            }
        } else {
            batch.set(userDocRef, { flashcards: [{name}] })
        }

        const colRef = collection(userDocRef, name)
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef)
            batch.set(cardDocRef, flashcard)
        })

        await batch.commit()
        handleClose()
        router.push('/flashcards')
    }

    return (
        <Box maxWidth="100vw">
            <Navbar />
            <Box width={"700px"} sx={{
                mt: 20, mb: 6, display: "flex", flexDirection: "column", alignItems: "center", ml: "auto", mr: "auto"
            }}>
                <Typography variant="h4">
                    Generate Flashcards
                </Typography>
                <Paper sx={{ p: 4, width: '100%'}}>
                    <TextField 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        label="Enter text" 
                        fullWidth 
                        multiline 
                        rows={4} 
                        variant="outlined" 
                        sx={{
                            mb: 2,
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        fullWidth
                    >
                        Submit
                    </Button>
                </Paper>
            </Box>
            
            {flashcards.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5">Flashcards Preview</Typography>
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
                    <Box sx={{ mt: 4, display: "flex", justifyContent: "center"}}>
                        <Button variant="contained" color="secondary" onClick={handleOpen}>
                            Save
                        </Button>
                    </Box>
                </Box>
            )}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    Save Flashcards
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a name for your flashcards collection
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Collection"
                        type="text"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="outlined"
                    />                 
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={saveFashcards}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={pricingOpen} onClose={handlePricingClose} fullWidth maxWidth="md">
    <DialogTitle>
        Choose a Plan
    </DialogTitle>
    <DialogContent>
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Pricing
            </Typography>
            <Grid container spacing={4} justifyContent={"center"}>
                <Grid item xs={12} md={6}>
                    <Box sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "grey.300",
                        borderRadius: 2,
                        textAlign: "center",
                        width: "100%"
                    }}>
                        <Typography variant="h5" gutterBottom sx={{ mt: 1 }}>Basic</Typography>
                        <Typography variant="h6" gutterBottom>$5 / month</Typography>
                        <Typography>
                            Access to basic flashcard features and limited storage.
                        </Typography>
                        <Button variant="contained" onClick={() => handleSubmitsubscription('Basic')} color="primary" sx={{ mt: 2, mb: 2 }}>Choose Basic</Button>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "grey.300",
                        borderRadius: 2,
                        textAlign: "center",
                        width: "100%" 
                    }}>
                        <Typography variant="h5" gutterBottom sx={{ mt: 1 }}>Pro</Typography>
                        <Typography variant="h6" gutterBottom>$10 / month</Typography>
                        <Typography>
                            Unlimited flashcards and storage, with priority support.
                        </Typography>
                        <Button variant="contained" onClick={() => handleSubmitsubscription('Pro')} color="primary" sx={{ mt: 2, mb: 2 }}>Choose Pro</Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    </DialogContent>
    <DialogActions>
        <Button onClick={handlePricingClose}>Close</Button>
    </DialogActions>
</Dialog>

        </Box>
    )
}