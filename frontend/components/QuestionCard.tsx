"use client";
import { useState } from "react";
import api from "@/lib/api";

export default function QuestionCard({ question }: { question: any }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) return alert("답변을 입력하세요!");
    setLoading(true);

    try {
      const res = await api.post("/answers", {
        question_text: question.question,
        answer_text: answer,
      });
      setResult(res.data);
    } catch (e) {
      alert("오류가 발생했습니다 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <p className="font-medium mb-3">{question.question}</p>

      {!result ? (
        <>
          <textarea
            className="w-full border p-2 rounded h-24"
            placeholder="여기에 답변을 입력하세요..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {loading ? "채점 중..." : "정답 제출"}
          </button>
        </>
      ) : (
        <div className="mt-4 bg-gray-50 border p-3 rounded">
          <p>
            🧾 <strong>점수:</strong> {result.score}
          </p>
          <p>
            💬 <strong>피드백:</strong> {result.feedback}
          </p>
          <button
            onClick={() => {
              setResult(null);
              setAnswer("");
            }}
            className="text-sm text-blue-600 underline mt-2"
          >
            다시 답변하기
          </button>
        </div>
      )}
    </div>
  );
}
