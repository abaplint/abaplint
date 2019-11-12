
import {Unknown, MacroContent, MacroCall, Comment} from "../abap/statements/_statement";
import {ABAPFile} from "../files";
import {Config} from "..";
import {UppercaseKeywords} from "./uppercase_keywords";
import {Indent as Indent} from "./indent";
import {IIndentationOptions} from "./indentation_options";
import {RemoveSequentialBlanks} from "./remove_sequential_blanks";

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

    const indentation = new Indent(this.options);
    this.result = indentation.execute(this.file, this.result);

    const removeBlanks = new RemoveSequentialBlanks(this.config);
    this.result = removeBlanks.execute(this.file, this.result);

    return this.result;
  }

}