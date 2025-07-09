import {Issue} from "../issue";
import {IFile} from "../files/_ifile";

export interface IIncludeGraph {
  listMainForInclude(filename: string): string[];
  getIssuesFile(file: IFile): Issue[]
}