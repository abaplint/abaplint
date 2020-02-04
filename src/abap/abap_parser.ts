import {IFile} from "../files/_ifile";
import {Issue, Config} from "..";
import {ABAPFile} from "../files";
import {StatementParser} from "./statement_parser";
import {StructureParser} from "./structure_parser";

export class ABAPParser {

  // files is input for a single object
  public parse(files: IFile[], config: Config): {issues: Issue[], output: ABAPFile[]} {
    let issues: Issue[] = [];

    const output = new StatementParser().run(files, config);

    for (const f of output) {
      const result = StructureParser.run(f);
      f.setStructure(result.node);
      issues = issues.concat(result.issues);
    }

    return {issues, output};
  }

}