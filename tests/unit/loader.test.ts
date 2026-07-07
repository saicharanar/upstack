import { describe, expect, it } from 'vitest';
import { getAssessmentBundle, getManifest } from '@/content-layer/loader';

describe('content manifest', () => {
  it('loads the Describing UI module and orders chapters by their order field', () => {
    const manifest = getManifest();
    const module = manifest.modules.find((entry) => entry.moduleId === 'describing-ui');

    expect(module).toBeDefined();
    const ids = manifest.chaptersInOrder.map((chapter) => chapter.chapterId);
    expect(ids).toContain('jsx');
    expect(ids).toContain('passing-props');
    expect(ids.indexOf('jsx')).toBeLessThan(ids.indexOf('passing-props'));
  });

  it('parses the JSX chapter frontmatter, including its assessment id', () => {
    const chapter = getManifest().chaptersInOrder.find((entry) => entry.chapterId === 'jsx');
    expect(chapter?.frontmatter.assessment).toBe('jsx-user-card');
    expect(chapter?.frontmatter.status).toBe('published');
  });
});

describe('assessment bundle assembly', () => {
  it('bundles editable files and hidden tests while excluding the reference solution', async () => {
    const bundle = await getAssessmentBundle('jsx-user-card');

    expect(bundle.files[bundle.entry]).toBeDefined();
    expect(Object.keys(bundle.files).some((file) => file.endsWith('.test.js'))).toBe(true);
    expect(Object.keys(bundle.files).every((file) => !file.toLowerCase().includes('solution'))).toBe(true);
  });

  it('marks the starter file as editable and the tests as hidden', async () => {
    const bundle = await getAssessmentBundle('jsx-user-card');
    expect(bundle.files['/App.js']?.readOnly).toBe(false);
    const testFile = Object.entries(bundle.files).find(([file]) => file.endsWith('.test.js'));
    expect(testFile?.[1].hidden).toBe(true);
  });
});
