export interface GcsModuleOptions {
  projectId?: string;
  keyFilename?: string; // шлях до service account json
  credentials?: {
    client_email: string;
    private_key: string;
  };
  bucket: string;
}
