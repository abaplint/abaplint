import {IFile} from "../files/_ifile";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {StatementParser} from "./2_statements/statement_parser";
import {StructureParser} from "./3_structures/structure_parser";
import {Version} from "../version";

export class ABAPParser {

  // files is input for a single object
  public parse(files: IFile[], version: Version, globalMacros: string[]): {issues: Issue[], output: ABAPFile[]} {
    let issues: Issue[] = [];

    const output = new StatementParser().run(files, version, globalMacros);

    for (const f of output) {
      const result = StructureParser.run(f);
      f.setStructure(result.node);
      issues = issues.concat(result.issues);
    }

    return {issues, output};
  }

}