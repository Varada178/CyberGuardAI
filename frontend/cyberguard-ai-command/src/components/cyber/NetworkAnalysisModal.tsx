import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Network,
  ShieldAlert,
  Upload,
  X,
  RefreshCw,
} from "lucide-react";

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

const PDF_PREDICT_ENDPOINT =
  "/api/prediction/predict/pdf/";

/* =========================================================
   TYPES
========================================================= */

interface NetworkAnalysisModalProps {
  open: boolean;
  onClose: () => void;
}

/* ---------------------------------------------------------
   Prediction returned by Django
--------------------------------------------------------- */

interface PredictionData {
  id?: number | string;

  predicted_attack?: string;

  confidence?: number;

  risk_level?: string;

  is_attack?: boolean;

  recommendation?: string;

  created_at?: string;

  [key: string]: unknown;
}

/* ---------------------------------------------------------
   Single PDF response
--------------------------------------------------------- */

interface SinglePDFData {
  record?: number;

  feature_count?: number;

  extracted_features?: Record<string, number>;

  prediction?: PredictionData;
}

/* ---------------------------------------------------------
   Batch prediction response

   IMPORTANT:

   Your backend currently returns:

   predictions: [
      {
         predicted_attack: "...",
         confidence: ...,
         risk_level: "...",
         is_attack: ...,
         recommendation: "..."
      }
   ]

   Therefore prediction itself can directly be
   PredictionData.

   We also support:

   {
      record: 1,
      prediction: {...}
   }

   so frontend remains compatible with both formats.
--------------------------------------------------------- */

interface BatchPredictionItem {
  record?: number;

  prediction?: PredictionData;

  predicted_attack?: string;

  confidence?: number;

  risk_level?: string;

  is_attack?: boolean;

  recommendation?: string;

  created_at?: string;

  [key: string]: unknown;
}

interface BatchPDFData {
  count?: number;

  feature_count?: number;

  predictions?: BatchPredictionItem[];
}

/* ---------------------------------------------------------
   Backend response
--------------------------------------------------------- */

interface PDFPredictionResponse {
  success: boolean;

  type?: "single" | "batch";

  message?: string;

  data?: SinglePDFData | BatchPDFData;

  errors?: Record<string, unknown>;
}

/* =========================================================
   AUTHENTICATION
========================================================= */

function getAccessToken(): string | null {
  /*
   * Your AuthContext stores the token using:
   *
   * cyberguard_access_token
   */

  return (
    localStorage.getItem(
      "cyberguard_access_token"
    ) ??
    sessionStorage.getItem(
      "cyberguard_access_token"
    )
  );
}

/* =========================================================
   ERROR HELPERS
========================================================= */

function formatBackendErrors(
  errors?: Record<string, unknown>
): string {
  if (!errors) {
    return "";
  }

  try {
    return Object.entries(errors)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(", ")}`;
        }

        if (
          typeof value === "object" &&
          value !== null
        ) {
          return `${key}: ${JSON.stringify(value)}`;
        }

        return `${key}: ${String(value)}`;
      })
      .join("\n");
  } catch {
    return "An unknown backend error occurred.";
  }
}

/* =========================================================
   PDF API
========================================================= */

async function uploadPDF(
  file: File
): Promise<PDFPredictionResponse> {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Authentication token not found. Please login again."
    );
  }

  const formData = new FormData();

  /*
   * IMPORTANT:
   *
   * Do NOT set Content-Type manually.
   *
   * Browser automatically creates:
   *
   * multipart/form-data;
   * boundary=...
   */

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}${PDF_PREDICT_ENDPOINT}`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    }
  );

  let data: PDFPredictionResponse;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Backend returned an invalid response. HTTP ${response.status}`
    );
  }

  /* -------------------------------------------------------
     Authentication error
  ------------------------------------------------------- */

  if (response.status === 401) {
    throw new Error(
      "Your login session has expired. Please login again."
    );
  }

  /* -------------------------------------------------------
     Backend HTTP error
  ------------------------------------------------------- */

  if (!response.ok) {
    throw new Error(
      data.message ||
        formatBackendErrors(data.errors) ||
        `PDF analysis failed. HTTP ${response.status}`
    );
  }

  /* -------------------------------------------------------
     Application-level error
  ------------------------------------------------------- */

  if (!data.success) {
    throw new Error(
      data.message ||
        formatBackendErrors(data.errors) ||
        "PDF analysis failed."
    );
  }

  return data;
}

/* =========================================================
   TYPE HELPERS
========================================================= */

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

/* ---------------------------------------------------------
   Check if response data contains batch predictions
--------------------------------------------------------- */

function hasBatchPredictions(
  data: SinglePDFData | BatchPDFData | undefined
): data is BatchPDFData {
  return (
    isObject(data) &&
    Array.isArray(
      (data as BatchPDFData).predictions
    )
  );
}

/* ---------------------------------------------------------
   Check if response data contains single prediction
--------------------------------------------------------- */

function hasSinglePrediction(
  data: SinglePDFData | BatchPDFData | undefined
): data is SinglePDFData {
  return (
    isObject(data) &&
    isObject(
      (data as SinglePDFData).prediction
    )
  );
}

/* =========================================================
   NORMALIZE BATCH PREDICTIONS
========================================================= */

interface NormalizedPrediction {
  record: number;
  prediction: PredictionData;
}

function normalizeBatchPredictions(
  predictions: BatchPredictionItem[]
): NormalizedPrediction[] {
  return predictions.map(
    (item, index) => {
      /*
       * Format 1:
       *
       * {
       *   record: 1,
       *   prediction: {...}
       * }
       */

      if (
        item.prediction &&
        isObject(item.prediction)
      ) {
        return {
          record:
            item.record ??
            index + 1,

          prediction:
            item.prediction,
        };
      }

      /*
       * Format 2:
       *
       * {
       *   predicted_attack: "BENIGN",
       *   confidence: 0.81,
       *   ...
       * }
       */

      const {
        record: _record,
        prediction: _prediction,
        ...directPrediction
      } = item;

      return {
        record:
          item.record ??
          index + 1,

        prediction:
          directPrediction as PredictionData,
      };
    }
  );
}

/* =========================================================
   FORMAT CONFIDENCE
========================================================= */

function formatConfidence(
  confidence?: number
): string {
  if (
    confidence === undefined ||
    confidence === null ||
    !Number.isFinite(confidence)
  ) {
    return "N/A";
  }

  /*
   * Backend may return:
   *
   * 0.8167
   *
   * OR
   *
   * 81.67
   */

  const percentage =
    confidence <= 1
      ? confidence * 100
      : confidence;

  return `${percentage.toFixed(2)}%`;
}

/* =========================================================
   RISK CLASS
========================================================= */

function getRiskClass(
  risk?: string
): string {
  if (!risk) {
    return "text-cyan-400";
  }

  const normalized =
    risk.toLowerCase();

  if (
    normalized.includes("critical") ||
    normalized.includes("high")
  ) {
    return "text-red-400";
  }

  if (
    normalized.includes("medium")
  ) {
    return "text-yellow-400";
  }

  if (
    normalized.includes("low") ||
    normalized.includes("safe") ||
    normalized.includes("benign")
  ) {
    return "text-green-400";
  }

  return "text-cyan-400";
}

/* =========================================================
   ATTACK CLASS
========================================================= */

function getAttackClass(
  isAttack?: boolean
): string {
  return isAttack
    ? "text-red-400"
    : "text-green-400";
}

/* =========================================================
   SINGLE RESULT
========================================================= */

function SinglePredictionResult({
  data,
}: {
  data: SinglePDFData;
}) {
  const prediction =
    data.prediction;

  if (!prediction) {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400" />

          <p className="text-sm text-yellow-300">
            Prediction result was not returned
            by the backend.
          </p>
        </div>
      </div>
    );
  }

  const isAttack =
    Boolean(prediction.is_attack);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="overflow-hidden rounded-xl border border-cyan-500/20 bg-cyan-500/[0.03]"
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-cyan-400" />

          <div>
            <h3 className="text-sm font-semibold text-white">
              Network Analysis Result
            </h3>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Single network flow analyzed
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-cyan-300">
          Record {data.record ?? 1}
        </div>
      </div>

      {/* =================================================
          RESULT CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Prediction */}

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Prediction
          </p>

          <p className="mt-2 break-words text-base font-semibold text-white">
            {prediction.predicted_attack ??
              "Unknown"}
          </p>
        </div>

        {/* Confidence */}

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Confidence
          </p>

          <p className="mt-2 text-base font-semibold text-cyan-400">
            {formatConfidence(
              prediction.confidence
            )}
          </p>
        </div>

        {/* Risk */}

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Risk Level
          </p>

          <p
            className={`mt-2 text-base font-semibold ${getRiskClass(
              prediction.risk_level
            )}`}
          >
            {prediction.risk_level ??
              "Unknown"}
          </p>
        </div>

        {/* Status */}

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Status
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isAttack
                  ? "animate-pulse bg-red-400"
                  : "bg-green-400"
              }`}
            />

            <span
              className={`text-sm font-semibold ${getAttackClass(
                isAttack
              )}`}
            >
              {isAttack
                ? "Attack Detected"
                : "Benign"}
            </span>
          </div>
        </div>
      </div>

      {/* =================================================
          FEATURE COUNT
      ================================================= */}

      {data.feature_count !==
        undefined && (
        <div className="border-t border-white/10 px-5 py-3">
          <p className="text-xs text-slate-500">
            Features extracted:{" "}
            <span className="font-semibold text-cyan-400">
              {data.feature_count}
            </span>
          </p>
        </div>
      )}

      {/* =================================================
          RECOMMENDATION
      ================================================= */}

      {prediction.recommendation && (
        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Recommendation
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {prediction.recommendation}
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* =========================================================
   BATCH RESULT TABLE
========================================================= */

function BatchPredictionResult({
  data,
}: {
  data: BatchPDFData;
}) {
  const predictions =
    Array.isArray(data.predictions)
      ? data.predictions
      : [];

  /*
   * VERY IMPORTANT:
   *
   * Normalize every prediction.
   *
   * This means both backend formats work.
   */

  const normalizedPredictions =
    useMemo(
      () =>
        normalizeBatchPredictions(
          predictions
        ),
      [predictions]
    );

  const totalRecords =
    data.count ??
    normalizedPredictions.length;

  const attackCount =
    normalizedPredictions.filter(
      ({ prediction }) =>
        Boolean(
          prediction.is_attack
        )
    ).length;

  const benignCount =
    normalizedPredictions.length -
    attackCount;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="overflow-hidden rounded-xl border border-cyan-500/20 bg-cyan-500/[0.03]"
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-cyan-400" />

          <div>
            <h3 className="text-sm font-semibold text-white">
              Batch Analysis Results
            </h3>

            <p className="mt-0.5 text-[11px] text-slate-500">
              All network-flow records analyzed
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Total */}

          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-medium text-cyan-300">
            {totalRecords}{" "}
            {totalRecords === 1
              ? "Record"
              : "Records"}
          </div>

          {/* Features */}

          {data.feature_count !==
            undefined && (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-slate-400">
              {data.feature_count} Features
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {normalizedPredictions.length ===
      0 ? (
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-yellow-400" />

          <p className="mt-3 text-sm text-slate-400">
            No predictions were returned
            by the backend.
          </p>
        </div>
      ) : (
        <>
          {/* =================================================
              TABLE
          ================================================= */}

          <div className="max-h-[480px] overflow-auto">
            <table className="w-full min-w-[900px] text-left">
              {/* TABLE HEADER */}

              <thead className="sticky top-0 z-20 bg-slate-950">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                    Record
                  </th>

                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                    Prediction
                  </th>

                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                    Confidence
                  </th>

                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                    Risk
                  </th>

                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                    Recommendation
                  </th>
                </tr>
              </thead>

              {/* =================================================
                  TABLE BODY
              ================================================= */}

              <tbody>
                {normalizedPredictions.map(
                  (
                    {
                      record,
                      prediction,
                    },
                    index
                  ) => {
                    const attackName =
                      prediction.predicted_attack ??
                      "Unknown";

                    const confidence =
                      prediction.confidence;

                    const risk =
                      prediction.risk_level ??
                      "Unknown";

                    const isAttack =
                      Boolean(
                        prediction.is_attack
                      );

                    const recommendation =
                      prediction.recommendation ??
                      "No recommendation";

                    return (
                      <motion.tr
                        key={`prediction-${record}-${index}`}
                        initial={{
                          opacity: 0,
                          y: 5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.15,
                          delay: Math.min(
                            index * 0.025,
                            0.5
                          ),
                        }}
                        className="border-b border-white/5 transition hover:bg-cyan-500/[0.04]"
                      >
                        {/* RECORD */}

                        <td className="px-4 py-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                            <span className="font-mono text-xs font-semibold text-cyan-400">
                              {record}
                            </span>
                          </div>
                        </td>

                        {/* PREDICTION */}

                        <td className="max-w-[200px] px-4 py-4">
                          <span
                            className={`break-words text-sm font-semibold ${
                              isAttack
                                ? "text-red-400"
                                : "text-white"
                            }`}
                          >
                            {attackName}
                          </span>
                        </td>

                        {/* CONFIDENCE */}

                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-cyan-400">
                            {formatConfidence(
                              confidence
                            )}
                          </span>
                        </td>

                        {/* RISK */}

                        <td className="px-4 py-4">
                          <span
                            className={`text-sm font-medium ${getRiskClass(
                              risk
                            )}`}
                          >
                            {risk}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                isAttack
                                  ? "animate-pulse bg-red-400"
                                  : "bg-green-400"
                              }`}
                            />

                            <span
                              className={`text-xs font-semibold ${getAttackClass(
                                isAttack
                              )}`}
                            >
                              {isAttack
                                ? "Attack Detected"
                                : "Benign"}
                            </span>
                          </div>
                        </td>

                        {/* RECOMMENDATION */}

                        <td className="max-w-[300px] px-4 py-4">
                          <p className="text-xs leading-5 text-slate-400">
                            {recommendation}
                          </p>
                        </td>
                      </motion.tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
            {/* Records */}

            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-cyan-400" />

              <span className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-semibold text-white">
                  {
                    normalizedPredictions.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">
                  {totalRecords}
                </span>{" "}
                network-flow records
              </span>
            </div>

            {/* COUNTS */}

            <div className="flex items-center gap-5 text-xs">
              {/* ATTACKS */}

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />

                <span className="text-slate-400">
                  Attacks:{" "}
                  <span className="font-semibold text-red-400">
                    {attackCount}
                  </span>
                </span>
              </div>

              {/* BENIGN */}

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />

                <span className="text-slate-400">
                  Benign:{" "}
                  <span className="font-semibold text-green-400">
                    {benignCount}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function NetworkAnalysisModal({
  open,
  onClose,
}: NetworkAnalysisModalProps) {
  /* -------------------------------------------------------
     SELECTED FILE
  ------------------------------------------------------- */

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  /* -------------------------------------------------------
     ANALYZING
  ------------------------------------------------------- */

  const [analyzing, setAnalyzing] =
    useState(false);

  /* -------------------------------------------------------
     API RESULT
  ------------------------------------------------------- */

  const [result, setResult] =
    useState<PDFPredictionResponse | null>(
      null
    );

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  const [error, setError] =
    useState<string | null>(null);

  /* -------------------------------------------------------
     SUCCESS
  ------------------------------------------------------- */

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  /* -------------------------------------------------------
     DRAGGING
  ------------------------------------------------------- */

  const [dragging, setDragging] =
    useState(false);

  /* =======================================================
     RESET
  ======================================================= */

  const resetAnalysis = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setSuccessMessage(null);
    setAnalyzing(false);
    setDragging(false);
  };

  /* =======================================================
     RESET WHEN MODAL CLOSES
  ======================================================= */

  useEffect(() => {
    if (!open) {
      resetAnalysis();
    }
  }, [open]);

  /* =======================================================
     FILE VALIDATION
  ======================================================= */

  const validateFile = (
    file: File
  ): boolean => {
    setError(null);
    setSuccessMessage(null);

    /* Extension */

    if (
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError(
        "Only PDF files are supported."
      );

      return false;
    }

    /* MIME */

    if (
      file.type &&
      file.type !== "application/pdf"
    ) {
      setError(
        "The selected file is not a valid PDF."
      );

      return false;
    }

    /* Empty */

    if (file.size === 0) {
      setError(
        "The selected PDF is empty."
      );

      return false;
    }

    /* Maximum 10 MB */

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "PDF file is too large. Maximum allowed size is 10 MB."
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     FILE SELECT
  ======================================================= */

  const handleFileSelect = (
    file: File
  ) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setError(null);

    setSuccessMessage(
      "PDF selected successfully. Ready for analysis."
    );
  };

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    handleFileSelect(file);

    /*
     * Allow same file to be selected again.
     */

    event.target.value = "";
  };

  /* =======================================================
     DRAG OVER
  ======================================================= */

  const handleDragOver = (
    event: React.DragEvent<HTMLLabelElement>
  ) => {
    event.preventDefault();

    setDragging(true);
  };

  /* =======================================================
     DRAG LEAVE
  ======================================================= */

  const handleDragLeave = (
    event: React.DragEvent<HTMLLabelElement>
  ) => {
    event.preventDefault();

    setDragging(false);
  };

  /* =======================================================
     DROP
  ======================================================= */

  const handleDrop = (
    event: React.DragEvent<HTMLLabelElement>
  ) => {
    event.preventDefault();

    setDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    handleFileSelect(file);
  };

  /* =======================================================
     ANALYZE PDF
  ======================================================= */

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError(
        "Please select a PDF file first."
      );

      return;
    }

    setAnalyzing(true);
    setError(null);
    setSuccessMessage(null);
    setResult(null);

    try {
      const response =
        await uploadPDF(selectedFile);

      console.log(
        "========== PDF API RESPONSE =========="
      );

      console.log(response);

      console.log(
        "Response type:",
        response.type
      );

      console.log(
        "Response data:",
        response.data
      );

      /*
       * IMPORTANT:
       *
       * Some backend versions may not correctly
       * send type = "batch".
       *
       * We therefore inspect data.predictions
       * as well.
       */

      if (
        response.data &&
        hasBatchPredictions(
          response.data
        )
      ) {
        console.log(
          "Detected BATCH response:",
          response.data.predictions.length,
          "records"
        );

        /*
         * Force the frontend type to batch.
         *
         * This protects us even if backend
         * accidentally sends type = "single".
         */

        const correctedResponse: PDFPredictionResponse =
          {
            ...response,
            type: "batch",
          };

        setResult(
          correctedResponse
        );
      } else {
        setResult(response);
      }

      setSuccessMessage(
        response.message ||
          "PDF extracted and prediction completed successfully."
      );
    } catch (err) {
      console.error(
        "PDF analysis error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze PDF."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  /* =======================================================
     FILE SIZE
  ======================================================= */

  const formatFileSize = (
    bytes: number
  ): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };

  /* =======================================================
     CLOSED
  ======================================================= */

  if (!open) {
    return null;
  }

  /* =======================================================
     DETECT RESULT TYPE
  ======================================================= */

  const isBatchResult =
    Boolean(
      result?.data &&
        hasBatchPredictions(
          result.data
        )
    );

  const isSingleResult =
    Boolean(
      result?.data &&
        hasSinglePrediction(
          result.data
        ) &&
        !isBatchResult
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              if (!analyzing) {
                onClose();
              }
            }
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              duration: 0.25,
            }}
            className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950 shadow-[0_0_80px_rgba(0,200,255,0.15)]"
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                  <Network className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Network Analysis
                  </h2>

                  <p className="text-xs text-slate-400">
                    Upload network-flow PDF
                    for AI-powered threat
                    detection
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={analyzing}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* =================================================
                SCROLLABLE CONTENT
            ================================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                  <div>
                    <p className="text-sm font-semibold text-red-300">
                      Analysis Error
                    </p>

                    <p className="mt-1 whitespace-pre-line text-xs leading-5 text-red-200/80">
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {successMessage &&
                !error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mb-5 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />

                    <p className="text-sm text-green-300">
                      {successMessage}
                    </p>
                  </motion.div>
                )}

              {/* =================================================
                  LOADING
              ================================================= */}

              {analyzing && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  className="flex min-h-[300px] flex-col items-center justify-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                  </div>

                  <p className="mt-5 text-sm font-medium text-white">
                    Analyzing network-flow
                    PDF...
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Extracting features and
                    running AI prediction
                  </p>

                  <div className="mt-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-cyan-400"
                      initial={{
                        width: "0%",
                      }}
                      animate={{
                        width: "100%",
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>

                  <p className="mt-3 text-[10px] uppercase tracking-widest text-cyan-500/70">
                    PDF → Feature Extraction
                    → ML Prediction
                  </p>
                </motion.div>
              )}

              {/* =================================================
                  RESULT
              ================================================= */}

              {!analyzing &&
                result?.success &&
                result.data && (
                  <div className="space-y-5">
                    {/* ------------------------------------------------
                        BATCH
                    ------------------------------------------------ */}

                    {isBatchResult &&
                      hasBatchPredictions(
                        result.data
                      ) && (
                        <BatchPredictionResult
                          data={
                            result.data
                          }
                        />
                      )}

                    {/* ------------------------------------------------
                        SINGLE
                    ------------------------------------------------ */}

                    {isSingleResult &&
                      hasSinglePrediction(
                        result.data
                      ) && (
                        <SinglePredictionResult
                          data={
                            result.data
                          }
                        />
                      )}

                    {/* ------------------------------------------------
                        FALLBACK
                    ------------------------------------------------ */}

                    {!isBatchResult &&
                      !isSingleResult && (
                        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 text-center">
                          <AlertCircle className="mx-auto h-8 w-8 text-yellow-400" />

                          <p className="mt-3 text-sm text-yellow-300">
                            The backend returned
                            a successful response,
                            but the prediction
                            format was not
                            recognized.
                          </p>

                          <pre className="mt-4 overflow-auto rounded-lg bg-black/30 p-4 text-left text-xs text-slate-400">
                            {JSON.stringify(
                              result.data,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      )}
                  </div>
                )}

              {/* =================================================
                  UPLOAD AREA
              ================================================= */}

              {!result &&
                !analyzing && (
                  <div className="mx-auto max-w-3xl">
                    {/* INTRO */}

                    <div className="mb-6 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
                        <FileText className="h-8 w-8 text-cyan-400" />
                      </div>

                      <h3 className="mt-4 text-xl font-semibold text-white">
                        Upload Network Flow
                        PDF
                      </h3>

                      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
                        Upload your network-flow
                        PDF. CyberGuard AI will
                        automatically extract the
                        required 30 features and
                        analyze every network-flow
                        record.
                      </p>
                    </div>

                    {/* UPLOAD */}

                    <label
                      htmlFor="network-pdf-upload"
                      onDragOver={
                        handleDragOver
                      }
                      onDragLeave={
                        handleDragLeave
                      }
                      onDrop={handleDrop}
                      className={`group relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
                        dragging
                          ? "border-cyan-400 bg-cyan-500/10"
                          : "border-white/10 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-cyan-500/[0.03]"
                      }`}
                    >
                      <input
                        id="network-pdf-upload"
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={
                          handleInputChange
                        }
                      />

                      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 transition group-hover:scale-105">
                        <Upload className="h-6 w-6 text-cyan-400" />
                      </div>

                      <p className="mt-4 text-sm font-medium text-white">
                        {dragging
                          ? "Drop your PDF here"
                          : "Drag & drop your PDF here"}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        or click to browse
                        files
                      </p>

                      <div className="mt-4 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                          PDF • Max 10 MB
                        </span>
                      </div>
                    </label>

                    {/* SELECTED FILE */}

                    {selectedFile && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="mt-4 flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                          <FileText className="h-5 w-5 text-red-400" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {selectedFile.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatFileSize(
                              selectedFile.size
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(
                              null
                            );

                            setError(null);

                            setSuccessMessage(
                              null
                            );
                          }}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    )}

                    {/* INFO */}

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                        <p className="text-lg font-semibold text-cyan-400">
                          30
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                          Required Features
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                        <p className="text-lg font-semibold text-cyan-400">
                          PDF
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                          Input Format
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                        <p className="text-lg font-semibold text-cyan-400">
                          AI
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                          Threat Detection
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="flex shrink-0 flex-col gap-3 border-t border-white/10 bg-black/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              {/* STATUS */}

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="h-3.5 w-3.5 text-cyan-500" />

                {result
                  ? "Analysis completed"
                  : selectedFile
                    ? "PDF ready for analysis"
                    : "No PDF selected"}
              </div>

              {/* BUTTONS */}

              <div className="flex flex-wrap items-center justify-end gap-3">
                {/* NEW ANALYSIS */}

                {(selectedFile ||
                  result) && (
                  <button
                    type="button"
                    onClick={
                      resetAnalysis
                    }
                    disabled={analyzing}
                    className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />

                    New Analysis
                  </button>
                )}

                {/* CLOSE */}

                <button
                  type="button"
                  onClick={onClose}
                  disabled={analyzing}
                  className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Close
                </button>

                {/* ANALYZE */}

                {!result && (
                  <button
                    type="button"
                    onClick={
                      handleAnalyze
                    }
                    disabled={
                      !selectedFile ||
                      analyzing
                    }
                    className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Analyzing...
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4" />

                        Analyze PDF
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}