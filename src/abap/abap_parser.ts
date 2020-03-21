import {IFile} from "../files/_ifile";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {Version} from "../version";
import {Lexer} from "./1_lexer/lexer";
import {StatementParser} from "./2_statements/statement_parser";
import {StructureParser} from "./3_structures/structure_parser";
import {ILexerResult} from "./1_lexer/lexer_result";

export class ABAPParser {
  private readonly version: Version;
  private readonly globalMacros: string[];

  public constructor(version: Version, globalMacros: string[]) {
    this.version = version;
    this.globalMacros = globalMacros;
  }

  // files is input for a single object
  public parse(files: IFile[]): {issues: Issue[], output: ABAPFile[]} {
    let issues: Issue[] = [];

// 1: lexing
    const lexerResult: readonly ILexerResult[] = files.map(f => Lexer.run(f));

// 2: statements
    const output = new StatementParser(this.version).run(lexerResult, this.globalMacros);

    for (const f of output) {
      const result = StructureParser.run(f);
      f.setStructure(result.node);
      issues = issues.concat(result.issues);
    }

    return {issues, output};
  }

}