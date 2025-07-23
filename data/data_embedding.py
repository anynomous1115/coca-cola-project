import json
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
import os
from dotenv import load_dotenv
import warnings 
warnings.filterwarnings("ignore")

# Load environment variables
load_dotenv()

# Get QDRANT API key and host from environment variables
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_HOST = os.getenv("QDRANT_HOST")

# Load data
with open("coca-cola-project/data/Coca_Cola.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Prepare embedding model
model = SentenceTransformer("intfloat/multilingual-e5-large-instruct")

# Connect to Qdrant (cloud)
qdrant_client = QdrantClient(
    api_key=QDRANT_API_KEY,  # Qdrant API key
    url=QDRANT_HOST,  # Qdrant server URL 
    https=True,  # Use HTTPS
)

# Create collection (if needed)
qdrant_client.recreate_collection(
    collection_name="coca_cola_docs",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
)

def flatten_content(content):
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        # If all elements are strings, join them
        if all(isinstance(x, str) for x in content):
            return "\n".join(content)
        # If all elements are dictionaries, format them
        elif all(isinstance(x, dict) for x in content):
            return "\n".join(
                [", ".join(f"{k}: {v}" for k, v in entry.items()) for entry in content]
            )
    return str(content)

# Convert and upload data
points = []
for idx, item in enumerate(data):
    text = flatten_content(item)
    vector = model.encode(text).tolist()
    point = PointStruct(
        id=idx,
        vector=vector,
        payload={
            "title": item.get("title", ""),
            "detail": item.get("detail", ""),
        },
    )
    points.append(point)

# Upload points to Qdrant
qdrant_client.upsert(
    collection_name="coca_cola_docs",
    points=points,
)

# ---- Apply for Coca_Cola-Products ----
qdrant_client.recreate_collection(
    collection_name="coca_cola_products",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
)

with open("coca-cola-project/data/Coca_Cola_Products.json", "r", encoding="utf-8") as f:
    product_data = json.load(f)

# Convert and upload product data
product_points = []
for idx, item in enumerate(product_data):
    text = flatten_content(item)
    vector = model.encode(text).tolist()
    point = PointStruct(
        id=idx,
        vector=vector,
        payload={
            "product_ID": item.get("ID", ""),
            "name": item.get("Tên sản phẩm", ""),
            "category": item.get("Loại", ""),
            "detail": item.get("Chi tiết", ""),
        },
    )
    product_points.append(point)

# Upload product points to Qdrant
qdrant_client.upsert(
    collection_name="coca_cola_products",
    points=product_points,
)

print("Data embedding and upload completed successfully.")