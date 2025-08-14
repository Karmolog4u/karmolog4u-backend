export function attachTargetToFiles(
  files: { originalName: string; savedName: string; path: string }[],
  targetModel: string,
  targetId: any,
) {
  return files.map((file) => ({
    ...file,
    targetModel,
    targetId,
  }));
}
