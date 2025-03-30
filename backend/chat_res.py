import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

# print(api_key)  # Should print the value from .env if loaded correctly

from google import genai

# Initialize the client with your API key
client = genai.Client(api_key=api_key)

# List to store the conversation history


def generate_conversation_text(history):
    """
    Create a conversation text that includes all turns.
    This function formats the conversation by labeling each turn.
    """
    conversation_text = ""
    for turn in history:
        if turn["role"] == "user":
            conversation_text += f"User: {turn['content']}\n"
        elif turn["role"] == "ai":
            conversation_text += f"AI: {turn['content']}\n"
    return conversation_text


def chat(user_input, conversation_history=[]):
    print("Type 'quit' to exit the session.\n")

    conversation_history.append({"role": "user", "content": user_input})

    # Prepare the conversation text to send to the model.
    # This includes all previous interactions in the session.
    prompt_text = generate_conversation_text(conversation_history)

    # Generate a response using the Google Gen AI model
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt_text
    )

    # Extract the AI's response text
    ai_response = response.text
    print("AI:", ai_response)
    conversation_history.append({"role": "ai", "content": ai_response})
    return ai_response

    # Append the AI response to the conversation history


# from google import genai
# from pydantic import BaseModel


# class Recipe(BaseModel):
#     recipe_name: str
#     ingredients: list[str]


# def chat_json():
#     client = genai.Client(api_key=api_key)
#     response = client.models.generate_content(
#         model="gemini-2.0-flash",
#         contents="List a few popular cookie recipes. Be sure to include the amounts of ingredients.",
#         config={
#             "response_mime_type": "application/json",
#             "response_schema": list[Recipe],
#         },
#     )
#     # Use the response as a JSON string.

#     print(response.text)

#     # Use instantiated objects.
#     my_recipes: list[Recipe] = response.parsed


# # Use the response as a JSON string.
# if __name__ == "__main__":

#     chat_json()
