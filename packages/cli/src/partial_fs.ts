export interface PartialFS {
  writeFileSync(name: string, raw: string): void;
  mkdirSync(name: string, settings: {recursive: boolean}): void;
  rmSync(name: string): void;
}