
import {Unknown, MacroContent, MacroCall, Comment} from "../abap/statements/_statement";
import {ABAPFile} from "../files";
import {Config} from "..";
import {SequentialBlank, SequentialBlankConf} from "../rules";
import {UppercaseKeywords} from "./uppercase_keywords";
import {Indentation} from "./indentation";
import {IIndentationOptions} from "./indentation_options";

export class PrettyPrinter {
  private result: string;
  private readonly file: ABAPFile;
  private readonly options: IIndentationOptions;
  private readonly config: Config;

  constructor(file: ABAPFile, config: Config, options?: IIndentationOptions) {
    this.result = file.getRaw();
    this.file = file;
    this.options = options || {};
    this.config = config;
  }

  public run(): string {
    const statements = this.file.getStatements();
    for (const statement of statements) {
      if (statement.get() instanceof Unknown
        || statement.get() instanceof MacroContent
        || statement.get() instanceof MacroCall
        || statement.get() instanceof Comment) {
        continue;
      }

      // note that no positions are changed during a upperCaseKeys operation
      const upperCaseKeywords = new UppercaseKeywords(this.result);
      this.result = upperCaseKeywords.execute(statement);
    }

    const indentation = new Indentation(this.options);
    this.result = indentation.execute(this.file, this.result);

    const sequentialBlankConfig = this.getSequentialBlankConfig();
    if (sequentialBlankConfig && sequentialBlankConfig.enabled) {
      this.removeSequentialBlanks(sequentialBlankConfig.lines);
    }

    return this.result;
  }

  private getSequentialBlankConfig(): SequentialBlankConf | undefined {
    return this.config.readByRule(new SequentialBlank().getKey());
  }

  private removeSequentialBlanks(threshold: number) {
    const rows = this.file.getRawRows();

    let blanks = 0;
    const rowsToRemove: number[] = [];

    for (let i = 0; i < rows.length; i++) {
      if (SequentialBlank.isBlankOrWhitespace(rows[i])) {
        blanks++;
      } else {
        blanks = 0;
      }

      if (blanks === threshold) {
        // count additional blanks
        for (let j = i; j < rows.length; j++) {
          if (SequentialBlank.isBlankOrWhitespace(rows[j])) {
            rowsToRemove.push(j);
          } else {
            break;
          }
        }
      }
    }
    this.removeRows(rowsToRemove);
  }

  public getExpectedIndentation(): number[] {
    return (new Indentation(this.options)).run(this.file);
  }

  private removeRows(rowsToRemove: number[]) {
    const lines = this.result.split("\n");

    const withoutRemoved = lines.filter((_, idx) => {
      return rowsToRemove.indexOf(idx) === -1;
    });

    this.result = withoutRemoved.join("\n");
  }

}