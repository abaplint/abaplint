import {Unknown, MacroContent, MacroCall, Comment} from "../abap/2_statements/statements/_statement";
import {FixCase} from "./fix_keyword_case";
import {Indent as Indent} from "./indent";
import {IIndentationOptions} from "./indentation_options";
import {RemoveSequentialBlanks} from "./remove_sequential_blanks";
import {IConfiguration} from "../_config";
import {VirtualPosition} from "../position";
import {ABAPFile} from "../abap/abap_file";
import {Indentation, IndentationConf} from "../rules/indentation";

export class PrettyPrinter {
  private result: string;
  private readonly file: ABAPFile;
  private readonly options: IIndentationOptions;
  private readonly config: IConfiguration;

  public constructor(file: ABAPFile, config: IConfiguration) {
    this.result = file.getRaw();
    this.file = file;
    this.config = config;

    const indentationConf: IndentationConf = config.readByRule(new Indentation().getMetadata().key);

    this.options = {
      alignTryCatch: indentationConf.alignTryCatch,
      globalClassSkipFirst: indentationConf.globalClassSkipFirst,
    };
  }

  public run(): string {
    const statements = this.file.getStatements();
    for (const statement of statements) {
      if (statement.get() instanceof Unknown
        || statement.get() instanceof MacroContent
        || statement.get() instanceof MacroCall
        || statement.getFirstToken().getStart() instanceof VirtualPosition
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