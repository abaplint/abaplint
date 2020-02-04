import {IFile} from "../files/_ifile";
import { Issue, Config } from "..";
import { ABAPFile } from "../files";
import { Lexer } from "./lexer";
import { StatementParser } from "./statement_parser";
import { StructureParser } from "./structure_parser";

export class ABAPParser {

  public parse(files: IFile[], config: Config): {issues: Issue[], output: ABAPFile[]} {
    const output: ABAPFile[] = [];
    let issues: Issue[] = [];

    for (const file of files) {
      const tokens = Lexer.run(file);
      const statements = new StatementParser().run(tokens, config);
      output.push(new ABAPFile(file, tokens, statements));
    }

    for (const f of output) {
      const result = StructureParser.run(f);
      f.setStructure(result.node);
      issues = issues.concat(result.issues);
    }

    return {issues, output};
  }

}