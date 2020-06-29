import {IFile} from "../files/_ifile";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {Version, defaultVersion} from "../version";
import {Lexer} from "./1_lexer/lexer";
import {StatementParser} from "./2_statements/statement_parser";
import {StructureParser} from "./3_structures/structure_parser";
import {ILexerResult} from "./1_lexer/lexer_result";
import {ABAPFileInformation} from "./4_file_information/abap_file_information";

export interface IABAPParserResult {
  issues: readonly Issue[],
  output: readonly ABAPFile[],
  /** runtime in milliseconds */
  runtime: number,
}

export class ABAPParser {
  private readonly version: Version;
  private readonly globalMacros: readonly string[];

  public constructor(version?: Version, globalMacros?: readonly string[]) {
    this.version = version ? version : defaultVersion;
    this.globalMacros = globalMacros ? globalMacros : [];
  }

  // files is input for a single object
  public parse(files: readonly IFile[]): IABAPParserResult {
    let issues: Issue[] = [];
    const output: ABAPFile[] = [];

    const start = new Date().getMilliseconds();

// 1: lexing
    const lexerResult: readonly ILexerResult[] = files.map(f => Lexer.run(f));

// 2: statements
    const statementResult = new StatementParser(this.version).run(lexerResult, this.globalMacros);

// 3: structures
    for (const f of statementResult) {
      const result = StructureParser.run(f);

// 4: file information
      const info = new ABAPFileInformation(result.node, f.file.getFilename());

      output.push(new ABAPFile(f.file, f.tokens, f.statements, result.node, info));
      issues = issues.concat(result.issues);
    }

    const end = new Date().getMilliseconds();

    return {issues, output, runtime: end - start};
  }

}