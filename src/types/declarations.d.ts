declare module "@google-cloud/secret-manager" {
  export class SecretManagerServiceClient {
    accessSecretVersion(args: { name: string }): Promise<[{ payload?: { data?: { toString: () => string } } }]>;
  }
}
