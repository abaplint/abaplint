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
import {ScopedVariables} from "./_scoped_variables";
import {ObjectOriented} from "./_object_oriented";
import {Globals} from "./_globals";
import {Procedural} from "./_procedural";
import {Inline} from "./_inline";
import {Program} from "../../objects";

// todo: should filename and ScopedVariables be singletons instead of passed everywhere?

export class CheckVariablesLogic {
  private readonly object: ABAPObject;
  private currentFile: ABAPFile;
  private readonly variables: ScopedVariables;
  private readonly issues: Issue[];
  private readonly reg: Registry;
  private readonly oooc: ObjectOriented;
  private readonly proc: Procedural;
  private readonly inline: Inline;

  constructor(reg: Registry, object: ABAPObject) {
    this.reg = reg;
    this.issues = [];

    this.object = object;
    this.variables = new ScopedVariables(Globals.get(this.reg.getConfig().getSyntaxSetttings().globalConstants));
    this.oooc = new ObjectOriented(this.object, this.reg, this.variables);
    this.proc = new Procedural(this.object, this.variables);
    this.inline = new Inline(this.variables, this.reg);
  }

  public findIssues(ignoreParserError = true): Issue[] {

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
      this.traverse(structure, file.getFilename());
    }

    return this.issues;
  }

// todo, this assumes no tokes are the same across files, loops all getABAPFiles
  public traverseUntil(token: Token): ScopedVariables {

    for (const file of this.object.getABAPFiles()) {
      this.currentFile = file;
    // assumption: objects are parsed without parsing errors
      const structure = this.currentFile.getStructure();
      if (structure === undefined) {
        return this.variables;
      } else if (this.traverse(structure, file.getFilename(), token)) {
        return this.variables;
      }
    }

    return this.variables;
  }

/////////////////////////////

  private newIssue(token: Token, message: string): void {
    const issue = Issue.atToken(this.currentFile, token, message, "check_variables");
    this.issues.push(issue);
  }

  private traverse(node: INode, filename: string, stopAt?: Token): boolean {
    try {
      const skip = this.inline.update(node, filename);
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
        const resolved = this.variables.resolve(token.getStr());
        if (resolved === undefined) {
          this.newIssue(token, "\"" + token.getStr() + "\" not found");
        }
      }
    }

    for (const child of node.getChildren()) {
      try {
        this.updateVariables(child, filename);
      } catch (e) {
        this.newIssue(child.getFirstToken(), e.message);
        break;
      }

      const stop = this.traverse(child, filename, stopAt);
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

  private updateVariables(node: INode, filename: string): void {
// todo, align statements, eg is NamespaceSimpleName a definition or is it Field, or something new?
// todo, and introduce SimpleSource?
    if (node instanceof StructureNode && node.get() instanceof Structures.TypeEnum) {
      this.proc.addEnumValues(node, filename);
      return;
    } else if (!(node instanceof StatementNode)) {
      return;
    }

    const statement = node.get();
    this.proc.addDefinitions(node, filename);

    if (statement instanceof Statements.Form) {
      this.proc.findFormScope(node, filename);
    } else if (statement instanceof Statements.FunctionModule) {
      this.proc.findFunctionScope(node);
    } else if (statement instanceof Statements.Method) {
      this.oooc.methodImplementation(node);
    } else if (statement instanceof Statements.ClassDefinition) {
      this.oooc.classDefinition(node);
    } else if (statement instanceof Statements.ClassImplementation) {
      this.oooc.classImplementation(node);
    } else if (statement instanceof Statements.EndForm
        || statement instanceof Statements.EndMethod
        || statement instanceof Statements.EndFunction
        || statement instanceof Statements.EndClass) {
      this.variables.popScope();
    }
  }

}