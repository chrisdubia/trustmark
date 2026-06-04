import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generateCertificatePDF(
  element: HTMLElement,
  certId: string,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#E8E6E0",
    width: 784,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pageW = 720;
  const pageH = Math.round((canvas.height / canvas.width) * pageW);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [pageW, pageH],
  });

  pdf.addImage(imgData, "PNG", 0, 0, pageW, pageH);
  pdf.save(`trustmarc-${certId}-${filename}.pdf`);
}
