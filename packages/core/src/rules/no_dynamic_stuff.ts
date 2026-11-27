import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ExpressionNode, StatementNode} from "../abap/nodes";
import {ABAPObject} from "../objects/_abap_object";
import {LanguageVersion} from "../version";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ClassAttribute} from "../abap/types/class_attribute";
import {IdentifierMeta} from "../abap/types/_typed_identifier";

export class NoDynamicStuffConf extends BasicRuleConfig {
  /** Detects dynamic method calls, ie. CALL METHOD (name), SET HANDLER and CALL BADI */
  public callMethod: boolean = true;
  /** Detects dynamic CALL FUNCTION, ie. the function module name is not a literal */
  public callFunction: boolean = true;
  /** Detects CALL DATABASE PROCEDURE, the procedure name is always dynamic */
  public callDatabaseProcedure: boolean = true;
  /** Detects dynamic CALL TRANSFORMATION */
  public callTransformation: boolean = true;
  /** Detects dynamic CALL TRANSACTION, ie. the transaction code is not a literal */
  public callTransaction: boolean = true;
  /** Detects dynamic PERFORM */
  public perform: boolean = true;
  /** Detects dynamic SUBMIT */
  public submit: boolean = true;
  /** Detects dynamic CREATE OBJECT */
  public createObject: boolean = true;
  /** Detects dynamic CREATE DATA */
  public createData: boolean = true;
  /** Detects dynamic GET BADI */
  public getBadi: boolean = true;
  /** Detects dynamic ASSIGN, including ASSIGN COMPONENT */
  public assign: boolean = true;
  /** Detects dynamic internal table access, ie. dynamic WHERE, keys, SORT BY and TRANSPORTING */
  public internalTable: boolean = true;
  /** Detects dynamic EXPORT and IMPORT */
  public exportImport: boolean = true;
  /** Only with syntax version Cloud: detects the old variant of the dynamic ASSIGN, ie. ASSIGN (name) where name is a
   * literal or constant holding a path with a selector, eg. 'MO_APP->ATTR'. Reported also when "assign" is off */
  public assignOldVariantCloud: boolean = true;
}

export class NoDynamicStuff extends ABAPRule {

  private conf = new NoDynamicStuffConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_dynamic_stuff",
      title: "No dynamic stuff",
      shortDescription: `Detects dynamic calls and other dynamic language constructs`,
      extendedInformation: `Dynamic constructs cannot be checked statically, they are not found by
where-used lists and refactorings, and they can introduce injection vulnerabilities.

Dynamic tokens are also reported when containing a literal, eg. CALL METHOD go_calendar->('RESET_DAY_INFO'),
the syntax check does not resolve these either, so they behave like any other dynamic token.

Dynamic SQL is reported by rule dangerous_statement.`,
      tags: [RuleTag.SingleFile, RuleTag.Security],
      badExample: `CALL METHOD (lv_class)=>(lv_method).
CALL METHOD go_calendar->('RESET_DAY_INFO').
CALL FUNCTION lv_function_module.
CREATE OBJECT ref TYPE (lv_class).
ASSIGN (lv_name) TO <fs>.
SORT tab BY (lv_field).`,
      goodExample: `cl_class=>method( ).
go_calendar->reset_day_info( ).
CALL FUNCTION 'ZFOO'.
CREATE OBJECT ref TYPE cl_class.
ASSIGN foo TO <fs>.
SORT tab BY field.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoDynamicStuffConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const issues: Issue[] = [];

    for (const statementNode of file.getStatements()) {
      const path = this.assignOldVariantPath(statementNode, file, obj);
      if (path !== undefined) {
        const message = `Old variant of dynamic ASSIGN, path ${path} given as text should not be used in ABAP for Cloud Development, ` +
          `use oref->(attr), struc-(comp), class=>(attr) or dref->* instead`;
        issues.push(Issue.atStatement(file, statementNode, message, this.getMetadata().key, this.conf.severity));
        continue;
      }

      const found = this.check(statementNode);
      if (found !== undefined) {
        issues.push(Issue.atStatement(file, statementNode, "Dynamic " + found,
                                      this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

  private check(node: StatementNode): string | undefined {
    const statement = node.get();

// note that MethodSource is also used by SET HANDLER and CALL BADI
    if (this.conf.callMethod === true && this.dynamicMethodSource(node) === true) {
      return "method call";
    }

    if (statement instanceof Statements.CallFunction) {
      if (this.conf.callFunction === true
          && this.notLiteral(node.findDirectExpression(Expressions.FunctionName))) {
        return "CALL FUNCTION";
      }
    } else if (statement instanceof Statements.CallDatabase) {
      if (this.conf.callDatabaseProcedure === true) {
        return "CALL DATABASE PROCEDURE";
      }
    } else if (statement instanceof Statements.CallTransformation) {
      if (this.conf.callTransformation === true && this.hasDynamic(node)) {
        return "CALL TRANSFORMATION";
      }
    } else if (statement instanceof Statements.CallTransaction) {
// the transaction code is a Source, ie. there is no parenthesized dynamic variant
      if (this.conf.callTransaction === true
          && this.notLiteral(node.findDirectExpression(Expressions.Source))) {
        return "CALL TRANSACTION";
      }
    } else if (statement instanceof Statements.Perform) {
      if (this.conf.perform === true && this.hasDynamic(node)) {
        return "PERFORM";
      }
    } else if (statement instanceof Statements.Submit) {
      if (this.conf.submit === true && this.hasDynamic(node)) {
        return "SUBMIT";
      }
    } else if (statement instanceof Statements.CreateObject) {
      if (this.conf.createObject === true && this.hasDynamic(node)) {
        return "CREATE OBJECT";
      }
    } else if (statement instanceof Statements.CreateData) {
      if (this.conf.createData === true && this.hasDynamic(node)) {
        return "CREATE DATA";
      }
    } else if (statement instanceof Statements.GetBadi) {
      if (this.conf.getBadi === true && this.hasDynamic(node)) {
        return "GET BADI";
      }
    } else if (statement instanceof Statements.Assign
        || statement instanceof Statements.AssignLocalCopy) {
      if (this.conf.assign === true
          && (this.hasDynamic(node) || this.dynamicAssignComponent(node))) {
        return "ASSIGN";
      }
    } else if (statement instanceof Statements.Export) {
      if (this.conf.exportImport === true && this.hasDynamic(node)) {
        return "EXPORT";
      }
    } else if (statement instanceof Statements.Import) {
      if (this.conf.exportImport === true && this.hasDynamic(node)) {
        return "IMPORT";
      }
    } else if (statement instanceof Statements.At
        || statement instanceof Statements.DeleteInternal
        || statement instanceof Statements.InsertInternal
        || statement instanceof Statements.Loop
        || statement instanceof Statements.ModifyInternal
        || statement instanceof Statements.ReadTable
        || statement instanceof Statements.Sort
        || statement instanceof Statements.SortDataset) {
      if (this.conf.internalTable === true && this.hasDynamic(node)) {
        return "internal table access";
      }
    }

    return undefined;
  }

  /** ABAP for Cloud Development warns about the old variant of the dynamic data object, ie. ASSIGN (name) where the
   * text in name is a whole operand including selectors. Only reported when the text is known: a literal or a constant.
   * Returns the text, or undefined if not the old variant */
  private assignOldVariantPath(node: StatementNode, file: ABAPFile, obj: ABAPObject): string | undefined {
    if (this.conf.assignOldVariantCloud !== true
        || this.reg.getConfig().getLanguageVersion() !== LanguageVersion.Cloud
        || !(node.get() instanceof Statements.Assign)) {
      return undefined;
    }

    // the old variant is a single Dynamic, forms like (class)=>(attr) have more children
    const children = node.findDirectExpression(Expressions.AssignSource)?.getChildren() || [];
    if (children.length !== 1 || !(children[0] instanceof ExpressionNode) || !(children[0].get() instanceof Expressions.Dynamic)) {
      return undefined;
    }

    let text: string | undefined = undefined;
    const literal = children[0].findDirectExpression(Expressions.Constant);
    const name = children[0].findDirectExpression(Expressions.FieldChain);
    if (literal) {
      text = literal.concatTokens();
    } else if (name?.getChildren().length === 1) {
      text = this.constantValue(name, file, obj);
    }

    if (text === undefined || !(text.includes("->") || text.includes("=>") || text.includes("-"))) {
      return undefined;
    }
    return text;
  }

  private constantValue(name: ExpressionNode, file: ABAPFile, obj: ABAPObject): string | undefined {
    const token = name.getFirstToken();
    const scope = new SyntaxLogic(this.reg, obj).run().spaghetti.lookupPosition(token.getStart(), file.getFilename());
    const found = scope?.findVariable(token.getStr());
    // class attributes can be READ-ONLY with a VALUE, but are not constants
    if (found === undefined
        || found instanceof ClassAttribute
        || found.getMeta().includes(IdentifierMeta.ReadOnly) === false
        || found.getMeta().includes(IdentifierMeta.Static) === false) {
      return undefined;
    }
    const value = found.getValue();
    return typeof value === "string" ? value : undefined;
  }

  private dynamicMethodSource(node: StatementNode): boolean {
    for (const source of node.findAllExpressions(Expressions.MethodSource)) {
// Dynamic is always a direct child of MethodSource, dynamics further down
// are parameters of the method call and not part of the method name
      if (source.findDirectExpression(Expressions.Dynamic) !== undefined) {
        return true;
      }
    }
    return false;
  }

  private dynamicAssignComponent(node: StatementNode): boolean {
    const component = node.findDirectExpression(Expressions.AssignSource)?.findExpressionAfterToken("COMPONENT");
    return component !== undefined && this.isLiteral(component) === false;
  }

  private hasDynamic(node: StatementNode): boolean {
    return node.findFirstExpression(Expressions.Dynamic) !== undefined;
  }

  private notLiteral(node: ExpressionNode | undefined): boolean {
    return node !== undefined && this.isLiteral(node) === false;
  }

  private isLiteral(node: ExpressionNode): boolean {
    return node.findDirectExpression(Expressions.Constant) !== undefined;
  }

}
