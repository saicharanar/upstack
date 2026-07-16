import type {
  FileStat,
  FileSystem,
  FileSystemEntryType,
  FileSystemWatchContext,
  FileSystemWatchHandle,
} from 'modern-monaco/workspace';

interface StoredFile {
  readonly content: Uint8Array;
  readonly stat: FileStat;
}

interface WatchRegistration {
  readonly path: string;
  readonly recursive: boolean;
  readonly handle: FileSystemWatchHandle;
}

const DIRECTORY_TYPE: FileSystemEntryType = 2;
const FILE_TYPE: FileSystemEntryType = 1;

class AssessmentFileNotFoundError extends Error {
  readonly FS_ERROR = 'NOT_FOUND';

  constructor(path: string) {
    super(`No such file or directory: ${path}`);
  }
}

export function isAssessmentFileNotFoundError(error: unknown): boolean {
  return error instanceof Error && Reflect.get(error, 'FS_ERROR') === 'NOT_FOUND';
}

function normalizePath(name: string): string {
  const path = new URL(name, 'file:///').pathname;
  if (path === '/') return path;
  return path.replace(/\/+$/, '');
}

function parentPath(path: string): string {
  const separatorIndex = path.lastIndexOf('/');
  return separatorIndex <= 0 ? '/' : path.slice(0, separatorIndex);
}

function childName(parent: string, child: string): string | undefined {
  const prefix = parent === '/' ? '/' : `${parent}/`;
  if (!child.startsWith(prefix)) return undefined;
  const relativePath = child.slice(prefix.length);
  return relativePath && !relativePath.includes('/') ? relativePath : undefined;
}

function createStat(type: FileSystemEntryType, size: number, version = 1): FileStat {
  const now = Date.now();
  return { type, ctime: now, mtime: now, version, size };
}

export class AssessmentMemoryFileSystem implements FileSystem {
  private readonly directories = new Map<string, FileStat>([
    ['/', createStat(DIRECTORY_TYPE, 0)],
  ]);
  private readonly files = new Map<string, StoredFile>();
  private readonly watchers = new Set<WatchRegistration>();

  async stat(name: string): Promise<FileStat> {
    const path = normalizePath(name);
    const stat = this.files.get(path)?.stat ?? this.directories.get(path);
    if (!stat) throw new AssessmentFileNotFoundError(path);
    return { ...stat };
  }

  async createDirectory(name: string): Promise<void> {
    const path = normalizePath(name);
    if (this.directories.has(path)) return;

    const parent = parentPath(path);
    if (!this.directories.has(parent)) await this.createDirectory(parent);
    if (this.files.has(path)) throw new Error(`create directory ${path}: file exists`);

    this.directories.set(path, createStat(DIRECTORY_TYPE, 0));
    this.notify('create', path, DIRECTORY_TYPE);
  }

  async readDirectory(name: string): Promise<[string, number][]> {
    const path = normalizePath(name);
    const stat = await this.stat(path);
    if (stat.type !== DIRECTORY_TYPE) throw new Error(`read ${path}: not a directory`);

    const entries = new Map<string, number>();
    for (const directory of this.directories.keys()) {
      const name = childName(path, directory);
      if (name) entries.set(name, DIRECTORY_TYPE);
    }
    for (const file of this.files.keys()) {
      const name = childName(path, file);
      if (name) entries.set(name, FILE_TYPE);
    }

    return [...entries.entries()].sort(([left], [right]) => left.localeCompare(right));
  }

  async readFile(name: string): Promise<Uint8Array> {
    const path = normalizePath(name);
    const file = this.files.get(path);
    if (!file) throw new AssessmentFileNotFoundError(path);
    return file.content.slice();
  }

  async readTextFile(name: string): Promise<string> {
    return new TextDecoder().decode(await this.readFile(name));
  }

  async writeFile(
    name: string,
    content: string | Uint8Array,
    context?: FileSystemWatchContext,
  ): Promise<void> {
    const path = normalizePath(name);
    const directory = parentPath(path);
    if (!this.directories.has(directory)) {
      throw new Error(`write ${path}: no such directory`);
    }
    if (this.directories.has(path)) throw new Error(`write ${path}: is a directory`);

    const previous = this.files.get(path);
    const encodedContent = typeof content === 'string' ? new TextEncoder().encode(content) : content.slice();
    const stat = createStat(FILE_TYPE, encodedContent.byteLength, (previous?.stat.version ?? 0) + 1);
    this.files.set(path, { content: encodedContent, stat });
    this.notify(previous ? 'modify' : 'create', path, FILE_TYPE, context);
  }

  async delete(name: string, options?: { recursive: boolean }): Promise<void> {
    const path = normalizePath(name);
    if (this.files.delete(path)) {
      this.notify('remove', path, FILE_TYPE);
      return;
    }
    if (!this.directories.has(path)) throw new AssessmentFileNotFoundError(path);
    if (path === '/') throw new Error('cannot delete the workspace root');

    const prefix = `${path}/`;
    const nestedFiles = [...this.files.keys()].filter((entry) => entry.startsWith(prefix));
    const nestedDirectories = [...this.directories.keys()].filter((entry) => entry.startsWith(prefix));
    if (!options?.recursive && (nestedFiles.length > 0 || nestedDirectories.length > 0)) {
      throw new Error(`delete ${path}: directory not empty`);
    }

    nestedFiles.forEach((entry) => this.files.delete(entry));
    nestedDirectories.forEach((entry) => this.directories.delete(entry));
    this.directories.delete(path);
    this.notify('remove', path, DIRECTORY_TYPE);
  }

  async copy(source: string, target: string, options: { overwrite: boolean }): Promise<void> {
    const sourcePath = normalizePath(source);
    const targetPath = normalizePath(target);
    const sourceStat = await this.stat(sourcePath);

    try {
      await this.stat(targetPath);
      if (!options.overwrite) throw new Error(`copy ${targetPath}: destination exists`);
      await this.delete(targetPath, { recursive: true });
    } catch (error) {
      if (!isAssessmentFileNotFoundError(error)) throw error;
    }

    if (sourceStat.type === FILE_TYPE) {
      await this.createDirectory(parentPath(targetPath));
      await this.writeFile(targetPath, await this.readFile(sourcePath));
      return;
    }

    await this.createDirectory(targetPath);
    const entries = await this.readDirectory(sourcePath);
    for (const [name] of entries) {
      await this.copy(`${sourcePath}/${name}`, `${targetPath}/${name}`, options);
    }
  }

  async rename(oldName: string, newName: string, options: { overwrite: boolean }): Promise<void> {
    await this.copy(oldName, newName, options);
    await this.delete(oldName, { recursive: true });
  }

  watch(name: string, handle: FileSystemWatchHandle): () => void;
  watch(
    name: string,
    options: { recursive: boolean },
    handle: FileSystemWatchHandle,
  ): () => void;
  watch(
    name: string,
    optionsOrHandle: { recursive: boolean } | FileSystemWatchHandle,
    maybeHandle?: FileSystemWatchHandle,
  ): () => void {
    const registration: WatchRegistration = {
      path: normalizePath(name),
      recursive: typeof optionsOrHandle === 'function' ? false : optionsOrHandle.recursive,
      handle: typeof optionsOrHandle === 'function' ? optionsOrHandle : maybeHandle!,
    };
    this.watchers.add(registration);
    return () => this.watchers.delete(registration);
  }

  private notify(
    kind: 'create' | 'modify' | 'remove',
    path: string,
    type: FileSystemEntryType,
    context?: FileSystemWatchContext,
  ): void {
    for (const watcher of this.watchers) {
      const isExactPath = watcher.path === path;
      const isNestedPath = watcher.recursive && path.startsWith(`${watcher.path}/`);
      if (isExactPath || isNestedPath) watcher.handle(kind, path, type, context);
    }
  }
}
