"use client";
// (useState는 이제 부모가 관리하므로 여기서 필요 없습니다)

export default function RecordCard({
  record,
  onClick,
  isExpanded, // --- (수정됨) 'isExpanded' prop 추가 ---
}: {
  record: any;
  onClick: () => void;
  isExpanded: boolean; // --- (수정됨) 'isExpanded' prop 타입 ---
}) {

  if (!record) {
    return null;
  }

  const topic = record.role_query || "주제 없음";
  const date = new Date(record.created_at).toLocaleString("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const totalQuestions = record.questions_answers?.length || 0;

  return (
    <div
      onClick={onClick}
      className="p-4 border rounded-lg hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold">{topic}</span>
        <span className="text-sm text-gray-500">{date}</span>
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-700">{totalQuestions}개의 질문</span>

        {/* --- (수정됨) 확장 상태 표시 --- */}
        <span className="text-sm text-blue-600">
          {isExpanded ? "▲ 접기" : "▼ 펼쳐보기"}
        </span>
      </div>

      {/* --- (수정됨) 'isExpanded'가 true일 때만 질문 목록을 표시 --- */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold mb-2">저장된 질문:</h4>
          <ul className="list-decimal list-inside space-y-2">
            {record.questions_answers.map((qa: any, index: number) => (
              <li key={index} className="text-gray-800">
                {qa.question_text}

                {/* 만약 저장된 답변이 있다면 함께 표시 */}
                {qa.answer_text && (
                   <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded mt-1 ml-4">
                     <strong>내 답변:</strong> {qa.answer_text}
                   </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


