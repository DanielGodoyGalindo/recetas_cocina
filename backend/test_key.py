from google import genai


client = genai.Client(api_key='API_KEY_HERE')

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hola, ¿funcionas?"
)

print(response.text)