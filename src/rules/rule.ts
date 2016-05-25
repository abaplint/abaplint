import File from "../file";

export interface Rule {
  getKey(): string;
  getDescription(): string;
  getConfig();
  setConfig(conf);
  run(file: File);
}