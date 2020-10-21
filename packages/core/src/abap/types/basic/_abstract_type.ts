export interface AbstractType {
  toText(level: number): string;
  toABAP(): string;
  isGeneric(): boolean;
  containsVoid(): boolean;
}