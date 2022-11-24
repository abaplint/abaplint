import {IFile} from "../files/_ifile";
import {Issue} from "../issue";
import {Version, defaultVersion} from "../version";
import {Lexer} from "./1_lexer/lexer";
import {StatementParser} from "./2_statements/statement_parser";
import {StructureParser} from "./3_structures/structure_parser";
import {IABAPLexerResult} from "./1_lexer/lexer_result";
import {ABAPFileInformation} from "./4_file_information/abap_file_information";
import {ABAPFile} from "./abap_file";
import {IRegistry} from "../_iregistry";

export interface IABAPParserResult {
  issues: readonly Issue[],
  output: readonly ABAPFile[],
  /** runtime in milliseconds */
  runtime: number,
  runtimeExtra: {lexing: number, statements: number, structure: number},
}

export class ABAPParser {
  private readonly version: Version;
  private readonly globalMacros: readonly string[];
  private readonly reg?: IRegistry;

  public constructor(version?: Version, globalMacros?: readonly string[], reg?: IRegistry) {
    this.version = version ? version : defaultVersion;
    this.globalMacros = globalMacros ? globalMacros : [];
    this.reg = reg;
  }

  // files is input for a single object
  public parse(files: readonly IFile[]): IABAPParserResult {
    const issues: Issue[] = [];
    const output: ABAPFile[] = [];

    const start = Date.now();

// 1: lexing
    const b1 = Date.now();
    const lexerResult: readonly IABAPLexerResult[] = files.map(f => new Lexer().run(f));
    const lexingRuntime = Date.now() - b1;

// 2: statements
    const b2 = Date.now();
    const statementResult = new StatementParser(this.version, this.reg).run(lexerResult, this.globalMacros);
    const statementsRuntime = Date.now() - b2;

// 3: structures
    const b3 = Date.now();
    for (const f of statementResult) {
      const result = StructureParser.run(f);

// 4: file information
      const info = new ABAPFileInformation(result.node, f.file.getFilename());

      output.push(new ABAPFile(f.file, f.tokens, f.statements, result.node, info));
      issues.push(...result.issues);
    }
    const structuresRuntime = Date.now() - b3;

    const end = Date.now();

    return {issues,
      output,
      runtime: end - start,
      runtimeExtra: {lexing: lexingRuntime, statements: statementsRuntime, structure: structuresRuntime},
    };
  }

}