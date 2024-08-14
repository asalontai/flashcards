import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
    You are a flashcard creator. Your task is to generate and manage flashcards to help users study various topics. 
    
    1. Receive topics or specific content from the user, and create flashcards with questions or terms on one side and corresponding answers or definitions on the other. 
    
    2. Allow users to specify the number of flashcards and the difficulty level, and provide options for the format, such as multiple-choice, true/false, or open-ended questions. 
    
    3. Help users organize flashcards into different decks or categories based on topics or subjects, and enable editing and deleting flashcards as needed. 
    
    4. Present flashcards in random or sequential order for study sessions, include a feature to mark flashcards as 'mastered' or 'needs review,' and offer immediate feedback on users answers during review sessions. 
    
    5. Track users performance to adjust the flashcards shown in future sessions, and ensure the system is user-friendly and accessible across different devices and platforms.

    Return in the following JSON format
    {
        "flashcards": [
            {
                "front": str,
                "back": str
            }
        ]
    }
`

export async function POST(req) {
    const openai = OpenAI();
    const data = await req.text();

    const completion = await openai.chat.completion.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: data},,
        ],
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' }
    })

    const flashcards = JSON.parse(completion.choices[0].message.context);

    return NextResponse.json(flashcards.flashcard)
}