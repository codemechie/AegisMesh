export function shortModelName(model: string): string {
  return model.split("/").pop() ?? "";
}

export function formatRecommendation(rec: string): string {
  return rec.replace(/_/g, " ");
}
