import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Statements from "../abap/statements";
import {ABAPFile} from "../files";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {Registry} from "../registry";
import {Comment, MacroContent, Empty} from "../abap/statements/_statement";
import {BasicRuleConfig} from "./_basic_rule_config";

export class IndentationConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = true;
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

export class Indentation extends ABAPRule {
  private conf = new IndentationConf();

  public getKey(): string {
    return "indentation";
  }

  public getDescription(): string {
    return "Indentation";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IndentationConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: IObject) {
    const init: number = 1;
    let indent: number = init;
    let parentIsEvent: boolean = false;
    const stack = new Stack();

    if (file.getStructure() == undefined) {
      return []; // syntax error in file
    }

    if (obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined) {
        return [];
      }
      if (this.conf.ignoreExceptions && definition.isException()) {
        return [];
      }
    }

    for (const statement of file.getStatements()) {
      const type = statement.get();
      const position = statement.getFirstToken().getPos();

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
        continue;
      }

      if (indent !== position.getCol()) {
        const issue = new Issue({file, message: this.getDescription(), code: this.getKey(), start: position});
        return [issue]; // only one finding per include
      }

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


    return [];
  }
}