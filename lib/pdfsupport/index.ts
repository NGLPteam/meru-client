"use client";

import { pdfjs } from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

const PDF_JS_WORKER_SRC = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

pdfjs.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER_SRC;

export default pdfjs;
