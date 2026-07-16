const EXECUTION_DEBOUNCE_MS = 600;

export type DraftFiles = Readonly<Record<string, string>>;
export type ExecutionStatus = 'ready' | 'editing' | 'checking' | 'blocked' | 'running';

export interface ValidatedRevision {
  readonly files: DraftFiles;
  readonly revision: number;
}

interface AssessmentExecutionGateOptions {
  readonly validate: (files: DraftFiles) => Promise<boolean>;
  readonly publish: (revision: ValidatedRevision) => void;
  readonly onStatus: (status: ExecutionStatus) => void;
  readonly debounceMs?: number;
}

export class AssessmentExecutionGate {
  private readonly validate: AssessmentExecutionGateOptions['validate'];
  private readonly publish: AssessmentExecutionGateOptions['publish'];
  private readonly onStatus: AssessmentExecutionGateOptions['onStatus'];
  private readonly debounceMs: number;
  private revision = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private isDisposed = false;

  constructor({
    validate,
    publish,
    onStatus,
    debounceMs = EXECUTION_DEBOUNCE_MS,
  }: AssessmentExecutionGateOptions) {
    this.validate = validate;
    this.publish = publish;
    this.onStatus = onStatus;
    this.debounceMs = debounceMs;
  }

  schedule(files: DraftFiles): void {
    if (this.isDisposed) return;

    const revision = ++this.revision;
    const snapshot = { ...files };
    this.clearTimer();
    this.onStatus('editing');
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.validateRevision({ files: snapshot, revision });
    }, this.debounceMs);
  }

  dispose(): void {
    this.isDisposed = true;
    this.revision += 1;
    this.clearTimer();
  }

  private clearTimer(): void {
    if (!this.timer) return;
    clearTimeout(this.timer);
    this.timer = null;
  }

  private async validateRevision(candidate: ValidatedRevision): Promise<void> {
    if (!this.isCurrent(candidate.revision)) return;
    this.onStatus('checking');

    let isValid = false;
    try {
      isValid = await this.validate(candidate.files);
    } catch {
      isValid = false;
    }

    if (!this.isCurrent(candidate.revision)) return;
    if (!isValid) {
      this.onStatus('blocked');
      return;
    }

    this.onStatus('running');
    this.publish(candidate);
  }

  private isCurrent(revision: number): boolean {
    return !this.isDisposed && revision === this.revision;
  }
}
