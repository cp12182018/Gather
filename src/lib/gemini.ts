import { GoogleGenAI, Type } from "@google/genai";
import { Contact } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseContactNotes(rawText: string, existingContext?: Partial<Contact>): Promise<Partial<Contact>> {
  const prompt = `Parse the following raw unstructured notes into a structured contact format. 
Extract the name, infer the 'metAt' (where met, location), 'metDate' (when met, date), any contact info (phone/email/social), and put the remaining details in 'notes'. 
Assign a reasonable status ("New", "Invited", "Attending", "Follow Up").
If the notes refer to interest in a specific event like Sunday Service, Youth Group, or Bible Study, populate 'events'.

${existingContext && Object.keys(existingContext).length > 0 ? `
IMPORTANT: You are UPDATING an existing contact's information.
Current Contact Data:
${JSON.stringify(existingContext, null, 2)}

Instructions for updating:
1. Merge the new notes with the existing data.
2. For 'notes': DO NOT overwrite the old notes. Intelligently APPEND the new insights to the end of the existing notes (separated by a newline).
3. For 'status': Update the status only if the new text implies a change (e.g. if they say they will come, update to "Attending").
4. For 'events': Add any newly mentioned events to the existing events array.
5. For other fields (name, phone, metAt, etc): Keep the existing ones unless the new notes specifically correct or add to them.
` : ''}

Raw new notes:
"${rawText}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            contactInfo: { type: Type.STRING },
            metAt: { type: Type.STRING, description: "Where we met (Location)" },
            metDate: { type: Type.STRING, description: "When we met (Date)" },
            notes: { type: Type.STRING },
            events: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            status: { 
              type: Type.STRING, 
              enum: ["New", "Invited", "Attending", "Follow Up"] 
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return {};
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AI parse error:", error);
    throw error;
  }
}


export async function generateInvitationMessage(contact: Contact, language: 'English' | 'Chinese' = 'English'): Promise<string> {
  const prompt = `You are a Christian serving in a bible-based church, leading a bible study group in Newport and assisting another in Manhattan (MMC).
Draft a short personalized invitation text message (SMS length, max 3-4 sentences) for the following contact.

Language: ${language}

Contact Name: ${contact.name}
Where we met: ${contact.metAt}
Notes/Context: ${contact.notes}
Events they are interested in: ${contact.events.join(", ") || "General church events"}

Background Information & Logistics:
- You do not teach theology but share faith. Do NOT use "Theological" or "Religious" sounding words (focus on faith by revelation/grace, relationship, community).
- Newport Bible Study meets Wednesday Night 7:30-9:30 PM.
- Manhattan (MMC) Bible Study meets Thursday Night 7:30-9:30 PM.
- Sunday Service is 10:00 AM in Paramus, NJ. Church Van pickup is available from 33rd street or Newport Starbucks.

Instructions:
- The output message MUST be entirely in ${language}.
- Keep it natural, casual, and warm without being overly pushy.
- Mention where we met to jog their memory.
- Invite them to one of the events they are interested in. If inviting to Bible Study, intelligently recommend either the Newport or Manhattan meeting depending on where they live or where we met (if the notes suggest a location). If inviting to Sunday Service, you can gently mention the van pick-ups.
- Do NOT include placeholders like "[Your Name]", just sign off as "Hope to see you there!" (or the equivalent in ${language}). Let it feel like a real text message.
- Return ONLY the message text.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || "Could not generate message.";
  } catch (error) {
    console.error("Gemini AI error:", error);
    throw error;
  }
}

