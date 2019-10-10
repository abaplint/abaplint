import {Issue} from "../../issue";
import * as Expressions from "../expressions";
import * as Statements from "../statements";
import * as Structures from "../structures";
import {INode} from "../nodes/_inode";
import {Identifier} from "../types/_identifier";
import {Token} from "../tokens/_token";
import {StatementNode, ExpressionNode, StructureNode} from "../nodes";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {ABAPObject} from "../../objects/_abap_object";
import {Variables} from "./_variables";
import {ObjectOriented} from "./_object_oriented";
import {Globals} from "./_globals";
import {Procedural} from "./_procedural";
import {Inline} from "./_inline";
import {Program} from "../../objects";

// todo, some visualization, graphviz? -> playground

export class CheckVariablesLogic {
  private object: ABAPObject;
  private currentFile: ABAPFile;
  private variables: Variables;
  private issues: Issue[];
  private reg: Registry;
  private oooc: ObjectOriented;
  private proc: Procedural;
  private inline: Inline;

  constructor(reg: Registry, object: ABAPObject) {
    this.reg = reg;
    this.issues = [];

    this.object = object;
    this.variables = new Variables();
    this.oooc = new ObjectOriented(this.object, this.reg, this.variables);
    this.proc = new Procedural(this.object, this.reg, this.variables);
    this.inline = new Inline(this.variables, this.reg);
  }

  public findIssues(ignoreParserError = true): Issue[] {
    this.variables.addList(Globals.get(this.reg.getConfig().getSyntaxSetttings().globalConstants));

    if (this.object instanceof Program && this.object.isInclude()) {
// todo, for now only main executeable program parts are checked
      return [];
    }

    for (const file of this.object.getABAPFiles()) {
      this.currentFile = file;
    // assumption: objects are parsed without parsing errors
      const structure = this.currentFile.getStructure();
      if (structure === undefined) {
        if (ignoreParserError) { // todo, this is only used for testing, move the logic to testing instead
          return [];
        } else {
          throw new Error("Parser error");
        }
      }
      this.traverse(structure);
    }

    return this.issues;
  }

// todo, this assumes no tokes are the same(memory wise) across files
  public resolveToken(token: Token): Identifier | string | undefined {
    this.variables.addList(Globals.get(this.reg.getConfig().getSyntaxSetttings().globalConstants));

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
      key: "check_variables",
      start: token.getStart(),
      end: token.getEnd(),
    }));
  }

  private traverse(node: INode, search?: Token): Identifier | string | undefined {
    try {
      const skip = this.inline.update(node);
      if (skip) {
        return undefined;
      }
    } catch (e) {
      this.newIssue(node.getFirstToken(), e.message);
    }

// todo, the same variables can be checked multiple times? as Expressions are nested
    if (node instanceof ExpressionNode
        && (node.get() instanceof Expressions.Source
        || node.get() instanceof Expressions.Target)) {
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
        break;
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
    if (node instanceof StructureNode && node.get() instanceof Structures.TypeEnum) {
      this.proc.addEnumValues(node);
      return;
    } else if (!(node instanceof StatementNode)) {
      return;
    }

    const sub = node.get();
    this.proc.findDefinitions(node);

    if (sub instanceof Statements.Form) {
      this.proc.findFormScope(node);
    } else if (sub instanceof Statements.FunctionModule) {
      this.proc.findFunctionScope(node);
    } else if (sub instanceof Statements.Method) {
      this.oooc.methodImplementation(node);
    } else if (sub instanceof Statements.ClassDefinition) {
      this.oooc.classDefinition(node);
    } else if (sub instanceof Statements.ClassImplementation) {
      this.oooc.classImplementation(node);
    } else if (sub instanceof Statements.EndForm
        || sub instanceof Statements.EndMethod
        || sub instanceof Statements.EndFunction
        || sub instanceof Statements.EndClass) {
      this.variables.popScope();
    }
  }

}