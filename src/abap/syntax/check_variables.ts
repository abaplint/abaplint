import {Issue} from "../../issue";
import * as Expressions from "../expressions";
import * as Statements from "../statements";
import {INode} from "../nodes/_inode";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Token} from "../tokens/_token";
import {StatementNode, ExpressionNode} from "../nodes";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {ABAPObject} from "../../objects/_abap_object";
import {Variables} from "./_variables";
import {ObjectOriented} from "./_object_oriented";
import {Globals} from "./_globals";
import {Procedural} from "./_procedural";

// todo, some visualization, graphviz?
// todo, when there is more structure, everything will be refactored?
class LocalIdentifier extends TypedIdentifier { }

export class CheckVariablesLogic {
  private object: ABAPObject;
  private currentFile: ABAPFile;
  private variables: Variables;
  private issues: Issue[];
  private reg: Registry;

  constructor(reg: Registry, object: ABAPObject) {
    this.reg = reg;
    this.issues = [];
    this.object = object;
    this.variables = new Variables();
  }

  public findIssues(): Issue[] {
    this.variables.addList(Globals.get());

    for (const file of this.object.getABAPFiles()) {
      this.currentFile = file;
    // assumption: objects are parsed without parsing errors
      const structure = this.currentFile.getStructure();
      if (structure === undefined) {
        return [];
      }
      this.traverse(structure);
    }

    return this.issues;
  }

// todo, this assumes no tokes are the same across files
  public resolveToken(token: Token): TypedIdentifier | undefined {
    this.variables.addList(Globals.get());

    for (const file of this.object.getABAPFiles()) {
      this.currentFile = file;
    // assumption: objects are parsed without parsing errors
      const structure = this.currentFile.getStructure();
      if (structure === undefined) {
        return undefined;
      }

      const ret = this.traverse(structure, token);
      if (ret) {
        return ret;
      }
    }

    return undefined;
  }

/////////////////////////////

  private newIssue(token: Token, message: string): void {
    this.issues.push(new Issue({
      file: this.currentFile,
      message: message,
      code: "check_variables",
      start: token.getPos(),
    }));
  }

  private addVariable(expr: ExpressionNode | undefined) {
    if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
    // todo, these identifers should be possible to create from a Node
    // todo, how to determine the real types?
    const token = expr.getFirstToken();
    this.variables.add(new LocalIdentifier(token, expr));
  }

  private traverse(node: INode, search?: Token): TypedIdentifier | undefined {
    if (node instanceof ExpressionNode
        && ( node.get() instanceof Expressions.Source || node.get() instanceof Expressions.Target ) ) {
      for (const inline of node.findAllExpressions(Expressions.InlineData)) {
        const field = inline.findFirstExpression(Expressions.Field);
        if (field === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
        this.addVariable(field);
      }
      for (const field of node.findAllExpressions(Expressions.Field)) {
        const token = field.getFirstToken();
        const resolved = this.variables.resolve(token.getStr());
        if (resolved === undefined) {
          this.newIssue(token, "\"" + token.getStr() + "\" not found");
        } else if (search
            && search.getStr() === token.getStr()
            && search.getCol() === token.getCol()
            && search.getRow() === token.getRow()) {
          return resolved;
        }
      }
    }

    for (const child of node.getChildren()) {
      try {
        this.updateVariables(child);
      } catch (e) {
        this.newIssue(child.getFirstToken(), e.message);
      }
      const resolved = this.traverse(child, search);
      if (resolved) {
        return resolved;
      }
    }

    return undefined;
  }

  private updateVariables(node: INode): void {
// todo, align statements, eg is NamespaceSimpleName a definition or is it Field, or something new?
// todo, and introduce SimpleSource?
    if (!(node instanceof StatementNode)) {
      return;
    }

    const sub = node.get();
    const varc = new ObjectOriented(this.object, this.reg);
    const proc = new Procedural(this.object, this.reg);
    this.variables.addList(proc.findDefinitions(node));

    if (sub instanceof Statements.Form) {
      this.variables.pushScope("form").addList(proc.findFormScope(node));
    } else if (sub instanceof Statements.Method) {
      this.variables.pushScope("method").addList(varc.methodImplementation(this.variables.getParentName(), node));
    } else if (sub instanceof Statements.ClassDefinition) {
      this.variables.pushScope(varc.findClassName(node)).addList(varc.classDefinition(node));
    } else if (sub instanceof Statements.ClassImplementation) {
      this.variables.pushScope(varc.findClassName(node)).addList(varc.classImplementation(node));
    } else if (sub instanceof Statements.EndForm
        || sub instanceof Statements.EndMethod
        || sub instanceof Statements.EndClass) {
      this.variables.popScope();
    }
  }

}