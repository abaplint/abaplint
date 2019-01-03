import {Issue} from "../../issue";
import * as Expressions from "../expressions";
import * as Statements from "../statements";
import {INode} from "../nodes/_inode";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Token} from "../tokens/_token";
import {StatementNode, ExpressionNode} from "../nodes";
import {ABAPFile, MemoryFile} from "../../files";
import {Registry} from "../../registry";
import {ABAPObject} from "../../objects/_abap_object";
import {Variables} from "./_variables";
import {ObjectOriented} from "./_object_oriented";
import {Globals} from "./_globals";

// todo, some visualization, graphviz?
// todo, when there is more structure, everything will be refactored?

// todo, rename this class?
class LocalIdentifier extends TypedIdentifier { }

export class CheckVariablesLogic {
  private object: ABAPObject;
  private file: ABAPFile;
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
    this.addGlobals();

    for (const file of this.object.getABAPFiles()) {
      this.file = file;
    // assumption: objects are parsed without parsing errors
      const structure = this.file.getStructure();
      if (structure === undefined) {
        return [];
      }
      this.traverse(structure);
    }

    return this.issues;
  }

// todo, this assumes no tokes are the same across files
  public resolveToken(token: Token): TypedIdentifier | undefined {
    this.addGlobals();

    for (const file of this.object.getABAPFiles()) {
      this.file = file;
    // assumption: objects are parsed without parsing errors
      const structure = this.file.getStructure();
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

  private addGlobals() {
    const global = Globals.getFile();
    this.traverse(new Registry().addFile(global).getABAPFiles()[0].getStructure()!);
  }

  private newIssue(token: Token, message: string): void {
    this.issues.push(new Issue({
      file: this.file,
      message: message,
      code: "check_variables",
      start: token.getPos(),
    }));
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

  private findFormScope(node: StatementNode): TypedIdentifier[] {
    const formName = node.findFirstExpression(Expressions.FormName)!.getFirstToken().getStr();
    const form = this.file.getFormDefinition(formName);
    if (form === undefined) {
      this.newIssue(node.getFirstToken(), "Form definition \"" + formName + "\" not found");
      return [];
    }
    return form.getParameters();
  }

  private addVariable(expr: ExpressionNode | undefined) {
    if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
    // todo, these identifers should be possible to create from a Node
    // todo, how to determine the real types?
    const token = expr.getFirstToken();
    this.variables.add(new LocalIdentifier(token, expr));
  }

  private updateVariables(node: INode): void {
// todo, align statements, eg is NamespaceSimmpleName a definition or is it Field, or something new?
// todo, and introduce SimpleSource?
    if (!(node instanceof StatementNode)) {
      return;
    }

    const sub = node.get();

    if (sub instanceof Statements.Data
        || sub instanceof Statements.DataBegin
        || sub instanceof Statements.Constant
        || sub instanceof Statements.ConstantBegin) {
      this.addVariable(node.findFirstExpression(Expressions.NamespaceSimpleName));
    } else if (sub instanceof Statements.Parameter) {
      this.addVariable(node.findFirstExpression(Expressions.FieldSub));
    } else if (sub instanceof Statements.Tables || sub instanceof Statements.SelectOption) {
      this.addVariable(node.findFirstExpression(Expressions.Field));

    } else if (sub instanceof Statements.Form) {
      this.variables.pushScope("form", this.findFormScope(node));
    } else if (sub instanceof Statements.Method) {
      const varc = new ObjectOriented(this.object, this.reg);
      const parent = this.variables.getParentName();
      this.variables.pushScope("method", []);
      this.variables.addList(varc.methodImplementation(parent, node));
// todo, this is not correct, add correct types, plus when is "super" allowed?
      const file = new MemoryFile("_method_locals.prog.abap", "* Method Locals\n" +
        "DATA super TYPE REF TO object.\n" +
        "DATA me TYPE REF TO object.\n");
      this.traverse(new Registry().addFile(file).getABAPFiles()[0].getStructure()!);
    } else if (sub instanceof Statements.ClassImplementation || sub instanceof Statements.ClassDefinition ) {
      const varc = new ObjectOriented(this.object, this.reg);
      this.variables.pushScope(varc.findClassName(node), []);
      if (sub instanceof Statements.ClassImplementation) {
        this.variables.addList(varc.classImplementation(node));
      }

    } else if (sub instanceof Statements.EndForm
        || sub instanceof Statements.EndMethod
        || sub instanceof Statements.EndClass) {
      this.variables.popScope();
    }
  }

}