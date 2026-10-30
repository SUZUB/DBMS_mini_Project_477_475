'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, Play, Database, Check, Layers, Code } from 'lucide-react';

export default function ComplexQueriesView() {
  const [selectedId, setSelectedId] = useState<string>('1');
  const [queryData, setQueryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number>(0);

  const fetchQuery = async (id: string) => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(`/api/queries?id=${id}`);
      const data = await res.json();
      setQueryData(data);
      setExecutionTime(Number((performance.now() - start).toFixed(2)));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuery(selectedId);
  }, [selectedId]);

  const queryList = [
    { id: '1', title: 'Q1: Multi-Table JOIN & Aggregations', tag: 'INNER JOIN / SUM' },
    { id: '2', title: 'Q2: Stock Depletion Analysis', tag: 'GROUP BY / HAVING' },
    { id: '3', title: 'Q3: Dynamic Priority Analysis', tag: 'Correlated Subquery' },
    { id: '4', title: 'Q4: Camps with Zero Pending Requisitions', tag: 'NOT IN Subquery' },
    { id: '5', title: 'Q5: Warehouse Supply Ranking', tag: 'Window DENSE_RANK()' },
    { id: '6', title: 'Q6: Natural Language SOS Triage', tag: 'FULLTEXT Search' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview Banner */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ padding: 8, borderRadius: 10, background: 'rgba(56, 189, 248, 0.15)' }}>
            <Sparkles size={22} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
              Advanced SQL Analytical Laboratory
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Interactive demonstration of complex SQL operations mandated by Section 6 & 7 of the PES University DBMS Level 3 Project Rubric.
            </p>
          </div>
        </div>

        {/* Query Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
          marginTop: 18
        }}>
          {queryList.map(q => (
            <button
              key={q.id}
              onClick={() => setSelectedId(q.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '12px 14px',
                borderRadius: 10,
                textAlign: 'left',
                border: selectedId === q.id ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                background: selectedId === q.id ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: selectedId === q.id ? '#fff' : 'var(--text-primary)' }}>
                {q.title}
              </span>
              <span style={{ fontSize: '0.7rem', color: selectedId === q.id ? '#38bdf8' : 'var(--text-muted)', marginTop: 4 }}>
                {q.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Execution Details */}
      {queryData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          {/* Metadata & SQL Block */}
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                  {queryData.details.title}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                  Category: {queryData.details.category}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '4px 10px',
                  borderRadius: 6
                }}>
                  Execution: {executionTime}ms ({queryData.source})
                </span>
                <button
                  onClick={() => fetchQuery(selectedId)}
                  disabled={isLoading}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                >
                  <Play size={13} /> {isLoading ? 'Executing...' : 'Re-run Query'}
                </button>
              </div>
            </div>

            {/* Concepts tags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {queryData.details.concepts.map((concept: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    padding: '2px 8px',
                    borderRadius: 6
                  }}
                >
                  {concept}
                </span>
              ))}
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
              <strong>Theoretical Rationale:</strong> {queryData.details.explanation}
            </p>

            {/* SQL Statement Box */}
            <div className="code-box">
              <pre>{queryData.details.sql}</pre>
            </div>
          </div>

          {/* Results Table */}
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={18} color="#10b981" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                  Execution Result Set ({queryData.result?.length || 0} rows returned)
                </h4>
              </div>
            </div>

            {queryData.result && queryData.result.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(queryData.result[0]).map((col) => (
                        <th key={col} style={{ fontFamily: 'var(--font-mono)' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryData.result.map((row: any, rIdx: number) => (
                      <tr key={rIdx}>
                        {Object.values(row).map((val: any, cIdx: number) => (
                          <td key={cIdx} style={{ fontSize: '0.82rem' }}>
                            {val === null ? (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL</span>
                            ) : typeof val === 'object' ? (
                              JSON.stringify(val)
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '30px 20px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                No records returned by this query condition (e.g. all operational camps currently have active requisitions).
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
