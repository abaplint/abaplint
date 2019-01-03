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
import {Interface} from "../../objects";
import {IObject} from "../../objects/_iobject";

// todo, some visualization, graphviz?
// todo, when there is more structure, everything will be refactored?

// todo, rename this class?
class LocalIdentifier extends TypedIdentifier { }

class Variables {
  private scopes: {name: string, ids: TypedIdentifier[]}[];
  private reg: Registry;

  constructor(reg: Registry) {
    this.reg = reg;
    this.scopes = [];
    this.pushScope("_global", []);
  }

  public add(identifier: TypedIdentifier) {
    this.scopes[this.scopes.length - 1].ids.push(identifier);
  }

  public resolve(name: string): TypedIdentifier | IObject | undefined {
// todo, this should probably search the nearest first? in case there are shadowed variables?
    for (const scope of this.scopes) {
      for (const local of scope.ids) {
        if (local.getName().toUpperCase() === name.toUpperCase()) {
          return local;
        }
      }
    }

// look for a global object of this name
    let search = this.reg.getObject("CLAS", name.toUpperCase());
    if (search) { return search; }
    search = this.reg.getObject("INTF", name.toUpperCase());
    if (search) { return search; }

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

export class CheckVariablesLogic {
  private file: ABAPFile;
  private variables: Variables;
  private issues: Issue[];
  private reg: Registry;

  constructor(reg: Registry, file: ABAPFile) {
    this.reg = reg;
    this.issues = [];
    this.file = file;
    this.variables = new Variables(this.reg);
  }

  public findIssues(): Issue[] {
    // assumption: objects are parsed without parsing errors
    const structure = this.file.getStructure();
    if (structure === undefined) {
      return [];
    }
    this.addGlobals();
    this.traverse(structure);
    return this.issues;
  }

  public resolveToken(token: Token): TypedIdentifier | IObject | undefined {
    // assumption: objects are parsed without parsing errors
    const structure = this.file.getStructure();
    if (structure === undefined) {
      return undefined;
    }
    this.addGlobals();
    return this.traverse(structure, token);
  }

  private addGlobals() {
    // todo, more defintions, and move to somewhere else?
    // todo, icon_*, abap_*, col_* are from the corresponding type pools?
    const global = new MemoryFile("_global.prog.abap", "* Globals\n" +
      "DATA sy TYPE c.\n" + // todo, add structure
      "DATA screen TYPE c.\n" + // todo, add structure
      "DATA text TYPE c.\n" + // todo, this is not completely correct
      "CONSTANTS %_CHARSIZE TYPE i.\n" +
      "CONSTANTS %_ENDIAN TYPE c LENGTH 1.\n" +
      "CONSTANTS %_MINCHAR TYPE c LENGTH 1.\n" +
      "CONSTANTS %_MAXCHAR TYPE c LENGTH 1.\n" +
      "CONSTANTS %_HORIZONTAL_TAB TYPE c LENGTH 1.\n" +
      "CONSTANTS %_VERTICAL_TAB TYPE c LENGTH 1.\n" +
      "CONSTANTS %_NEWLINE TYPE c LENGTH 1.\n" +
      "CONSTANTS %_CR_LF TYPE c LENGTH 2.\n" +
      "CONSTANTS %_FORMFEED TYPE c LENGTH 1.\n" +
      "CONSTANTS %_BACKSPACE TYPE c LENGTH 1.\n" +
      "CONSTANTS icon_led_red TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_led_yellow TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_led_green TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_led_inactive TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_green_light TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_yellow_light TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_red_light TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_workflow_fork TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_folder TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_okay TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS icon_folder TYPE c LENGTH 4 VALUE ''.\n" +
      "CONSTANTS space TYPE c LENGTH 1 VALUE ''.\n" +
      "CONSTANTS col_positive TYPE c LENGTH 1 VALUE '5'.\n" +
      "CONSTANTS col_negative TYPE c LENGTH 1 VALUE '6'.\n" +
      "CONSTANTS abap_undefined TYPE c LENGTH 1 VALUE '-'.\n" +
      "CONSTANTS abap_true TYPE c LENGTH 1 VALUE 'X'.\n" +
      "CONSTANTS abap_false TYPE c LENGTH 1 VALUE ''.\n");

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

  private traverse(node: INode, search?: Token): TypedIdentifier | IObject | undefined {
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
      this.updateVariables(child);
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

  private findMethodScope(node: StatementNode): TypedIdentifier[] {
    const className = this.variables.getParentName();
    const classDefinition = this.file.getClassDefinition(className);
    if (classDefinition === undefined) {
      this.newIssue(node.getFirstToken(), "Class definition \"" + className + "\" not found");
      return [];
    }

    let methodName = node.findFirstExpression(Expressions.MethodName)!.getFirstToken().getStr();
    let methodDefinition: MethodDefinition | undefined = undefined;
    for (const method of classDefinition.getMethodDefinitions()!.getAll()) {
      if (method.getName().toUpperCase() === methodName.toUpperCase()) {
        methodDefinition = method;
      }
    }

// todo, this is not completely correct, and too much code
    if (methodName.includes("~")) {
      const interfaceName = methodName.split("~")[0];
      methodName = methodName.split("~")[1];
      const intf = this.reg.getObject("INTF", interfaceName) as Interface;
      if (intf && intf.getDefinition()) {
        const methods = intf.getDefinition()!.getMethodDefinitions();
        for (const method of methods) {
          if (method.getName().toUpperCase() === methodName.toUpperCase()) {
            methodDefinition = method;
            break;
          }
        }
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
    ret = ret.concat(classAttributes.getInstance()); // todo, this is not correct, take care of scope
    ret = ret.concat(classAttributes.getStatic()); // todo, this is not correct, take care of scope
    ret = ret.concat(methodDefinition.getParameters().getAll());

    return ret;
  }

  private addVariable(expr: ExpressionNode) {
    // todo, these identifers should be possible to create from a Node
    // todo, how to determine the real types?
    const token = expr.getFirstToken();
    this.variables.add(new LocalIdentifier(token, expr));
  }

  private updateVariables(node: INode): void {
// todo, handle inline local definitions
    if (node instanceof StatementNode
        && ( node.get() instanceof Statements.Data
        || node.get() instanceof Statements.DataBegin
        || node.get() instanceof Statements.Constant
        || node.get() instanceof Statements.ConstantBegin ) ) {
      const expr = node.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
      this.addVariable(expr);
    } else if (node instanceof StatementNode && node.get() instanceof Statements.Parameter ) {
      const expr = node.findFirstExpression(Expressions.FieldSub);
      if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
      this.addVariable(expr);
    } else if (node instanceof StatementNode && node.get() instanceof Statements.Tables ) {
      const expr = node.findFirstExpression(Expressions.Field);
      if (expr === undefined) { throw new Error("syntax_check, unexpected tree structure"); }
      this.addVariable(expr);
    } else if (node instanceof StatementNode && node.get() instanceof Statements.Form) {
      this.variables.pushScope("form", this.findFormScope(node));
    } else if (node instanceof StatementNode && node.get() instanceof Statements.EndForm) {
      this.variables.popScope();
    } else if (node instanceof StatementNode && node.get() instanceof Statements.Method) {
      this.variables.pushScope("method", this.findMethodScope(node));

// todo, this is not correct, add correct types, plus when is "super" allowed?
      const file = new MemoryFile("_method_locals.prog.abap", "* Method Locals\n" +
        "DATA super TYPE REF TO object.\n" +
        "DATA me TYPE REF TO object.\n");
      this.traverse(new Registry().addFile(file).getABAPFiles()[0].getStructure()!);

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