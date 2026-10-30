/**
 * Secondary Database Strategy (Option A): Semantic Vector Search
 *
 * Implements semantic similarity search over unstructured Disaster Incident Reports
 * and incoming SOS texts using PostgreSQL pgvector cosine distance (<=>).
 *
 * Explanation for Evaluation:
 * 1. Data converted: Free-text emergency SOS dispatches & civilian distress reports
 * 2. Model: 1536-dimensional embeddings (compatible with Gemini text-embedding-004 / OpenAI)
 * 3. Storage: 'vector(1536)' column in PostgreSQL with HNSW cosine index
 * 4. Metric: Cosine Distance (1 - Cosine Similarity)
 */

export interface IncidentReportVectorRecord {
  report_id: number;
  disaster_id: number | null;
  reporter_contact: string | null;
  raw_sos_text: string;
  detected_urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  similarity_score?: number;
  created_at: string;
}

/**
 * SQL Query template to find top K semantically similar incident reports
 * given a query embedding vector.
 */
export function buildVectorSimilarityQuery(limit: number = 5): string {
  return `
    SELECT 
      report_id,
      disaster_id,
      reporter_contact,
      raw_sos_text,
      detected_urgency,
      created_at,
      ROUND((1 - (embedding <=> $1::vector))::numeric, 4) AS similarity_score
    FROM DISASTER_REPORT_VECTOR
    WHERE (1 - (embedding <=> $1::vector)) >= $2
    ORDER BY embedding <=> $1::vector ASC
    LIMIT ${limit};
  `;
}

/**
 * SQL statement to insert an incident report with an embedding vector
 */
export const INSERT_INCIDENT_VECTOR_SQL = `
  INSERT INTO DISASTER_REPORT_VECTOR (
    disaster_id,
    reporter_contact,
    raw_sos_text,
    detected_urgency,
    embedding
  ) VALUES ($1, $2, $3, $4, $5::vector)
  RETURNING report_id, created_at;
`;
