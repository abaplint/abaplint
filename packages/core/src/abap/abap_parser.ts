import {ABAPFile} from "./abap_file";
import {ABAPFileInformation} from "./4_file_information/abap_file_information";
import {ABAPFileInformationParser} from "./4_file_information/abap_file_information_parser";
import {IABAPLexerResult} from "./1_lexer/lexer_result";
import {IFile} from "../files/_ifile";
import {IRegistry} from "../_iregistry";
import {Issue} from "../issue";
import {Lexer} from "./1_lexer/lexer";
import {StatementParser} from "./2_statements/statement_parser";
import {StructureParser} from "./3_structures/structure_parser";
import {ABAPRelease, LanguageVersion, defaultRelease} from "../version";

export interface IABAPParserResult {
  issues: readonly Issue[],
  output: readonly ABAPFile[],
  /** runtime in milliseconds */
  runtime: number,
  runtimeExtra: {lexing: number, statements: number, structure: number},
}

export interface IABAPParserOptions {
  release?: ABAPRelease;
  languageVersion?: LanguageVersion;
  openABAP?: boolean;
  globalMacros?: readonly string[];
  reg?: IRegistry;
}

export class ABAPParser {
  private readonly release: ABAPRelease;
  private readonly languageVersion: LanguageVersion;
  private readonly openABAP: boolean;
  private readonly globalMacros: readonly string[];
  private readonly reg?: IRegistry;

  /** @deprecated Use `new ABAPParser(options)` instead */
  public constructor(release: ABAPRelease, globalMacros?: readonly string[], reg?: IRegistry);
  public constructor(options?: IABAPParserOptions);
  public constructor(
    optionsOrRelease?: IABAPParserOptions | ABAPRelease,
    globalMacros?: readonly string[],
    reg?: IRegistry,
  ) {
    if (optionsOrRelease === undefined || ABAPParser.isRelease(optionsOrRelease)) {
      this.release = optionsOrRelease ?? defaultRelease;
      this.languageVersion = LanguageVersion.Normal;
      this.openABAP = false;
      this.globalMacros = globalMacros ?? [];
      this.reg = reg;
    } else {
      this.release = optionsOrRelease.release ?? defaultRelease;
      this.languageVersion = optionsOrRelease.languageVersion ?? LanguageVersion.Normal;
      this.openABAP = optionsOrRelease.openABAP ?? false;
      this.globalMacros = optionsOrRelease.globalMacros ?? [];
      this.reg = optionsOrRelease.reg;
    }
  }

  private static isRelease(o: IABAPParserOptions | ABAPRelease): o is ABAPRelease {
    return typeof (o as ABAPRelease).ordinal === "number";
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
    const statementResult = new StatementParser(this.release, this.reg, this.languageVersion, this.openABAP)
      .run(lexerResult, this.globalMacros);
    const statementsRuntime = Date.now() - b2;

// 3: structures
    const b3 = Date.now();
    for (const f of statementResult) {
      const result = StructureParser.run(f);

// 4: file information
      const parser = new ABAPFileInformationParser(f.file.getFilename());
      const parsed = parser.parse(result.node);
      const info = new ABAPFileInformation(parsed);

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