"use client";
import { useState } from "react";
import api from "@/lib/api";
import QuestionCard from "@/components/QuestionCard";

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return alert("주제를 입력하세요!");
    setLoading(true);

    try {
      // 1. AI로 질문을 생성합니다 (Gemini 호출)
      const res = await api.post("/generate", { topic, difficulty });
      setQuestions(res.data);

      // 2. 질문 저장을 위해 데이터 형식을 변환합니다.
      const questionsToSave = res.data.map((q: any) => ({
        question_text: q.question,
        question_type: q.type,
        answer_text: null,
      }));

      // 3. 생성된 질문을 즉시 DB에 저장합니다.
      await api.post("/save-interview", {
        topic: topic,
        questions_answers: questionsToSave,
      });

      console.log("질문 생성 및 DB 저장 성공!");
    } catch (error) {
      console.error("질문 생성 또는 저장 중 오류 발생:", error);
      alert("질문 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧠 인터뷰 질문 생성</h1>

      {/* 입력폼 */}
      <div className="flex flex-col space-y-3 mb-6">
        <input
          className="border p-3 rounded"
          placeholder="주제 입력 (예: python)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <select
          className="border p-3 rounded"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>easy</option>
          <option>intermediate</option>
          <option>hard</option>
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "생성 중..." : "AI 질문 생성하기"}
        </button>
      </div>

      {/* 질문 리스트 (답변 적는 곳) */}
      <div className="space-y-6">
        {questions.map((q: any, i: number) => (
          <QuestionCard key={i} question={q} />
        ))}
      </div>
    </div>
  );
}
