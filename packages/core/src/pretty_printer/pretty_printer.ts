import {Unknown, MacroContent, MacroCall, Comment} from "../abap/2_statements/statements/_statement";
import {ABAPFile} from "../files";
import {FixCase} from "./fix_keyword_case";
import {Indent as Indent} from "./indent";
import {IIndentationOptions} from "./indentation_options";
import {RemoveSequentialBlanks} from "./remove_sequential_blanks";
import {IConfiguration} from "../_config";

export class PrettyPrinter {
  private result: string;
  private readonly file: ABAPFile;
  private readonly options: IIndentationOptions;
  private readonly config: IConfiguration;

  public constructor(file: ABAPFile, config: IConfiguration, options?: IIndentationOptions) {
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

      // note that no positions are changed when case is changed
      const fixCase = new FixCase(this.result, this.config);
      this.result = fixCase.execute(statement);
    }

    const indentation = new Indent(this.options);
    this.result = indentation.execute(this.file, this.result);

    const removeBlanks = new RemoveSequentialBlanks(this.config);
    this.result = removeBlanks.execute(this.file, this.result);

    return this.result;
  }

}