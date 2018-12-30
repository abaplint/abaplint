import {Issue} from "../../issue";
import * as Expressions from "../expressions";
import * as Statements from "../statements";
import {INode} from "../nodes/_inode";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Token} from "../tokens/_token";
import {StatementNode, ExpressionNode} from "../nodes";
import {ABAPFile} from "../../files";

// todo, some visualization, graphviz?
// todo, when there is more structure, everything will be refactored?

// todo, rename this class?
class LocalIdentifier extends TypedIdentifier { }

class Variables {
  private scopes: {name: string, ids: TypedIdentifier[]}[];

  constructor() {
    this.scopes = [];
    this.pushScope("_global");
  }

  public add(identifier: TypedIdentifier) {
    this.scopes[this.scopes.length - 1].ids.push(identifier);
  }

  public resolve(name: string): TypedIdentifier | undefined {
// todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const local of scope.ids) {
        if (local.getName() === name) {
          return local;
        }
      }
    }

    return undefined;
  }

  public getParentName(): string {
    return this.scopes[this.scopes.length - 1].name;
  }

  public pushScope(name: string) {
    this.scopes.push({name: name, ids: []});
  }

  public popScope() {
    this.scopes.pop();
  }

}

// todo, rename this class?
export class CheckVariables {
  private file: ABAPFile;
  private variables: Variables;
  private issues: Issue[];

// assumption: objects are parsed without parsing errors
  public run(file: ABAPFile): Issue[] {
    this.issues = [];
    this.file = file;
    this.variables = new Variables();

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    this.traverse(structure);

    return this.issues;
  }

  private newIssue(token: Token, message: string): void {
    this.issues.push(new Issue({
      file: this.file,
      message: message,
      code: "syntax_check",
      start: token.getPos(),
    }));
  }

  private traverse(node: INode) {
    if (node instanceof ExpressionNode
        && ( node.get() instanceof Expressions.Source || node.get() instanceof Expressions.Target ) ) {
      for (const field of node.findAllExpressions(Expressions.Field)) {
        const token = field.getFirstToken();
        if (this.variables.resolve(token.getStr()) === undefined) {
          this.newIssue(token, "\"" + token.getStr() + "\" not found");
        }
      }
    }

    for (const child of node.getChildren()) {
      this.updateVariables(child);
      this.traverse(child);
    }
  }

  private updateVariables(node: INode): void {
// todo, handle inline local definitions
    if (node instanceof StatementNode && node.get() instanceof Statements.Data) {
      const expr = node.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        throw new Error("syntax_check, unexpected tree structure");
      }
      const token = expr.getFirstToken();
      this.variables.add(new LocalIdentifier(token, expr));
    } else if (node instanceof StatementNode && node.get() instanceof Statements.Form) {
//    this.file.getForms(todo)
      this.variables.pushScope("form");
    } else if (node instanceof StatementNode && node.get() instanceof Statements.EndForm) {
      this.variables.popScope();
    } else if (node instanceof StatementNode && node.get() instanceof Statements.Method) {
      const name = this.variables.getParentName();
      const def = this.file.getClassDefinition(name);
      if (def === undefined) {
        this.newIssue(node.getFirstToken(), "Class definition \"" + name + "\" not found");
      }
// todo, add method parameters
      this.variables.pushScope("method");
    } else if (node instanceof StatementNode && node.get() instanceof Statements.EndMethod) {
      this.variables.popScope();
    } else if (node instanceof StatementNode && node.get() instanceof Statements.ClassImplementation) {
      const expr = node.findFirstExpression(Expressions.ClassName);
      if (expr === undefined) {
        throw new Error("syntax_check, unexpected tree structure");
      }
      const token = expr.getFirstToken();
      this.variables.pushScope(token.getStr());
    } else if (node instanceof StatementNode && node.get() instanceof Statements.EndClass) {
      this.variables.popScope();
    }
  }

}