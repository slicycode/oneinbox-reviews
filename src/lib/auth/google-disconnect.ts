type GoogleDisconnectOptions = {
  hasPassword: boolean;
  providers: string[];
};

export function canDisconnectGoogle({
  hasPassword,
  providers,
}: GoogleDisconnectOptions): boolean {
  return hasPassword || providers.some((provider) => provider !== "google");
}
