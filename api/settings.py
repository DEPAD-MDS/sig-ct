from dotenv import load_dotenv
import os

class Settings:
    load_dotenv()
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "sk-c76c411fdece4c08ba5dd35469434778")
    def get_ia_key():
      return Settings.DEEPSEEK_API_KEY