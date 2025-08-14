export function getDifference<T extends { savedName: string }>(
  arr1: T[],
  arr2: T[],
): { onlyInArr1: T[]; onlyInArr2: T[]; inBoth: T[] } {
  const savedNames1 = new Set(arr1.map((item) => item.savedName));
  const savedNames2 = new Set(arr2.map((item) => item.savedName));

  const onlyInArr1 = arr1.filter((item) => !savedNames2.has(item.savedName));
  const onlyInArr2 = arr2.filter((item) => !savedNames1.has(item.savedName));
  const inBoth = arr1.filter((item) => savedNames2.has(item.savedName));

  return { onlyInArr1, onlyInArr2, inBoth };
}
