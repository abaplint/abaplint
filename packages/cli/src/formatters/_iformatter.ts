import {Issue} from "abaplint";

export interface IFormatter {
  output(issues: Issue[], fileCount: number): string;
}