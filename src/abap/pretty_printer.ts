import * as Statements from "./statements";
import {Unknown, MacroContent, MacroCall, Comment, Empty} from "./statements/_statement";
import {StatementNode, ExpressionNode, TokenNodeRegex, TokenNode} from "./nodes";
import {ABAPFile} from "../files";
import {Identifier} from "./tokens";
import {Position} from "../position";

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
// returns list of expected indentation for each line/statement?
  public static run(file: ABAPFile): number[] {
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
          || ( type instanceof Statements.Include && parentIsEvent )
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
        indent = stack.pop() - 4;
      } else if (type instanceof Statements.EndClass
          || type instanceof Statements.EndCase) {
        indent = stack.pop() - 2;
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
        indent = indent + 4;
        stack.push(indent);
      } else if (type instanceof Statements.ClassDefinition
          || type instanceof Statements.Case
          || type instanceof Statements.ClassImplementation) {
        indent = indent + 2;
        stack.push(indent);
      }
    }

    return ret;
  }
}

// todo, will break if there is multiple statements per line?

export class PrettyPrinter {
  private result: string;
  private file: ABAPFile;

  constructor(file: ABAPFile) {
    this.result = file.getRaw();
    this.file = file;
  }

  public run(): string {
    for (const statement of this.file.getStatements()) {
      if (statement.get() instanceof Unknown
          || statement.get() instanceof MacroContent
          || statement.get() instanceof MacroCall
          || statement.get() instanceof Comment) {
        continue;
      }
// note that no positions are changed during a upperCaseKeys operation
      this.upperCaseKeywords(statement);
    }

// todo, do something with the result
    this.getExpectedIndentation();

    return this.result;
  }

  public getExpectedIndentation(): number[] {
    return Indentation.run(this.file);
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
          this.replaceString(token.getPos(), str.toUpperCase());
        }
      } else if (child instanceof ExpressionNode) {
        this.upperCaseKeywords(child);
      } else {
        throw new Error("pretty printer, traverse, unexpected node type");
      }
    }
  }

}