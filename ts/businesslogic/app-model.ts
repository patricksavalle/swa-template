export type AppStatus = {
  readonly name: string;
  readonly environment: string;
};

export function formatAppStatus(status: AppStatus): string {
  return `${status.name} is running in ${status.environment}.`;
}
