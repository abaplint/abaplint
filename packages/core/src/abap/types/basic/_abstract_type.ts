export interface AbstractType {
  toText(level: number): string;
  isGeneric(): boolean;
  containsVoid(): boolean;
}