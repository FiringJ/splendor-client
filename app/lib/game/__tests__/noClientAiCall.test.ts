import fs from 'fs';
import path from 'path';

function collectSource(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '__tests__') return [];
      return collectSource(fullPath);
    }
    if (!/\.(ts|tsx|js|jsx|mjs|env)$/.test(entry.name)) return [];
    return [fs.readFileSync(fullPath, 'utf8')];
  });
}

describe('client AI boundary', () => {
  it('does not call OpenRouter or TypeSafe and does not expose API keys', () => {
    const sources = collectSource(path.join(process.cwd(), 'app')).join('\n');
    expect(sources).not.toMatch(/openrouter\.ai/i);
    expect(sources).not.toMatch(/NEXT_PUBLIC_[A-Z0-9_]*(KEY|TOKEN|SECRET)/);
    expect(sources).not.toMatch(/OPENROUTER_API_KEY|TYPESAFE_API_KEY/);
    expect(sources).not.toMatch(/from ['"]openai['"]|from ['"]@typesafe\//);
  });
});
