import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URI")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.coca_cola_db  # database name
orders_collection = db.get_collection("orders")
