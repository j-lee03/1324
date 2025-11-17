"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import RecordCard from "@/components/RecordCard";

export default function HomePage() {
  const [records, setRecords] = useState([]);
  const router = useRouter();

  useEffect(() => {
    api.get("/records").then((res) => setRecords(res.data));
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 내 인터뷰 기록</h1>
      {records.length === 0 && (
        <p className="text-gray-500">아직 기록이 없습니다.</p>
      )}
      <div className="space-y-3">
        {records.map((r: any) => (
          <RecordCard
            key={r.date}
            date={r.date}
            avgScore={r.avg_score}
            totalAnswers={r.total_answers}
            onClick={() => router.push(`/records/${r.date}`)}
          />
        ))}
      </div>
      <button
        onClick={() => router.push("/generate")}
        className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        새 인터뷰 생성하기
      </button>
    </div>
  );
}
