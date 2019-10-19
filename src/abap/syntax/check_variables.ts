import * as Expressions from "../expressions";
import * as Statements from "../statements";
import * as Structures from "../structures";
import {Issue} from "../../issue";
import {INode} from "../nodes/_inode";
import {Token} from "../tokens/_token";
import {StatementNode, ExpressionNode, StructureNode, TokenNode} from "../nodes";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {ABAPObject} from "../../objects/_abap_object";
import {Scope} from "./_scope";
import {ObjectOriented} from "./_object_oriented";
import {Globals} from "./_globals";
import {Procedural} from "./_procedural";
import {Inline} from "./_inline";
import {Program} from "../../objects";
import {ClassDefinition, InterfaceDefinition} from "../types";

// assumption: objects are parsed without parsing errors

export class CheckVariablesLogic {
  private currentFile: ABAPFile;
  private issues: Issue[];

  private readonly object: ABAPObject;
  private readonly reg: Registry;

  private readonly scope: Scope;

  private readonly helpers: {
    oooc: ObjectOriented,
    proc: Procedural,
    inline: Inline,
  };

  constructor(reg: Registry, object: ABAPObject) {
    this.reg = reg;
    this.issues = [];

    this.object = object;
    this.scope = new Scope(Globals.get(this.reg.getConfig().getSyntaxSetttings().globalConstants));

    this.helpers = {
      oooc: new ObjectOriented(this.reg, this.scope),
      proc: new Procedural(this.scope),
      inline: new Inline(this.reg, this.scope),
    };
  }

  public findIssues(): Issue[] {
    this.issues = [];

    if (this.object instanceof Program && this.object.isInclude()) {
      return [];
    }

    for (const file of this.object.getABAPFiles()) {
      this.currentFile = file;
      const structure = this.currentFile.getStructure();
      if (structure === undefined) {
        return [];
      }
      this.traverse(structure);
    }

    return this.issues;
  }

// todo, this assumes no tokes are the same across files, loops all getABAPFiles
  public traverseUntil(token: Token): Scope {

// todo, this should start with the right file for the object
    for (const file of this.object.getABAPFiles()) {
      this.currentFile = file;
    // assumption: objects are parsed without parsing errors
      const structure = this.currentFile.getStructure();
      if (structure === undefined) {
        return this.scope;
      } else if (this.traverse(structure, token)) {
        return this.scope;
      }
    }

    return this.scope;
  }

/////////////////////////////

  private newIssue(token: Token, message: string): void {
    const issue = Issue.atToken(this.currentFile, token, message, "check_variables");
    this.issues.push(issue);
  }

  private traverse(node: INode, stopAt?: Token): boolean {
    try {
      const skip = this.helpers.inline.update(node, this.currentFile.getFilename());
      if (skip) {
        return false;
      }
    } catch (e) {
      this.newIssue(node.getFirstToken(), e.message);
    }

// todo, the same variables can be checked multiple times? as Expressions are nested
    if (node instanceof ExpressionNode
        && (node.get() instanceof Expressions.Source
        || node.get() instanceof Expressions.Target)) {
      for (const field of node.findAllExpressions(Expressions.Field).concat(node.findAllExpressions(Expressions.FieldSymbol))) {
        const token = field.getFirstToken();
        const resolved = this.scope.resolve(token.getStr());
        if (resolved === undefined) {
          this.newIssue(token, "\"" + token.getStr() + "\" not found");
        }
      }
    }

    for (const child of node.getChildren()) {
      try {
        this.updateScope(child);
      } catch (e) {
        this.newIssue(child.getFirstToken(), e.message);
        break;
      }

      if (child instanceof StatementNode && child.get() instanceof Statements.Include) {
// assumption: no cyclic includes, includes not found are reported by rule "check_include"
        const file = this.findInclude(child);
        if (file !== undefined && file.getStructure() !== undefined) {
          const old = this.currentFile;
          this.currentFile = file;
          this.traverse(file.getStructure()!);
          this.currentFile = old;
        }
      }

      const stop = this.traverse(child, stopAt);
      if (stop) {
        return stop;
      }

      if (child instanceof TokenNode) {
        const token = child.get();
        if (stopAt !== undefined
            && stopAt.getStr() === token.getStr()
            && stopAt.getCol() === token.getCol()
            && stopAt.getRow() === token.getRow()) {
          return true;
        }
      }
    }

    return false;
  }

  private findInclude(node: StatementNode): ABAPFile | undefined {
    const expr = node.findFirstExpression(Expressions.IncludeName);
    if (expr === undefined) {
      return undefined;
    }
    const name = expr.getFirstToken().getStr();
    const prog = this.reg.getObject("PROG", name) as ABAPObject | undefined;
    if (prog !== undefined) {
      return prog.getABAPFiles()[0];
    }
    return undefined;
  }

  private updateScope(node: INode): void {
// todo, align statements, eg is NamespaceSimpleName a definition or is it Field, or something new?
// todo, and introduce SimpleSource?
    if (node instanceof StructureNode) {
      const stru = node.get();
      if (stru instanceof Structures.TypeEnum) {
        this.helpers.proc.addEnumValues(node, this.currentFile.getFilename());
      } else if (stru instanceof Structures.ClassDefinition) {
        this.scope.addClassDefinition(new ClassDefinition(node, this.currentFile.getFilename()));
      } else if (stru instanceof Structures.Interface) {
        this.scope.addInterfaceDefinition(new InterfaceDefinition(node, this.currentFile.getFilename()));
      }
      return;
    } else if (!(node instanceof StatementNode)) {
      return;
    }

    const statement = node.get();
    this.helpers.proc.addDefinitions(node, this.currentFile.getFilename());

    if (statement instanceof Statements.Form) {
      this.helpers.proc.findFormScope(node, this.currentFile.getFilename());
    } else if (statement instanceof Statements.FunctionModule) {
      this.helpers.proc.findFunctionScope(this.object, node);
    } else if (statement instanceof Statements.Method) {
      this.helpers.oooc.methodImplementation(node);
    } else if (statement instanceof Statements.ClassDefinition) {
      this.helpers.oooc.classDefinition(node);
    } else if (statement instanceof Statements.ClassImplementation) {
      this.helpers.oooc.classImplementation(node);
    } else if (statement instanceof Statements.EndForm
        || statement instanceof Statements.EndMethod
        || statement instanceof Statements.EndFunction
        || statement instanceof Statements.EndClass) {
      this.scope.popScope();
    }
  }

}