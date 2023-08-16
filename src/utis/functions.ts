export function isAlmostCero(number: number): boolean {
  return -0.01 < number && number < 0.01;
}
