import os
import warnings
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from fastapi import FastAPI
from pydantic import BaseModel
import uuid
from chatbot.order import Order


warnings.filterwarnings("ignore")
load_dotenv()

# --- API Keys & Clients ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_HOST = os.getenv("QDRANT_HOST")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("models/gemini-2.0-flash")

# Configure Qdrant
qdrant_client = QdrantClient(api_key=QDRANT_API_KEY, url=QDRANT_HOST, https=True)
COLLECTION_NAME = ["coca_cola_docs", "coca_cola_products"]

# Initialize FastAPI
app = FastAPI()

# Schema
class QuestionRequest(BaseModel):
    session_id: str
    question: str

# Embedding model
embedding_model = SentenceTransformer("intfloat/multilingual-e5-large-instruct")

# Store multi-turn conversations
chat_memory = {}
conversation_state = {}

# Multi-turn order management
def handle_order_conversation(session_id: str, question: str) -> str:
    state = conversation_state.get(session_id, {
        "intent": "đặt hàng",
        "step": "ask_name",
        "data": {}
    })

    step = state["step"]
    data = state["data"]

    if step == "ask_name":
        state["data"]["name"] = question
        state["step"] = "ask_phone"
        conversation_state[session_id] = state
        return "Vui lòng cung cấp số điện thoại của bạn."

    elif step == "ask_phone":
        state["data"]["phone"] = question
        state["step"] = "ask_address"
        conversation_state[session_id] = state
        return "Bạn vui lòng cho biết địa chỉ nhận hàng?"

    elif step == "ask_address":
        state["data"]["address"] = question
        state["step"] = "ask_product"
        conversation_state[session_id] = state
        return "Bạn muốn đặt sản phẩm gì? (VD: CocaCola Lon x2)"

    elif step == "ask_product":
        # Parse product
        import re
        match = re.match(r"(.*) x(\d+)", question.strip())
        if not match:
            return "Vui lòng nhập đúng định dạng: Tên sản phẩm xSố lượng (VD: CocaCola Lon x2)"

        product_name = match.group(1).strip()
        quantity = int(match.group(2))
        price = 1000  
        total = price * quantity

        item = {
            "product": "product123",
            "productName": product_name,
            "quantity": quantity,
            "price": price,
            "total": total
        }

        # Create order
        totalAmount = total
        order = Order(
            orderId=str(uuid.uuid4()),
            user="user123",
            items=[item],
            totalAmount=totalAmount,
            customerInfo={
                "name": data["name"],
                "phone": data["phone"],
                "address": data["address"]
            },
            status="pending"
        )

        # orders_collection.insert_one(order.dict())
        conversation_state.pop(session_id, None)  # reset state

        return f"🎉 Đơn hàng của bạn đã được tạo thành công!\nMã đơn: {order.orderId}"

    return "Xin lỗi, đã xảy ra lỗi trong quá trình đặt hàng."

# ----------- Modules -----------

def get_context(question, k=3):
    embedding = embedding_model.encode(f"Documents for retrieving: {question}").tolist()
    all_contexts = []
    for collection in COLLECTION_NAME:
        response = qdrant_client.search(
            collection_name=collection,
            query_vector=embedding,
            limit=k,
            with_payload=True
        )
        contexts = [hit.payload for hit in response]
        all_contexts.extend(contexts)
    return all_contexts

def detect_intent(question: str) -> str:
    prompt = (
        "Xác định ý định của câu hỏi sau. "
        "Các ý định có thể là: hỏi sản phẩm, hỏi tồn kho, hỏi khuyến mãi, khiếu nại, chào hỏi, đặt hàng, khác.\n"
        f"Câu hỏi: {question}\nÝ định:"
    )
    try:
        response = gemini_model.generate_content(prompt)
        return response.text.strip().lower()
    except:
        return "khác"

def analyze_sentiment(question: str) -> str:
    prompt = (
        "Phân tích cảm xúc của câu sau. "
        "Cảm xúc có thể là: tích cực, tiêu cực, trung lập.\n"
        f"Câu: {question}\nCảm xúc:"
    )
    try:
        response = gemini_model.generate_content(prompt)
        return response.text.strip().lower()
    except:
        return "trung lập"

def generate_answer(session_id: str, question: str) -> str:
    context = get_context(question)
    intent = detect_intent(question)
    sentiment = analyze_sentiment(question)

    # Get chat history
    history = chat_memory.get(session_id, [])
    history_text = "\n".join([f"Người dùng: {q}\nTrợ lý: {a}" for q, a in history])

    # Check if it's a conversation in progress
    if session_id in conversation_state:
        # Chỉ xử lý theo tiến trình đặt hàng
        state = conversation_state[session_id]
        if state["intent"] == "đặt hàng":
            return handle_order_conversation(session_id, question)
    
    if intent == "đặt hàng":
        conversation_state[session_id] = {
            "intent": "đặt hàng",
            "step": "ask_name",
            "data": {}
        }
        return "Bạn muốn đặt hàng ? Vui lòng cung cấp tên của bạn để bắt đầu."

    else:
        # Prompt 
        prompt = (
            "Bạn là một trợ lý ảo thông minh và thân thiện. "
            "Trả lời chính xác dựa trên ngữ cảnh và giữ mạch hội thoại.\n"
            f"Ý định người dùng: {intent}\n"
            f"Cảm xúc người dùng: {sentiment}\n"
            f"Lịch sử trò chuyện:\n{history_text}\n\n"
            f"Ngữ cảnh:\n{context}\n\n"
            f"Người dùng: {question}\nTrợ lý:"
        )

        try:
            response = gemini_model.generate_content(prompt)
            answer = response.text.strip()
            # Save to chat history
            chat_memory.setdefault(session_id, []).append((question, answer))
            return answer
        except Exception as e:
            return f"Đã xảy ra lỗi: {e}"

# ----------- Endpoints -----------

@app.get("/greet")
def greet_user():
    return {
        "message": "Xin chào, tôi có thể giúp gì cho bạn?",
        "suggestions": ["Hỏi về sản phẩm", "Tồn kho hiện tại", "Khuyến mãi hôm nay"]
    }

@app.post("/ask")
def ask_question(data: QuestionRequest):
    question = data.question.strip()
    session_id = data.session_id.strip()

    if not question:
        return {"error": "Câu hỏi không được để trống."}
    if not session_id:
        return {"error": "Thiếu session_id để lưu lịch sử hội thoại."}

    answer = generate_answer(session_id, question)
    return {
        "session_id": session_id,
        "question": question,
        "answer": answer,
        "history": chat_memory.get(session_id, [])
    }
