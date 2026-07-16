import { format } from 'prettier/standalone';
import * as babelPlugin from 'prettier/plugins/babel';
import * as estreePlugin from 'prettier/plugins/estree';

export async function formatJavaScript(code: string): Promise<string> {
  return format(code, {
    parser: 'babel',
    plugins: [babelPlugin, estreePlugin],
    singleQuote: true,
    trailingComma: 'all',
  });
}
