import { describe, expect, it } from 'vitest';
import { modelUriFor } from '@/assessment/monacoSetup';
import { ASSESSMENT_REACT_TYPES } from '@/assessment/monacoReactTypes';

describe('assessment Monaco setup', () => {
  it('uses stable assessment model URIs', () => {
    expect(modelUriFor('/App.js')).toBe('file:///assessment/App.js');
    expect(modelUriFor('components/Card.jsx')).toBe('file:///assessment/components/Card.jsx');
  });

  it('bundles React, hooks, and JSX declarations locally', () => {
    expect(ASSESSMENT_REACT_TYPES).toContain("declare module 'react'");
    expect(ASSESSMENT_REACT_TYPES).toContain('function useState');
    expect(ASSESSMENT_REACT_TYPES).toContain('function useEffect');
    expect(ASSESSMENT_REACT_TYPES).toContain('interface IntrinsicElements');
    expect(ASSESSMENT_REACT_TYPES).toContain("declare module 'react-dom/client'");
  });
});
