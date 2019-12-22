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
import {Procedural} from "./_procedural";
import {Inline} from "./_inline";
import {Program} from "../../objects";
import {ClassDefinition, InterfaceDefinition} from "../types";
import {Identifier} from "../types/_identifier";

// assumption: objects are parsed without parsing errors

// todo, traversal should start with the right file for the object

export class SyntaxLogic {
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
    this.scope = Scope.buildDefault(this.reg);

    this.helpers = {
      oooc: new ObjectOriented(this.reg, this.scope),
      proc: new Procedural(this.reg, this.scope),
      inline: new Inline(this.reg, this.scope),
    };
  }

  public findIssues(): Issue[] {
    this.issues = [];

    if (this.object instanceof Program && this.object.isInclude()) {
      return [];
    }

    this.traverseObject();
    return this.issues;
  }

  public traverseUntil(stopAt?: Identifier): Scope {
    return this.traverseObject(stopAt);
  }

/////////////////////////////

  private traverseObject(stopAt?: Identifier): Scope {
    if (this.object instanceof Program) {
      this.helpers.proc.addAllFormDefinitions(this.object.getABAPFiles()[0]);
    }

    for (const file of this.object.getABAPFiles()) {
      this.currentFile = file;
      const structure = this.currentFile.getStructure();
      if (structure === undefined) {
        return this.scope;
      } else if (this.traverse(structure, stopAt)) {
        return this.scope;
      }
    }

    return this.scope;
  }

  private newIssue(token: Token, message: string): void {
    const issue = Issue.atToken(this.currentFile, token, message, "check_syntax");
    this.issues.push(issue);
  }

  private traverse(node: INode, stopAt?: Identifier): boolean {
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
        const resolved = this.scope.resolveVariable(token.getStr());
        if (resolved === undefined) {
          this.newIssue(token, "\"" + token.getStr() + "\" not found");
        }
      }
    }

    for (const child of node.getChildren()) {
      try {
        const gotoNext = this.updateScope(child);
        if (gotoNext === true) {
          continue;
        }
      } catch (e) {
        this.newIssue(child.getFirstToken(), e.message);
        break;
      }

      if (child instanceof StatementNode && child.get() instanceof Statements.Include) {
        const file = this.helpers.proc.findInclude(child);
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
            && stopAt.getStart().getCol() === token.getStart().getCol()
            && stopAt.getStart().getRow() === token.getStart().getRow()
            && stopAt.getFilename() === this.currentFile.getFilename()) {
          return true;
        }
      }
    }

    return false;
  }

  // if this returns true, then the traversal should continue with next child
  private updateScope(node: INode): boolean {
// todo, align statements, eg is NamespaceSimpleName a definition or is it Field, or something new?
// todo, and introduce SimpleSource?
    const filename = this.currentFile.getFilename();

    if (node instanceof StructureNode) {
      const stru = node.get();
      if (stru instanceof Structures.ClassDefinition) {
        this.scope.addClassDefinition(new ClassDefinition(node, filename));
        return true;
      } else if (stru instanceof Structures.Interface) {
        this.scope.addInterfaceDefinition(new InterfaceDefinition(node, filename));
        return true;
      } else if (stru instanceof Structures.Types) {
        this.scope.addType(stru.runSyntax(node, this.scope, filename));
        return true;
      } else if (stru instanceof Structures.Constants) {
        this.scope.addIdentifier(stru.runSyntax(node, this.scope, filename));
        return true;
      } else if (stru instanceof Structures.Data) {
        this.scope.addIdentifier(stru.runSyntax(node, this.scope, filename));
        return true;
      } else if (stru instanceof Structures.Statics) {
        this.scope.addIdentifier(stru.runSyntax(node, this.scope, filename));
        return true;
      } else if (stru instanceof Structures.TypeEnum) {
        this.scope.addList(stru.runSyntax(node, this.scope, filename));
        return true;
      }
      return false;
    } else if (!(node instanceof StatementNode)) {
      return false;
    }

    const s = node.get();
    if (s instanceof Statements.Type) {
      this.scope.addType(s.runSyntax(node, this.scope, filename));
    } else if (s instanceof Statements.Constant
        || s instanceof Statements.Static
        || s instanceof Statements.Data
        || s instanceof Statements.Parameter
        || s instanceof Statements.FieldSymbol
        || s instanceof Statements.Tables
        || s instanceof Statements.SelectOption) {
      this.scope.addIdentifier(s.runSyntax(node, this.scope, filename));
    } else if (s instanceof Statements.Form) {
      this.helpers.proc.findFormScope(node, filename);
    } else if (s instanceof Statements.Perform) {
      s.runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.FunctionModule) {
      this.helpers.proc.findFunctionScope(this.object, node);
    } else if (s instanceof Statements.Method) {
      this.helpers.oooc.methodImplementation(node);
    } else if (s instanceof Statements.ClassDefinition) {
      this.helpers.oooc.classDefinition(node);
    } else if (s instanceof Statements.ClassImplementation) {
      this.helpers.oooc.classImplementation(node);
    } else if (s instanceof Statements.EndForm
        || s instanceof Statements.EndMethod
        || s instanceof Statements.EndFunction
        || s instanceof Statements.EndClass) {
      this.scope.pop();
    }

    return false;
  }

}