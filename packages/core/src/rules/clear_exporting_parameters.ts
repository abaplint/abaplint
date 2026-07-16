import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {IdentifierMeta, TypedIdentifier} from "../abap/types/_typed_identifier";
import {Interface} from "../objects";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType, IReference} from "../abap/5_syntax/_reference";
import {VoidType, UnknownType} from "../abap/types/basic";
import {Position} from "../position";
import {Unknown} from "../abap/2_statements/statements/_statement";
import {EditHelper} from "../edit_helper";
import * as Expressions from "../abap/2_statements/expressions";

export class ClearExportingParametersConf extends BasicRuleConfig {
  /** Skip specific parameter names, case insensitive
   * @uniqueItems true
   */
  public skipNames?: string[] = [];
}

export class ClearExportingParameters implements IRule {
  private conf = new ClearExportingParametersConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "clear_exporting_parameters",
      title: "Clear EXPORTING parameters",
      shortDescription: `Checks that EXPORTING parameters passed by reference are cleared or assigned before they are read`,
      extendedInformation: `An EXPORTING parameter passed by reference behaves like a CHANGING parameter: it is not
initialized when the method is called, so it can still contain a value supplied by the caller. Clear or overwrite it
before reading it, so a leftover value is not accidentally used.

https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#clear-or-overwrite-exporting-reference-parameters

https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenref_transf_output_param_guidl.htm

Note: EXPORTING parameters passed by VALUE are always initialized and are therefore not reported.
Reading and writing the parameter in the same statement (e.g. "ev_result = ev_result + 1") is reported,
as the source is evaluated before the parameter is assigned.
Objects containing parser or syntax errors are not reported.

Only class and interface method implementations are checked, function module parameters are currently not supported.`,
      tags: [RuleTag.Styleguide],
      badExample: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo EXPORTING ev_result TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    ev_result = ev_result + 1.
  ENDMETHOD.
ENDCLASS.`,
      goodExample: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo EXPORTING ev_result TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    CLEAR ev_result.
    ev_result = ev_result + 1.
  ENDMETHOD.
ENDCLASS.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ClearExportingParametersConf) {
    this.conf = conf;
    if (this.conf.skipNames === undefined) {
      this.conf.skipNames = [];
    }
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject) || obj instanceof Interface) {
      return [];
    }

    for (const file of obj.getABAPFiles()) {
      for (const statement of file.getStatements()) {
        if (statement.get() instanceof Unknown) {
          return []; // contains parser errors
        }
      }
    }

    const syntax = new SyntaxLogic(this.reg, obj).run();
    if (syntax.issues.length > 0) {
      return []; // contains syntax errors
    }

    const issues: Issue[] = [];
    this.traverse(syntax.spaghetti.getTop(), obj, issues);
    return issues;
  }

  private traverse(node: ISpaghettiScopeNode, obj: ABAPObject, issues: Issue[]): void {
    if (node.getIdentifier().stype === ScopeType.Method) {
      this.checkMethod(node, obj, issues);
    }
    for (const child of node.getChildren()) {
      this.traverse(child, obj, issues);
    }
  }

  private checkMethod(node: ISpaghettiScopeNode, obj: ABAPObject, issues: Issue[]): void {
    const parameters = this.findExportingByReference(node, obj);
    if (parameters.length === 0) {
      return;
    }

    const references = this.collectReferences(node);

    for (const parameter of parameters) {
      const issue = this.checkParameter(parameter, references, obj);
      if (issue !== undefined) {
        issues.push(issue);
      }
    }
  }

  private findExportingByReference(node: ISpaghettiScopeNode, obj: ABAPObject): TypedIdentifier[] {
    const ret: TypedIdentifier[] = [];
    const vars = node.getData().vars;
    for (const name in vars) {
      const parameter = vars[name];
      const meta = parameter.getMeta();
      if (meta.includes(IdentifierMeta.MethodExporting) === false
          || meta.includes(IdentifierMeta.PassByValue) === true) {
        continue;
      } else if (this.conf.skipNames?.some(s => s.toUpperCase() === name.toUpperCase())) {
        continue;
      }
      const type = parameter.getType();
      if (type instanceof VoidType || type instanceof UnknownType) {
        continue; // e.g. RAP magic parameters, or unresolved types
      } else if (this.isPassByValue(parameter, obj) === true) {
        continue; // VALUE(..) parameters are always initialized
      }
      ret.push(parameter);
    }
    return ret;
  }

  private isPassByValue(parameter: TypedIdentifier, obj: ABAPObject): boolean {
    // the PassByValue meta is not set for EXPORTING parameters, so determine it from the definition
    const file = obj.getABAPFileByName(parameter.getFilename());
    if (file === undefined) {
      return false;
    }
    const statement = EditHelper.findStatement(parameter.getToken(), file);
    if (statement === undefined) {
      return false;
    }
    for (const param of statement.findAllExpressions(Expressions.MethodParam)) {
      const nameToken = param.findFirstExpression(Expressions.MethodParamName)?.getFirstToken();
      if (nameToken !== undefined && nameToken.getStart().equals(parameter.getStart())) {
        return param.getFirstToken().getStr().toUpperCase() === "VALUE";
      }
    }
    return false;
  }

  private collectReferences(node: ISpaghettiScopeNode): IReference[] {
    // methods do not nest, so all descendant scopes (FOR, LET, ...) belong to this method
    const ret: IReference[] = [...node.getData().references];
    for (const child of node.getChildren()) {
      ret.push(...this.collectReferences(child));
    }
    return ret;
  }

  private checkParameter(parameter: TypedIdentifier, references: IReference[], obj: ABAPObject): Issue | undefined {
    let firstRead: IReference | undefined = undefined;
    let earliestWrite: IReference | undefined = undefined;

    for (const reference of references) {
      if (reference.resolved === undefined || parameter.equals(reference.resolved) === false) {
        continue;
      }
      const pos = reference.position.getStart();
      if (reference.referenceType === ReferenceType.DataReadReference) {
        if (firstRead === undefined || pos.isBefore(firstRead.position.getStart())) {
          firstRead = reference;
        }
      } else if (reference.referenceType === ReferenceType.DataWriteReference) {
        if (earliestWrite === undefined || pos.isBefore(earliestWrite.position.getStart())) {
          earliestWrite = reference;
        }
      }
    }

    if (firstRead === undefined) {
      return undefined; // never read, no hazard
    }

    // the parameter is safe only if it is written in a statement strictly before the first read
    const readStatement = this.statementStart(firstRead, obj);
    const writeStatement = earliestWrite === undefined ? undefined : this.statementStart(earliestWrite, obj);
    if (writeStatement !== undefined && readStatement !== undefined && writeStatement.isBefore(readStatement)) {
      return undefined;
    }

    const message = `EXPORTING parameter "${parameter.getName().toLowerCase()}" read before it is cleared or assigned`;
    return Issue.atIdentifier(firstRead.position, message, this.getMetadata().key, this.conf.severity);
  }

  private statementStart(reference: IReference, obj: ABAPObject): Position | undefined {
    const file = obj.getABAPFileByName(reference.position.getFilename());
    for (const statement of file?.getStatements() || []) {
      const pos = reference.position.getStart();
      const start = statement.getStart();
      const end = statement.getEnd();
      if (pos.equals(start) || (pos.isAfter(start) && pos.isBefore(end))) {
        return start;
      }
    }
    return undefined;
  }
}
