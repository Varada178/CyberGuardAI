import { apiRequest } from "@/lib/api";

export type PredictionResult = {
  predicted_attack: string;
  confidence: number;
  risk_level: "High" | "Medium" | "Low";
  recommendation: string;
  is_attack: boolean;
  class_probabilities: Record<string, number>;
};

type FeaturesResponse = {
  success: true;
  count: number;
  features: string[];
};

type PredictResponse = {
  success: true;
  message: string;
  data: PredictionResult;
};

type BatchPredictResponse = {
  success: true;
  message: string;
  data: {
    count: number;
    predictions: PredictionResult[];
  };
};

export async function fetchRequiredFeatures(token: string) {
  const response = await apiRequest<FeaturesResponse>("/api/prediction/features/", {
    token,
  });
  return response.features;
}

export async function predictAttack(
  token: string,
  features: Record<string, number>,
) {
  const response = await apiRequest<PredictResponse>("/api/prediction/predict/", {
    method: "POST",
    token,
    body: { features },
  });
  return response.data;
}

export async function predictAttackBatch(
  token: string,
  samples: Array<Record<string, number>>,
) {
  const response = await apiRequest<BatchPredictResponse>(
    "/api/prediction/predict/batch/",
    {
      method: "POST",
      token,
      body: {
        samples: samples.map((features) => ({ features })),
      },
    },
  );
  return response.data.predictions;
}

export const SAMPLE_FLOW_FEATURES: Record<string, number> = {
  "Bwd Packet Length Std": 613.8496,
  "Bwd Packet Length Mean": 466.8889,
  "Packet Length Variance": 215584.731,
  "Total Length of Bwd Packets": 4202,
  "Average Packet Size": 263.05554,
  "Avg Bwd Segment Size": 466.8889,
  "Packet Length Std": 464.31104,
  "Subflow Bwd Bytes": 4202,
  "Max Packet Length": 1430,
  "Packet Length Mean": 249.21053,
  "Total Length of Fwd Packets": 533,
  "Subflow Fwd Bytes": 533,
  "Bwd Packet Length Max": 1430,
  "Fwd Packet Length Max": 205,
  "Destination Port": 443,
  "Fwd Packet Length Mean": 59.22222,
  "Total Fwd Packets": 9,
  "Flow IAT Max": 44289,
  "Subflow Fwd Packets": 9,
  "Avg Fwd Segment Size": 59.22222,
  "Init_Win_bytes_backward": 351,
  "Bwd Header Length": 192,
  act_data_pkt_fwd: 8,
  "Flow IAT Std": 17080.37861,
  min_seg_size_forward: 20,
  "Fwd Header Length.1": 192,
  "Fwd IAT Total": 257177,
  "Flow Bytes/s": 18411.44426,
  "Bwd Packets/s": 34.99535339,
  Init_Win_bytes_forward: 8192,
};
