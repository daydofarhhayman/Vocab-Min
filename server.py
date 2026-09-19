import os
import json
import time
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from mcp.server.fastmcp import FastMCP

# 1. 初始化 Firebase Admin
cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
if cred_json:
    cred = credentials.Certificate(json.loads(cred_json))
    firebase_admin.initialize_app(cred)
elif os.path.exists("serviceAccountKey.json"):
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
else:
    raise ValueError("未找到 FIREBASE_SERVICE_ACCOUNT 環境變數或 serviceAccountKey.json 檔案")

db = firestore.client()
USER_ID = os.environ.get("VOCABMIN_USER_ID", "").strip()

if not USER_ID:
    print("警告: 尚未設定 VOCABMIN_USER_ID 環境變數")

# 2. 建立 FastMCP 伺服器實例
port = int(os.environ.get("PORT", 8000))
mcp = FastMCP("VocabMin-Server", host="0.0.0.0", port=port)


# --- 工具 1: 新增單字 ---
@mcp.tool()
async def add_vocabulary_word(term: str, pos: str, definition: str, example: str = "") -> str:
    """新增單字至 VocabMin 單字庫中。
    
    Args:
        term: 英文單字或片語 (例如 'ubiquitous')
        pos: 詞性縮寫 (例如 'n.', 'v.', 'adj.', 'adv.', 'phr.')
        definition: 繁體中文翻譯與釋義
        example: 英文例句 (選填)
    """
    if not USER_ID:
        return "錯誤：伺服器未綁定使用者 ID (VOCABMIN_USER_ID)"
    
    clean_term = term.strip()
    words_ref = db.collection("users").document(USER_ID).collection("words")
    
    # 檢查是否已存在相同單字與釋義
    query = words_ref.where("term", "==", clean_term).where("def", "==", definition.strip()).limit(1).get()
    if len(query) > 0:
        return f"單字「{clean_term}」已存在於單字庫中（釋義相同），略過重複新增。"
    
    now = int(time.time() * 1000)
    word_id = f"{now}"
    
    new_word = {
        "id": word_id,
        "term": clean_term,
        "pos": pos.strip(),
        "def": definition.strip(),
        "ex": example.strip(),
        "level": 0,
        "interval": 1,
        "easeFactor": 2.5,
        "timestamp": now,
        "lastReview": now,
        "nextReview": now + 86400000  # 1 天後到期
    }
    
    words_ref.document(word_id).set(new_word)
    
    # 同步更新今日統計
    today_str = datetime.now().strftime("%Y-%m-%d")
    stats_ref = db.collection("users").document(USER_ID).collection("data").document("stats")
    stats_doc = stats_ref.get()
    stats_data = stats_doc.to_dict() if stats_doc.exists else {}
    if today_str not in stats_data:
        stats_data[today_str] = {"added": 0, "reviewed": 0}
    stats_data[today_str]["added"] = stats_data[today_str].get("added", 0) + 1
    stats_ref.set(stats_data)
    
    return f"已成功新增單字至 VocabMin：「{clean_term}」 ({pos.strip()}) - {definition.strip()}"


# --- 工具 2: 查詢今日到期複習單字 ---
@mcp.tool()
async def get_due_review_words(limit: int = 15) -> str:
    """查詢使用者目前已到期、需要進行間隔重複複習的單字清單。"""
    if not USER_ID:
        return "錯誤：伺服器未綁定使用者 ID (VOCABMIN_USER_ID)"
        
    now = int(time.time() * 1000)
    words_ref = db.collection("users").document(USER_ID).collection("words")
    
    # 抓取到期單字
    docs = words_ref.where("nextReview", "<=", now).order_by("nextReview").limit(limit).get()
    
    if not docs:
        return "目前沒有到期的單字，今日進度已完成！"
        
    results = []
    for doc in docs:
        w = doc.to_dict()
        results.append(f"- **{w.get('term')}** ({w.get('pos')}): {w.get('def')}")
        
    return f"今日共有 {len(docs)} 個到期單字待複習（顯示前 {len(results)} 個）：\n" + "\n".join(results)


# --- 工具 3: 搜尋單字庫 ---
@mcp.tool()
async def search_words(keyword: str) -> str:
    """在單字庫中搜尋包含指定關鍵字的單字或釋義。"""
    if not USER_ID:
        return "錯誤：伺服器未綁定使用者 ID (VOCABMIN_USER_ID)"
        
    keyword_lower = keyword.strip().lower()
    words_ref = db.collection("users").document(USER_ID).collection("words")
    docs = words_ref.stream()
    
    matches = []
    for doc in docs:
        w = doc.to_dict()
        if keyword_lower in w.get("term", "").lower() or keyword_lower in w.get("def", "").lower():
            matches.append(f"- **{w.get('term')}** ({w.get('pos')}): {w.get('def')} [Level: {w.get('level', 0)}]")
            if len(matches) >= 10:
                break
                
    if not matches:
        return f"單字庫中未找到與「{keyword}」相符的單字。"
        
    return f"搜尋到以下單字：\n" + "\n".join(matches)


# --- 工具 4: 取得學習統計 ---
@mcp.tool()
async def get_learning_stats() -> str:
    """獲取使用者的 VocabMin 總學習統計數據（總單字量、各熟練度統計）。"""
    if not USER_ID:
        return "錯誤：伺服器未綁定使用者 ID (VOCABMIN_USER_ID)"
        
    words_ref = db.collection("users").document(USER_ID).collection("words")
    docs = words_ref.stream()
    
    total = 0
    levels = {0: 0, 1: 0, 2: 0, 3: 0}
    for doc in docs:
        w = doc.to_dict()
        total += 1
        lvl = w.get("level", 0)
        levels[lvl] = levels.get(lvl, 0) + 1
        
    return (
        f"📊 VocabMin 學習統計：\n"
        f"- 總單字量：{total} 個\n"
        f"- 精通 (Mastered)：{levels} 個\n"
        f"- 熟悉 (Familiar)：{levels} 個\n"
        f"- 學習中 (Learning)：{levels} 個\n"
        f"- 陌生 (New)：{levels[0]} 個"
    )

if __name__ == "__main__":
    mcp.run(transport="sse")