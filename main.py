import os
import pymysql
import json
import google.generativeai as genai
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY가 .env 파일에 설정되지 않았습니다.")

genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-pro-latest')


def get_db_connection():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        yield connection
    except Exception as e:
        print(f"DB 연결 오류: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")
    finally:
        if 'connection' in locals() and connection:
            connection.close()


class QuestionQuery(BaseModel):
    topic: str
    difficulty: str = "easy"

class QuestionAnswerInput(BaseModel):
    question_text: str
    answer_text: str | None = None
    question_type: str = "general"

class InterviewSessionInput(BaseModel):
    topic: str
    questions_answers: List[QuestionAnswerInput]

class AnswerInput(BaseModel):
    question_text: str
    answer_text: str


@app.get("/")
def read_root():
    return {"message": "AI 면접 질문 생성기 백엔드 서버입니다."}


@app.post("/generate")
async def generate_questions(query: QuestionQuery):

    prompt = f"""
    당신은 IT 기업의 시니어 기술 면접관입니다.
    지금부터 '{query.topic}' 직무에 대한 면접을 시작하겠습니다.
    난이도는 '{query.difficulty}' 수준으로 조절해 주세요.

    이 직무에 대해 평가하기 위한 면접 질문 5개를 생성해 주세요.
    질문은 다음 유형을 골고루 포함해야 합니다:
    1. 기술 지식 (Technical)
    2. 프로젝트 경험 (Behavioral)
    3. 상황 대처 (Situational)

    답변은 반드시 다음 예시와 같은 JSON 리스트 형식으로만 제공해야 합니다.
    다른 설명은 절대 추가하지 마세요.

    [
      {{ "type": "technical", "question": "질문 내용..." }},
      {{ "type": "behavioral", "question": "질문 내용..." }},
      {{ "type": "situational", "question": "질문 내용..." }},
      {{ "type": "technical", "question": "질문 내용..." }},
      {{ "type": "behavioral", "question": "질문 내용..." }}
    ]
    """

    try:
        response = gemini_model.generate_content(prompt)
        response_text = response.text

        if response_text.strip().startswith("```json"):
            response_text = response_text.strip()[7:-3].strip()

        questions = json.loads(response_text)

        return questions

    except json.JSONDecodeError:
        print("JSON 파싱 오류:", response_text)
        raise HTTPException(status_code=500, detail="Gemini로부터 유효한 JSON을 받지 못했습니다.")
    except Exception as e:
        print(f"Gemini API 오류: {e}")
        raise HTTPException(status_code=500, detail=f"질문 생성 중 오류 발생: {str(e)}")


@app.post("/answers")
async def grade_answer(answer_data: AnswerInput):

    prompt = f"""
    당신은 IT 기업의 시니어 기술 면접관입니다.
    다음 면접 질문에 대한 사용자의 답변을 "100점 만점" 기준으로 채점해 주세요.

    [질문]
    {answer_data.question_text}

    [사용자의 답변]
    {answer_data.answer_text}

    [채점 기준]
    - 정확성: 답변이 기술적으로 올바른가?
    - 완성도: 질문의 핵심 요소를 모두 포함했는가?
    - 명확성: 설명이 명확하고 이해하기 쉬운가?

    [출력 형식]
    반드시 다음 예시와 같은 JSON 형식으로만 응답해 주세요.
    다른 설명은 절대 추가하지 마세요.

    {{
      "score": 85,
      "feedback": "답변이 전반적으로 정확하지만, ... 부분이 빠져있어 아쉽습니다. ... 점을 보완하면 더 좋겠습니다."
    }}
    """

    try:
        response = gemini_model.generate_content(prompt)
        response_text = response.text

        if response_text.strip().startswith("```json"):
            response_text = response_text.strip()[7:-3].strip()

        result = json.loads(response_text)

        return result

    except Exception as e:
        print(f"Gemini API 오류 (채점): {e}")
        raise HTTPException(status_code=500, detail=f"답변 채점 중 오류 발생: {str(e)}")


@app.post("/save-interview")
def save_interview(
        session_data: InterviewSessionInput,
        db: pymysql.connections.Connection = Depends(get_db_connection)
):
    try:
        with db.cursor() as cursor:
            sql_session = "INSERT INTO interview_sessions (role_query) VALUES (%s)"
            cursor.execute(sql_session, (session_data.topic,))

            session_id = cursor.lastrowid

            qa_data_list = [
                (session_id, qa.question_text, qa.answer_text, qa.question_type)
                for qa in session_data.questions_answers
            ]

            sql_qa = """
            INSERT INTO question_answers 
            (session_id, question_text, answer_text, question_type) 
            VALUES (%s, %s, %s, %s)
            """
            cursor.executemany(sql_qa, qa_data_list)

        db.commit()

        return {
            "message": "Interview session saved successfully",
            "session_id": session_id,
            "saved_questions": len(qa_data_list)
        }

    except Exception as e:
        db.rollback()
        print(f"Error saving interview: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save interview: {str(e)}")


@app.get("/records")
def get_all_interviews(
        db: pymysql.connections.Connection = Depends(get_db_connection)
):
    try:
        with db.cursor() as cursor:
            sql_sessions = "SELECT * FROM interview_sessions ORDER BY created_at DESC"
            cursor.execute(sql_sessions)
            sessions = cursor.fetchall()

            if not sessions:
                return []

            result = []
            for session in sessions:
                sql_qa = "SELECT * FROM question_answers WHERE session_id = %s"
                cursor.execute(sql_qa, (session['id'],))
                qas = cursor.fetchall()
                session['questions_answers'] = qas
                result.append(session)

            return result

    except Exception as e:
        print(f"Error fetching interviews: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch interviews: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)