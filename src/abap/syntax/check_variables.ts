import {Issue} from "../../issue";
import * as Expressions from "../expressions";
import * as Statements from "../statements";
import {INode} from "../nodes/_inode";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Token} from "../tokens/_token";
import {StatementNode, ExpressionNode} from "../nodes";
import {ABAPFile, MemoryFile} from "../../files";
import {Registry} from "../../registry";
import {MethodDefinition} from "../types";

// todo, some visualization, graphviz?
// todo, when there is more structure, everything will be refactored?

// todo, rename this class?
class LocalIdentifier extends TypedIdentifier { }

class Variables {
  private scopes: {name: string, ids: TypedIdentifier[]}[];

  constructor() {
    this.scopes = [];
    this.pushScope("_global", []);
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

  public pushScope(name: string, ids: TypedIdentifier[]) {
    this.scopes.push({name: name, ids: ids});
  }

  public popScope() {
    this.scopes.pop();
    if (this.scopes.length === 0) {
      throw new Error("something wrong, global scope popped");
    }
  }

}

// todo, rename this class?
export class CheckVariables {
  private file: ABAPFile;
  private variables: Variables;
  private issues: Issue[];

  public run(file: ABAPFile): Issue[] {
    this.issues = [];
    this.file = file;

    this.variables = new Variables();

    // assumption: objects are parsed without parsing errors
    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

// todo, more defintions, and move to somewhere else?
    const global = new MemoryFile("_global.prog.abap", "* Globals\n" +
      "DATA sy TYPE c.\n" + // todo, add structure
      "CONSTANTS space TYPE c LENGTH 1 VALUE ''.\n" +
      "CONSTANTS abap_true TYPE c LENGTH 1 VALUE 'X'.\n" +
      "CONSTANTS abap_false TYPE c LENGTH 1 VALUE ''.\n");
    this.traverse(new Registry().addFile(global).getABAPFiles()[0].getStructure()!);

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

  private findMethodScope(node: StatementNode): TypedIdentifier[] {
    const className = this.variables.getParentName();
    const classDefinition = this.file.getClassDefinition(className);
    if (classDefinition === undefined) {
      this.newIssue(node.getFirstToken(), "Class definition \"" + className + "\" not found");
      return [];
    }

    const methodName = node.findFirstExpression(Expressions.MethodName)!.getFirstToken().getStr();
    let methodDefinition: MethodDefinition | undefined = undefined;
    for (const method of classDefinition.getMethodDefinitions()!.getAll()) {
      if (method.getName().toUpperCase() === methodName.toUpperCase()) {
        methodDefinition = method;
      }
    }
    if (methodDefinition === undefined) {
      this.newIssue(node.getFirstToken(), "Method definition \"" + methodName + "\" not found");
      return [];
    }

    const classAttributes = classDefinition.getAttributes();
    if (classAttributes === undefined) {
      this.newIssue(node.getFirstToken(), "Error reading class attributes");
      return [];
    }

    let ret: TypedIdentifier[] = [];
// todo, also add attributes and constants from super classes
    ret = ret.concat(classAttributes.getConstants());
    ret = ret.concat(classAttributes.getInstance()); // todo, this is not correct
    ret = ret.concat(classAttributes.getStatic()); // todo, this is not correct
    ret = ret.concat(methodDefinition.getParameters().getAll());

    return ret;
  }

  private updateVariables(node: INode): void {
// todo, handle inline local definitions
    if (node instanceof StatementNode
        && ( node.get() instanceof Statements.Data || node.get() instanceof Statements.Constant ) ) {
      const expr = node.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        throw new Error("syntax_check, unexpected tree structure");
      }
      const token = expr.getFirstToken();
// todo, these identifers should be possible to create from a Node
      this.variables.add(new LocalIdentifier(token, expr));
    } else if (node instanceof StatementNode && node.get() instanceof Statements.Form) {
//    this.file.getForms(todo)
      this.variables.pushScope("form", []);
    } else if (node instanceof StatementNode && node.get() instanceof Statements.EndForm) {
      this.variables.popScope();
    } else if (node instanceof StatementNode && node.get() instanceof Statements.Method) {
      this.variables.pushScope("method", this.findMethodScope(node));
    } else if (node instanceof StatementNode && node.get() instanceof Statements.EndMethod) {
      this.variables.popScope();
    } else if (node instanceof StatementNode
        && ( node.get() instanceof Statements.ClassImplementation || node.get() instanceof Statements.ClassDefinition ) ) {
      const expr = node.findFirstExpression(Expressions.ClassName);
      if (expr === undefined) {
        throw new Error("syntax_check, unexpected tree structure");
      }
      const token = expr.getFirstToken();
      this.variables.pushScope(token.getStr(), []);
    } else if (node instanceof StatementNode && node.get() instanceof Statements.EndClass) {
      this.variables.popScope();
    }
  }

}