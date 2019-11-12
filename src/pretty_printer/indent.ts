import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";
import {MacroContent, Comment, Empty} from "../abap/statements/_statement";
import {ABAPFile} from "../files";
import {StatementNode} from "../abap/nodes/statement_node";
import {IIndentationOptions} from "./indentation_options";

// todo, will break if there is multiple statements per line?
export class Indent {
  private readonly options: IIndentationOptions;
  private readonly globalClasses = new Set();
  constructor(options?: IIndentationOptions) {
    this.options = options || {};
  }

  public execute(original: ABAPFile, modified: string): string {
    const statements = original.getStatements();
    const expected = this.getExpectedIndents(original);
    if (expected.length !== statements.length) {
      throw new Error("Pretty Printer, expected lengths to match");
    }

    const lines = modified.split("\n");

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

    return lines.join("\n");
  }

  // returns list of expected indentation for each line/statement?
  public getExpectedIndents(file: ABAPFile): number[] {
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
