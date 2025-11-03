"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function RecordDetailPage() {
  const { date } = useParams();
  const [record, setRecord] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/records/${date}`)
      .then((res) => setRecord(res.data))
      .catch(() => setError("데이터를 불러오는 중 오류가 발생했습니다."));
  }, [date]);

  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!record) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{date} 기록 상세</h1>

      {record.answers.length === 0 ? (
        <p className="text-gray-500">아직 답변 기록이 없습니다.</p>
      ) : (
        record.answers.map((a: any, i: number) => (
          <div key={i} className="border p-4 rounded mb-4">
            <p className="font-semibold mb-1">Q: {a.question || "질문 없음"}</p>
            <p className="mb-2">A: {a.answer_text || "데이터 없음"}</p>
            <p>점수: {a.score ?? "-"}</p>
            <p>피드백: {a.feedback || "데이터 없음"}</p>
          </div>
        ))
      )}
    </div>
  );
}
