export interface PartialFS {
  writeFileSync(name: string, raw: string): void;
}