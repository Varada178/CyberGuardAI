import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Network,
  Play,
  RefreshCw,
  ShieldAlert,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   API CONFIGURATION
   ========================================================= */

// Change ONLY this if your Django backend runs somewhere else.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Change these two paths if your urls.py uses different paths.
const REQUIRED_FEATURES_ENDPOINT =
  "/api/prediction/features/";

const PREDICT_ENDPOINT =
  "/api/prediction/predict/";

/* =========================================================
   TYPES
   ========================================================= */

interface NetworkAnalysisModalProps {
  open: boolean;
  onClose: () => void;
}

interface RequiredFeaturesResponse {
  success: boolean;
  count: number;
  features: string[];
  message?: string;
  errors?: Record<string, unknown>;
}

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

interface PredictionResponse {
  success: boolean;
  message?: string;
  data?: PredictionData;
  errors?: Record<string, unknown>;
}

interface FeatureValues {
  [key: string]: string;
}

/* =========================================================
   AUTHENTICATION
   ========================================================= */

/**
 * Your application stores the JWT here:
 *
 * cyberguard_access_token
 *
 * Therefore we use this exact key.
 */
function getAccessToken(): string | null {
  return localStorage.getItem("cyberguard_access_token");
}

/**
 * Build authenticated headers for Django REST Framework.
 */
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Authentication token not found. Please login again."
    );
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
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
    if (typeof errors === "string") {
      return errors;
    }

    return Object.entries(errors)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(", ")}`;
        }

        if (typeof value === "object" && value !== null) {
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
   API - REQUIRED FEATURES
   ========================================================= */

async function fetchRequiredFeatures(): Promise<string[]> {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}${REQUIRED_FEATURES_ENDPOINT}`,
    {
      method: "GET",
      headers,
    }
  );

  let data: RequiredFeaturesResponse;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Backend returned an invalid response. HTTP ${response.status}`
    );
  }

  if (response.status === 401) {
    throw new Error(
      "Your login session has expired. Please login again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        formatBackendErrors(data.errors) ||
        `Unable to load required features. HTTP ${response.status}`
    );
  }

  if (!data.success) {
    throw new Error(
      data.message ||
        formatBackendErrors(data.errors) ||
        "Unable to load required features."
    );
  }

  if (!Array.isArray(data.features)) {
    throw new Error(
      "Backend did not return a valid feature list."
    );
  }

  return data.features;
}

/* =========================================================
   API - PREDICTION
   ========================================================= */

async function predictAttack(
  features: Record<string, number>
): Promise<PredictionResponse> {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}${PREDICT_ENDPOINT}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        features,
      }),
    }
  );

  let data: PredictionResponse;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Backend returned an invalid response. HTTP ${response.status}`
    );
  }

  if (response.status === 401) {
    throw new Error(
      "Your login session has expired. Please login again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        formatBackendErrors(data.errors) ||
        `Prediction failed. HTTP ${response.status}`
    );
  }

  if (!data.success) {
    throw new Error(
      data.message ||
        formatBackendErrors(data.errors) ||
        "Prediction failed."
    );
  }

  return data;
}

/* =========================================================
   FEATURE NAME FORMATTER
   ========================================================= */

function formatFeatureName(feature: string): string {
  return feature
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export  function NetworkAnalysisModal({
  open,
  onClose,
}: NetworkAnalysisModalProps) {
  const [features, setFeatures] = useState<string[]>([]);

  const [values, setValues] = useState<FeatureValues>({});

  const [loadingFeatures, setLoadingFeatures] =
    useState(false);

  const [predicting, setPredicting] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const [prediction, setPrediction] =
    useState<PredictionData | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  /* =======================================================
     LOAD FEATURES
     ======================================================= */

  const loadFeatures = async () => {
    setLoadingFeatures(true);
    setError(null);

    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const requiredFeatures =
        await fetchRequiredFeatures();

      setFeatures(requiredFeatures);

      // Create empty values for every model feature.
      const initialValues: FeatureValues = {};

      requiredFeatures.forEach((feature) => {
        initialValues[feature] = "";
      });

      setValues(initialValues);
    } catch (err) {
      console.error(
        "Unable to load required features:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load required features."
      );
    } finally {
      setLoadingFeatures(false);
    }
  };

  /* =======================================================
     LOAD WHEN MODAL OPENS
     ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    setPrediction(null);
    setSuccessMessage(null);
    setError(null);

    loadFeatures();
  }, [open]);

  /* =======================================================
     UPDATE FEATURE VALUE
     ======================================================= */

  const handleFeatureChange = (
    feature: string,
    value: string
  ) => {
    setValues((previous) => ({
      ...previous,
      [feature]: value,
    }));

    setError(null);
    setSuccessMessage(null);
  };

  /* =======================================================
     CLEAR ALL VALUES
     ======================================================= */

  const clearValues = () => {
    const emptyValues: FeatureValues = {};

    features.forEach((feature) => {
      emptyValues[feature] = "";
    });

    setValues(emptyValues);
    setPrediction(null);
    setError(null);
    setSuccessMessage(null);
  };

  /* =======================================================
     CHECK HOW MANY VALUES ARE FILLED
     ======================================================= */

  const filledCount = useMemo(() => {
    return features.filter(
      (feature) =>
        values[feature] !== undefined &&
        values[feature] !== ""
    ).length;
  }, [features, values]);

  /* =======================================================
     PREDICT
     ======================================================= */

  const handlePredict = async () => {
    setError(null);
    setSuccessMessage(null);
    setPrediction(null);

    if (features.length === 0) {
      setError(
        "No model features were loaded. Please refresh the feature list."
      );
      return;
    }

    /* -------------------------------------------------------
       Check empty fields
       ------------------------------------------------------- */

    const missingFeatures = features.filter(
      (feature) =>
        values[feature] === undefined ||
        values[feature] === ""
    );

    if (missingFeatures.length > 0) {
      setError(
        `Please enter values for all ${missingFeatures.length} missing feature(s).`
      );

      return;
    }

    /* -------------------------------------------------------
       Convert strings to numbers
       ------------------------------------------------------- */

    const numericFeatures: Record<string, number> = {};

    for (const feature of features) {
      const rawValue = values[feature];

      const numericValue = Number(rawValue);

      if (!Number.isFinite(numericValue)) {
        setError(
          `${formatFeatureName(
            feature
          )} must contain a valid number.`
        );

        return;
      }

      numericFeatures[feature] = numericValue;
    }

    /* -------------------------------------------------------
       Send prediction request
       ------------------------------------------------------- */

    setPredicting(true);

    try {
      const result =
        await predictAttack(numericFeatures);

      if (result.data) {
        setPrediction(result.data);
      }

      setSuccessMessage(
        result.message ||
          "Prediction completed successfully."
      );
    } catch (err) {
      console.error("Prediction error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Prediction failed."
      );
    } finally {
      setPredicting(false);
    }
  };

  /* =======================================================
     RISK CLASS
     ======================================================= */

  const getRiskClass = (risk?: string) => {
    if (!risk) {
      return "text-cyan-400";
    }

    const normalized = risk.toLowerCase();

    if (
      normalized.includes("critical") ||
      normalized.includes("high")
    ) {
      return "text-red-400";
    }

    if (normalized.includes("medium")) {
      return "text-yellow-400";
    }

    if (
      normalized.includes("low") ||
      normalized.includes("safe")
    ) {
      return "green-400";
    }

    return "text-cyan-400";
  };

  /* =======================================================
     DON'T RENDER WHEN CLOSED
     ======================================================= */

  if (!open) {
    return null;
  }

  /* =======================================================
     UI
     ======================================================= */

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
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
            className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950 shadow-[0_0_80px_rgba(0,200,255,0.15)]"
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                  <Network className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Network Analysis
                  </h2>

                  <p className="text-xs text-slate-400">
                    AI-powered network intrusion detection
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* =================================================
                BODY
            ================================================= */}

            <div className="max-h-[calc(92vh-145px)] overflow-y-auto p-6">
              {/* ===============================================
                  ERROR
              =============================================== */}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-red-300">
                      Error
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-xs text-red-200/80">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-red-300 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* ===============================================
                  SUCCESS
              =============================================== */}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-400" />

                  <p className="text-sm text-green-300">
                    {successMessage}
                  </p>
                </motion.div>
              )}

              {/* ===============================================
                  LOADING FEATURES
              =============================================== */}

              {loadingFeatures ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />

                  <p className="mt-4 text-sm text-slate-300">
                    Loading model features...
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Getting the required features from
                    CyberGuardAI
                  </p>
                </div>
              ) : (
                <>
                  {/* =============================================
                      TOP STATS
                  ============================================= */}

                  <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-cyan-400" />

                        <span className="text-xs text-slate-400">
                          Model Features
                        </span>
                      </div>

                      <p className="mt-2 text-xl font-semibold text-white">
                        {features.length}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />

                        <span className="text-xs text-slate-400">
                          Values Entered
                        </span>
                      </div>

                      <p className="mt-2 text-xl font-semibold text-white">
                        {filledCount}
                        <span className="ml-1 text-sm text-slate-500">
                          / {features.length}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-green-400" />

                        <span className="text-xs text-slate-400">
                          Authentication
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium text-green-400">
                        JWT Authenticated
                      </p>
                    </div>
                  </div>

                  {/* =============================================
                      FEATURE SECTION
                  ============================================= */}

                  {features.length > 0 ? (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            Network Flow Features
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Enter the values required by your
                            trained intrusion detection model.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={clearValues}
                          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />

                          Clear
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                          <motion.div
                            key={feature}
                            initial={{
                              opacity: 0,
                              y: 10,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay:
                                Math.min(
                                  index * 0.015,
                                  0.5
                                ),
                            }}
                          >
                            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              {formatFeatureName(feature)}
                            </label>

                            <input
                              type="number"
                              step="any"
                              value={
                                values[feature] ?? ""
                              }
                              onChange={(event) =>
                                handleFeatureChange(
                                  feature,
                                  event.target.value
                                )
                              }
                              placeholder="Enter value"
                              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:bg-cyan-500/[0.03] focus:ring-1 focus:ring-cyan-500/30"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10">
                      <Network className="h-10 w-10 text-slate-600" />

                      <p className="mt-3 text-sm text-slate-400">
                        No features loaded
                      </p>

                      <button
                        type="button"
                        onClick={loadFeatures}
                        className="mt-4 flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs text-cyan-300 transition hover:bg-cyan-500/20"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Load Features
                      </button>
                    </div>
                  )}

                  {/* =============================================
                      PREDICTION RESULT
                  ============================================= */}

                  {prediction && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-6 overflow-hidden rounded-xl border border-cyan-500/20 bg-cyan-500/[0.03]"
                    >
                      <div className="border-b border-white/10 px-5 py-4">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5 text-cyan-400" />

                          <h3 className="text-sm font-semibold text-white">
                            Analysis Result
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Attack */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">
                            Prediction
                          </p>

                          <p className="mt-1 text-base font-semibold text-white">
                            {prediction.predicted_attack ||
                              "Unknown"}
                          </p>
                        </div>

                        {/* Confidence */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">
                            Confidence
                          </p>

                          <p className="mt-1 text-base font-semibold text-cyan-400">
                            {typeof prediction.confidence ===
                            "number"
                              ? `${(
                                  prediction.confidence > 1
                                    ? prediction.confidence
                                    : prediction.confidence *
                                      100
                                ).toFixed(2)}%`
                              : "N/A"}
                          </p>
                        </div>

                        {/* Risk */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">
                            Risk Level
                          </p>

                          <p
                            className={`mt-1 text-base font-semibold ${getRiskClass(
                              prediction.risk_level
                            )}`}
                          >
                            {prediction.risk_level ||
                              "Unknown"}
                          </p>
                        </div>

                        {/* Is Attack */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">
                            Status
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            {prediction.is_attack ? (
                              <>
                                <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />

                                <span className="text-sm font-semibold text-red-400">
                                  Attack Detected
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="h-2 w-2 rounded-full bg-green-400" />

                                <span className="text-sm font-semibold text-green-400">
                                  Benign
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
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
                  )}
                </>
              )}
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="flex items-center justify-between border-t border-white/10 bg-black/20 px-6 py-4">
              <div className="text-xs text-slate-500">
                {features.length > 0
                  ? `${filledCount} of ${features.length} features entered`
                  : "Waiting for model features..."}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={
                    predicting ||
                    loadingFeatures ||
                    features.length === 0
                  }
                  className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {predicting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Analyze Network
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}