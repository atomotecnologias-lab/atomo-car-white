export type QualityCriterionKey =
  | "core_data"
  | "required_photos"
  | "recommended_photos"
  | "description_approved"
  | "features_reviewed"
  | "seo_generated"
  | "post_texts_generated"
  | "published"
  | "whatsapp_contextual";

export interface QualityCriterion {
  key: QualityCriterionKey;
  label: string;
  weight: number;
  satisfied: boolean;
}

export interface QualityScore {
  total: number; // 0..100
  criteria: QualityCriterion[];
}
