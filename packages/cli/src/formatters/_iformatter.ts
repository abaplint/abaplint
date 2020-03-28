import {Issue} from "../../../../src/issue";

export interface IFormatter {
  output(issues: Issue[], fileCount: number): string;
}