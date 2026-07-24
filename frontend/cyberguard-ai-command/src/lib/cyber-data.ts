export const ATTACK_TYPES = [
  "DDoS", "Bot", "Port Scan", "SQL Injection", "Heartbleed",
  "Brute Force", "XSS", "Malware", "Ransomware", "Phishing",
];

export const PROTOCOLS = ["TCP", "UDP", "HTTP", "HTTPS", "ICMP", "DNS", "SSH"];

export const COUNTRIES = [
  { name: "United States", code: "US", x: 22, y: 40 },
  { name: "Russia", code: "RU", x: 65, y: 28 },
  { name: "China", code: "CN", x: 75, y: 42 },
  { name: "Brazil", code: "BR", x: 35, y: 65 },
  { name: "Germany", code: "DE", x: 52, y: 34 },
  { name: "India", code: "IN", x: 70, y: 50 },
  { name: "United Kingdom", code: "GB", x: 48, y: 32 },
  { name: "Iran", code: "IR", x: 60, y: 45 },
  { name: "North Korea", code: "KP", x: 80, y: 38 },
  { name: "Japan", code: "JP", x: 85, y: 42 },
];

export function randIP() {
  const r = () => Math.floor(Math.random() * 255);
  return `${r()}.${r()}.${r()}.${r()}`;
}

export function randPort() {
  const common = [22, 80, 443, 3306, 8080, 21, 25, 53, 3389, 8443];
  return Math.random() < 0.6
    ? common[Math.floor(Math.random() * common.length)]
    : Math.floor(Math.random() * 65535);
}

export function randAttack() {
  return ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
}

export function randCountry() {
  return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
}

export function randSeverity(): "low" | "medium" | "high" | "critical" {
  const r = Math.random();
  if (r < 0.35) return "low";
  if (r < 0.65) return "medium";
  if (r < 0.9) return "high";
  return "critical";
}

export function severityColor(s: string) {
  return {
    low: "text-safe",
    medium: "text-cyan",
    high: "text-warn",
    critical: "text-danger",
  }[s] ?? "text-foreground";
}

export function severityBg(s: string) {
  return {
    low: "bg-[oklch(0.78_0.2_150)]/15 border-[oklch(0.78_0.2_150)]/40 text-[oklch(0.85_0.2_150)]",
    medium: "bg-[oklch(0.85_0.18_200)]/15 border-[oklch(0.85_0.18_200)]/40 text-[oklch(0.9_0.18_200)]",
    high: "bg-[oklch(0.78_0.18_65)]/15 border-[oklch(0.78_0.18_65)]/40 text-[oklch(0.85_0.18_65)]",
    critical: "bg-[oklch(0.65_0.25_25)]/15 border-[oklch(0.65_0.25_25)]/40 text-[oklch(0.75_0.25_25)]",
  }[s] ?? "";
}

export const AI_MESSAGES = [
  "System Secure. All perimeters holding.",
  "Scanning 3,245 packets across 12 nodes...",
  "2 suspicious flows detected in sector 7.",
  "Random Forest model ready. Accuracy 98.4%.",
  "Threat intelligence database updated.",
  "Neural network sync complete.",
  "Anomaly detected: elevated egress on port 4444.",
  "Firewall rule set optimized.",
  "Behavioral baseline recalibrated.",
  "Quarantining suspicious payload from 185.220.101.42",
];
