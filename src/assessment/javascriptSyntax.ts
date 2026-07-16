import { parse, type ParserPlugin } from '@babel/parser';
import type { DraftFiles } from './executionGate';

const PARSER_PLUGINS: ParserPlugin[] = [
  'jsx',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'dynamicImport',
  'importMeta',
  'topLevelAwait',
];

function hasValidFileSyntax(source: string): boolean {
  try {
    parse(source, {
      sourceType: 'unambiguous',
      allowAwaitOutsideFunction: true,
      plugins: PARSER_PLUGINS,
    });
    return true;
  } catch {
    return false;
  }
}

export function hasValidJavaScriptSyntax(
  files: DraftFiles,
  filePaths: readonly string[],
): boolean {
  return filePaths.every((filePath) => {
    const source = files[filePath];
    return source === undefined || hasValidFileSyntax(source);
  });
}
