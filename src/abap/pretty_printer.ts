import * as Statements from "./statements";
import * as Expressions from "./expressions";
import {Unknown, MacroContent, MacroCall, Comment, Empty} from "./statements/_statement";
import {StatementNode, ExpressionNode, TokenNodeRegex, TokenNode} from "./nodes";
import {ABAPFile} from "../files";
import {Identifier} from "./tokens";
import {Position} from "../position";

// todo, will break if there is multiple statements per line?

export interface IIndentationOptions {
  alignTryCatch?: boolean;
  globalClassSkipFirst?: boolean;
}

class Stack {
  private items: number[] = [];

  public push(item: number) {
    this.items.push(item);
  }

  public peek(): number {
    return this.items[this.items.length - 1];
  }

  public pop() {
    const peek = this.peek();
    this.items = this.items.slice(0, this.items.length - 1);
    return peek;
  }
}

class Indentation {
  private readonly options: IIndentationOptions;
  private readonly globalClasses = new Set();

  constructor(options: IIndentationOptions) {
    this.options = options;
  }

  // returns list of expected indentation for each line/statement?
  public run(file: ABAPFile): number[] {
    const ret: number[] = [];
    const init: number = 1;
    let indent: number = init;
    let parentIsEvent: boolean = false;
    const stack = new Stack();

    for (const statement of file.getStatements()) {
      const type = statement.get();

      if (type instanceof Statements.EndIf
          || type instanceof Statements.EndWhile
          || type instanceof Statements.EndModule
          || type instanceof Statements.EndSelect
          || type instanceof Statements.EndMethod
          || type instanceof Statements.EndAt
          || type instanceof Statements.Else
          || type instanceof Statements.EndOfDefinition
          || type instanceof Statements.EndLoop
          || type instanceof Statements.EndForm
          || type instanceof Statements.ElseIf
          || type instanceof Statements.EndFunction
          || type instanceof Statements.EndInterface
          || type instanceof Statements.EndDo) {
        indent = indent - 2;
      } else if (type instanceof Statements.StartOfSelection
          || type instanceof Statements.AtSelectionScreen
          || type instanceof Statements.Initialization
          || type instanceof Statements.EndOfSelection
          || type instanceof Statements.LoadOfProgram) {
        indent = init;
        parentIsEvent = true;
      } else if (type instanceof Statements.Form
          || (type instanceof Statements.Include && parentIsEvent)
          || type instanceof Statements.Module
          || type instanceof Statements.ClassImplementation
          || type instanceof Statements.ClassDefinition) {
        indent = init;
        parentIsEvent = false;
      } else if (type instanceof Statements.Cleanup
          || type instanceof Statements.Catch) {
        indent = stack.peek() - 2;
      } else if (type instanceof Statements.Public
          || type instanceof Statements.Protected
          || type instanceof Statements.Private
          || type instanceof Statements.When) {
        indent = stack.peek();
      } else if (type instanceof Statements.EndTry) {
        indent = stack.pop() - (this.options.alignTryCatch ? 2 : 4);
      } else if (type instanceof Statements.EndClass
          || type instanceof Statements.EndCase) {
        indent = stack.pop() - 2;
        indent = Math.max(indent, init); // maybe move this out of switch before ret.push(indent)
      } else if (type instanceof Comment
          || type instanceof Statements.IncludeType
          || type instanceof Empty
          || type instanceof MacroContent) {
        ret.push(-1);
        continue;
      }

      ret.push(indent);

      if (type instanceof Statements.If
          || type instanceof Statements.While
          || type instanceof Statements.Module
          || type instanceof Statements.SelectLoop
          || type instanceof Statements.FunctionModule
          || type instanceof Statements.Interface
          || type instanceof Statements.Do
          || type instanceof Statements.At
          || type instanceof Statements.Catch
          || type instanceof Statements.Define
          || type instanceof Statements.When
          || type instanceof Statements.Cleanup
          || type instanceof Statements.Loop
          || type instanceof Statements.Form
          || type instanceof Statements.Else
          || type instanceof Statements.ElseIf
          || type instanceof Statements.Method
          || type instanceof Statements.StartOfSelection
          || type instanceof Statements.AtSelectionScreen
          || type instanceof Statements.LoadOfProgram
          || type instanceof Statements.Initialization
          || type instanceof Statements.EndOfSelection
          || type instanceof Statements.Public
          || type instanceof Statements.Protected
          || type instanceof Statements.Private) {
        indent = indent + 2;
      } else if (type instanceof Statements.Try) {
        indent = indent + (this.options.alignTryCatch ? 2 : 4);
        stack.push(indent);
      } else if (type instanceof Statements.ClassDefinition
          || type instanceof Statements.Case
          || type instanceof Statements.ClassImplementation) {
        indent = indent + (this.skipIndentForGlobalClass(statement) ? 0 : 2);
        stack.push(indent);
      }
    }

    return ret;
  }

  private skipIndentForGlobalClass(statement: StatementNode): boolean {
    if (!this.options.globalClassSkipFirst) {
      return false;
    }

    const type = statement.get();

    if (type instanceof Statements.ClassDefinition && statement.findFirstExpression(Expressions.Global)) {
      const className = statement.findFirstExpression(Expressions.ClassName);
      if (className) {
        this.globalClasses.add(className.getFirstToken().getStr().toUpperCase());
      }
      return true;
    } else if (type instanceof Statements.ClassImplementation) {
      const className = statement.findFirstExpression(Expressions.ClassName);
      if (className && this.globalClasses.has(className.getFirstToken().getStr().toUpperCase())) {
        return true;
      }
    }
    return false;
  }
}

export class PrettyPrinter {
  private result: string;
  private readonly file: ABAPFile;
  private readonly options: IIndentationOptions;

  constructor(file: ABAPFile, options?: IIndentationOptions) {
    this.result = file.getRaw();
    this.file = file;
    this.options = options || {};
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
      this.upperCaseKeywords(statement);
    }
    this.indentCode();
    return this.result;
  }

  public getExpectedIndentation(): number[] {
    return (new Indentation(this.options)).run(this.file);
  }

  private indentCode() {
    const statements = this.file.getStatements();
    const expected = this.getExpectedIndentation();
    if (expected.length !== statements.length) {
      throw new Error("Pretty Printer, expected lengths to match");
    }

    const lines = this.result.split("\n");

    for (const statement of statements) {
      const exp = expected.shift();
      if (exp === undefined || exp < 0) {
        continue;
      }
      const row = statement.getFirstToken().getStart().getRow() - 1;
      lines[row] = lines[row].trim();
      for (let i = 1; i < exp; i++) {
        lines[row] = " " + lines[row];
      }
    }

    this.result = lines.join("\n");
  }

  private replaceString(pos: Position, str: string) {
    const lines = this.result.split("\n");
    const line = lines[pos.getRow() - 1];

    lines[pos.getRow() - 1] = line.substr(0, pos.getCol() - 1) + str + line.substr(pos.getCol() + str.length - 1);

    this.result = lines.join("\n");
  }

  private upperCaseKeywords(s: StatementNode | ExpressionNode): void {
    for (const child of s.getChildren()) {
      if (child instanceof TokenNodeRegex) {
        continue;
      } else if (child instanceof TokenNode) {
        const token = child.get();
        const str = token.getStr();
        if (str !== str.toUpperCase() && token instanceof Identifier) {
          this.replaceString(token.getStart(), str.toUpperCase());
        }
      } else if (child instanceof ExpressionNode) {
        this.upperCaseKeywords(child);
      } else {
        throw new Error("pretty printer, traverse, unexpected node type");
      }
    }
  }

}