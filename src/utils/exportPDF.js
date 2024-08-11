import jsPDF from "jspdf";

export const exportPDF = (recapToExport, documentTitle) => {
  const doc = new jsPDF({ format: "a4", unit: "pt" });
  const pageWidth = doc.internal.pageSize.width;
  const margin = 40; // 좌우 마진 설정
  let y = 80; // 초기 y 좌표값 (제목 하단에서 시작)
  const maxWidth = pageWidth - margin * 2; // 최대 너비 설정
  const lineHeight = 15; // 기본 줄 간격
  const questionGap = 40; // 문제 간의 간격 설정

  // 제목 추가
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(documentTitle, pageWidth / 2, 40, { align: "center" });
  y += 40; // 제목 하단으로 간격 추가

  recapToExport.forEach((recap, index) => {
    // Question 추가
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const splitQuestion = doc.splitTextToSize(
      `Q${index + 1}: ${recap.data.question}`,
      maxWidth
    );
    doc.text(splitQuestion, margin, y);
    y += splitQuestion.length * lineHeight; // 줄바꿈 된 줄의 수에 따라 y 좌표를 조정

    if (recap.data.question_format === "multiple_choice") {
      // Multiple choice format 처리
      recap.data.choices.forEach((choice, idx) => {
        y += lineHeight;
        const splitChoice = doc.splitTextToSize(
          `${String.fromCharCode(97 + idx)}. ${choice}`,
          maxWidth - 20
        );
        doc.text(splitChoice, margin + 20, y);
        y += splitChoice.length * lineHeight;
      });
    } else if (
      recap.data.question_format === "short_answer" ||
      recap.data.question_format === "fill_blank"
    ) {
      // Short answer or fill blank 처리
      y += lineHeight;
      doc.text("A. ", margin, y); // 유저가 답을 적을 수 있도록 "A." 표시
    }

    // 문제 간의 간격 추가
    y += questionGap;

    // 페이지의 하단에 다다르면 새로운 페이지 추가
    if (y > 750) {
      doc.addPage();
      y = margin; // 새로운 페이지의 시작 y 좌표값
    }
  });

  // Answer sheet를 새 페이지에 추가
  doc.addPage();
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Answer Sheet", pageWidth / 2, 40, { align: "center" });
  y = 80;

  recapToExport.forEach((recap, index) => {
    if (
      recap.data.question_format === "multiple_choice" ||
      recap.data.question_format === "short_answer" ||
      recap.data.question_format === "fill_blank"
    ) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const answerText = Array.isArray(recap.data.answer)
        ? recap.data.answer.join(", ")
        : recap.data.answer;
      const splitAnswer = doc.splitTextToSize(
        `Q${index + 1}: ${answerText}`,
        maxWidth
      );
      doc.text(splitAnswer, margin, y);
      y += splitAnswer.length * lineHeight + 10;

      // 페이지의 하단에 다다르면 새로운 페이지 추가
      if (y > 750) {
        doc.addPage();
        y = 40; // 새로운 페이지의 시작 y 좌표값
      }
    }
  });

  doc.save(`${documentTitle}.pdf`);
};
