import {Issue} from "@abaplint/core";

export interface IFormatter {
  output(issues: Issue[], fileCount: number): string;
}