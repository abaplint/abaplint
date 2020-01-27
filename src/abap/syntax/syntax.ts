import * as Expressions from "../expressions";
import * as Statements from "../statements";
import * as Structures from "../structures";
import {Issue} from "../../issue";
import {INode} from "../nodes/_inode";
import {Token} from "../tokens/_token";
import {StatementNode, StructureNode} from "../nodes";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {ABAPObject} from "../../objects/_abap_object";
import {CurrentScope, ScopeType} from "./_current_scope";
import {ObjectOriented} from "./_object_oriented";
import {Procedural} from "./_procedural";
import {Inline} from "./_inline";
import {Program, FunctionGroup} from "../../objects";
import {ClassDefinition, InterfaceDefinition} from "../types";
import {SpaghettiScope} from "./_spaghetti_scope";
import {Position} from "../../position";

// assumption: objects are parsed without parsing errors

export class SyntaxLogic {
  private currentFile: ABAPFile;
  private issues: Issue[];

  private readonly object: ABAPObject;
  private readonly reg: Registry;

  private readonly scope: CurrentScope;

  private readonly helpers: {
    oooc: ObjectOriented,
    proc: Procedural,
    inline: Inline,
  };

  constructor(reg: Registry, object: ABAPObject) {
    this.reg = reg;
    this.issues = [];

    this.object = object;
    this.scope = CurrentScope.buildDefault(this.reg);

    this.helpers = {
      oooc: new ObjectOriented(this.reg, this.scope),
      proc: new Procedural(this.reg, this.scope),
      inline: new Inline(this.reg, this.scope),
    };
  }

  public run(): {readonly issues: Issue[], readonly spaghetti: SpaghettiScope} {
    this.issues = [];

    if (this.object instanceof Program && this.object.isInclude()) {
// todo, show some kind of error?
      return {issues: [], spaghetti: this.scope.pop()};
    }

    this.traverseObject();

    for (;;) {
      const spaghetti = this.scope.pop(); // pop built-in scopes
      if (spaghetti.getTop().getIdentifier().stype === ScopeType.BuiltIn) {
        return {issues: this.issues, spaghetti};
      }
    }

  }

/////////////////////////////

  private traverseObject(): CurrentScope {
// todo, traversal should start with the right file for the object
    let traversal = this.object.getABAPFiles();

    if (this.object instanceof Program) {
      this.helpers.proc.addAllFormDefinitions(this.object.getABAPFiles()[0], this.object);
      this.scope.push(ScopeType.Program,
                      this.object.getName(),
                      new Position(1, 1),
                      this.object.getMainABAPFile()!.getFilename());
    } else if (this.object instanceof FunctionGroup) {
      const main = this.object.getMainABAPFile();
      if (main !== undefined) {
        this.helpers.proc.addAllFormDefinitions(main, this.object);
        traversal = [main];
      }
    }

    for (const file of traversal) {
      this.currentFile = file;
      const structure = this.currentFile.getStructure();
      if (structure === undefined) {
        return this.scope;
      }
      this.traverse(structure);
    }

    return this.scope;
  }

  private newIssue(token: Token, message: string): void {
    const issue = Issue.atToken(this.currentFile, token, message, "check_syntax");
    this.issues.push(issue);
  }

  private traverse(node: INode): void {
    try {
      const skip = this.helpers.inline.update(node, this.currentFile.getFilename());
      if (skip) {
        return;
      }
    } catch (e) {
      this.newIssue(node.getFirstToken(), e.message);
    }

    if (node instanceof StatementNode) {
      const targets = node.findAllExpressions(Expressions.TargetField).concat(node.findAllExpressions(Expressions.TargetFieldSymbol));
      for (const target of targets) {
        const token = target.getFirstToken();
        const resolved = this.scope.findVariable(token.getStr());
        if (resolved === undefined) {
          this.newIssue(token, "\"" + token.getStr() + "\" not found");
        } else {
          this.scope.addWrite(token, resolved, this.currentFile.getFilename());
        }
      }

      const sources = node.findAllExpressions(Expressions.SourceField).concat(node.findAllExpressions(Expressions.SourceFieldSymbol));
      for (const source of sources) {
        const token = source.getFirstToken();
        const resolved = this.scope.findVariable(token.getStr());
        if (resolved === undefined) {
          this.newIssue(token, "\"" + token.getStr() + "\" not found");
        } else {
          this.scope.addRead(token, resolved, this.currentFile.getFilename());
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
        const file = this.helpers.proc.findInclude(child, this.object);
        if (file !== undefined && file.getStructure() !== undefined) {
          const old = this.currentFile;
          this.currentFile = file;
          this.traverse(file.getStructure()!);
          this.currentFile = old;
        }
      }

      this.traverse(child);
    }
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
      } else if (stru instanceof Structures.Constants
          || stru instanceof Structures.Data
          || stru instanceof Structures.Statics) {
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
      this.helpers.proc.findFunctionScope(this.object, node, filename);
    } else if (s instanceof Statements.Method) {
      this.helpers.oooc.methodImplementation(node, filename);
    } else if (s instanceof Statements.ClassDefinition) {
      this.helpers.oooc.classDefinition(node, filename);
    } else if (s instanceof Statements.ClassImplementation) {
      this.helpers.oooc.classImplementation(node, filename);
    } else if (s instanceof Statements.EndForm
        || s instanceof Statements.EndMethod
        || s instanceof Statements.EndFunction
        || s instanceof Statements.EndClass) {
      this.scope.pop();
    }

    return false;
  }

}