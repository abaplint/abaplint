import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Severity} from "../severity";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {IRegistry} from "../_iregistry";
import {FunctionGroup} from "../objects";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {MethodDefinition} from "../abap/types";
import {FunctionModuleDefinition} from "../abap/types/function_module_definition";
import {ExpressionNode, StatementNode} from "../abap/nodes";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {Position} from "../position";
import {VirtualPosition} from "../virtual_position";

export class UnhandledClassicExceptionConf extends BasicRuleConfig {
  public severity?: Severity = Severity.Warning;
  /** Report an EXCEPTIONS list without OTHERS, unless the method or function module is known and all its exceptions are listed */
  public missingOthers: boolean = true;
  /** Report a call without EXCEPTIONS, including a functional call, of a method or function module that declares classic exceptions */
  public missingExceptions: boolean = true;
  /** missingExceptions: do not report a method call whose arguments are all literals or me, like describe_by_name( 'T100' ) */
  public allowLiteralArguments: boolean = true;
  /** Report CALL FUNCTION without error_message, the policy "always list error_message", for code that runs outside dialog */
  public missingErrorMessage: boolean = false;
}

interface ICallee {
  name: string;
  exceptions: string[];
}

export class UnhandledClassicException extends ABAPRule {
  private conf = new UnhandledClassicExceptionConf();
  private functionModules: Map<string, FunctionModuleDefinition> | undefined;

  public getMetadata(): IRuleMetadata {
    return {
      key: "unhandled_classic_exception",
      title: "Unhandled classic exception",
      shortDescription: `Finds calls that do not map every classic exception the callee can raise`,
      extendedInformation: `A classic exception that is raised with RAISE and not mapped in the EXCEPTIONS addition of the call
ends in the runtime error RAISE_EXCEPTION. TRY ... CATCH cx_root does not catch it.

missingOthers: reports CALL FUNCTION and method calls with an EXCEPTIONS list without OTHERS.
Not reported if the function module or method is known and every exception it declares is listed,
for CALL FUNCTION ... DESTINATION this includes SYSTEM_FAILURE and COMMUNICATION_FAILURE.
CALL FUNCTION ... STARTING NEW TASK, IN UPDATE TASK and IN BACKGROUND are not checked.

missingExceptions: reports calls without EXCEPTIONS of a method or function module that declares classic exceptions,
this includes functional calls, which cannot have EXCEPTIONS.
With allowLiteralArguments, a method call whose arguments are all literals or me is not reported.

missingErrorMessage, off by default: reports every CALL FUNCTION that does not list the predefined exception error_message,
the policy "always list error_message". Any function module can send a MESSAGE without RAISING, directly or from a
function module it calls, and OTHERS does not catch it. Outside dialog, in HTTP handlers, RFC and background jobs,
a message of type E or A ends the processing. Use it together with check_subrc, otherwise error_message turns a
visible abort into a silent failure. Not reported: DESTINATION, STARTING NEW TASK, IN UPDATE TASK, IN BACKGROUND,
EXCEPTION-TABLE, and function modules in the registry with class-based exceptions.

Signatures are taken from the registry, including dependencies. Methods and function modules that are not
found (void) are only checked by missingOthers.

Does not report any issues if the code contains syntax errors`,
      tags: [RuleTag.Syntax],
      badExample: `CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    not_found = 1.

lo_type = cl_abap_typedescr=>describe_by_name( lv_name ).`,
      goodExample: `CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2.

cl_abap_typedescr=>describe_by_name(
  EXPORTING
    p_name         = lv_name
  RECEIVING
    p_descr_ref    = lo_type
  EXCEPTIONS
    type_not_found = 1
    OTHERS         = 2 ).`,
    };
  }

  public initialize(reg: IRegistry) {
    super.initialize(reg);
    this.functionModules = undefined;
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnhandledClassicExceptionConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject): Issue[] {
    if (obj.getType() === "INTF" || file.getStructure() === undefined) {
      return [];
    }

    const syntax = new SyntaxLogic(this.reg, obj).run();
    if (syntax.issues.length > 0) {
      return [];
    }

    const methods = new Map<string, MethodDefinition>();
    this.findMethodReferences(syntax.spaghetti.getTop(), file.getFilename(), methods);

    const issues: Issue[] = [];
    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.CallFunction) {
        issues.push(...this.checkCallFunction(statement, file));
        continue;
      }

      if (statement.get() instanceof Statements.Call) {
        const source = statement.findDirectExpression(Expressions.MethodSource);
        const body = statement.findDirectExpression(Expressions.MethodCallBody);
        const nameNode = source?.getLastChild();
        if (nameNode) {
          const token = nameNode.getFirstToken();
          const callee = nameNode.get() instanceof Expressions.Dynamic ? undefined : this.findMethod(methods, token);
          const issue = this.checkCall(file, token, callee, body?.findDirectExpression(Expressions.MethodParameters),
                                       body?.findDirectTokenByText("EXCEPTION") !== undefined, false, this.onlyLiterals(body));
          if (issue) {
            issues.push(issue);
          }
        }
      }

      for (const call of statement.findAllExpressionsRecursive(Expressions.MethodCall)) {
        const token = call.findDirectExpression(Expressions.MethodName)?.getFirstToken();
        if (token === undefined) {
          continue;
        }
        const param = call.findDirectExpression(Expressions.MethodCallParam);
        const parameters = param?.findDirectExpression(Expressions.MethodParameters);
        const issue = this.checkCall(file, token, this.findMethod(methods, token), parameters, false, false, this.onlyLiterals(param));
        if (issue) {
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  private checkCallFunction(statement: StatementNode, file: ABAPFile): Issue[] {
    if (statement.findDirectTokenByText("STARTING")
        || statement.findDirectTokenByText("UPDATE")
        || statement.findDirectTokenByText("BACKGROUND")) {
      return [];
    }

    const nameNode = statement.findDirectExpression(Expressions.FunctionName);
    if (nameNode === undefined) {
      return [];
    }

    let callee: ICallee | undefined = undefined;
    let classBased = false;
    if (nameNode.findFirstExpression(Expressions.FieldChain) === undefined) {
      const name = nameNode.concatTokens().replace(/'/g, "").replace(/`/g, "");
      const module = this.findFunctionModule(name);
      if (module) {
        classBased = module.isClassBasedExceptions();
        callee = {
          name: module.getName(),
          exceptions: classBased ? [] : module.getExceptions().map(e => e.toUpperCase()),
        };
      }
    }

    const issues: Issue[] = [];
    const parameters = statement.findDirectExpression(Expressions.FunctionParameters);
    const exceptionTable = statement.findDirectTokenByText("EXCEPTION") !== undefined;
    const destination = statement.findDirectExpression(Expressions.Destination) !== undefined;
    const issue = this.checkCall(file, nameNode.getFirstToken(), callee, parameters, exceptionTable, destination, false);
    if (issue) {
      issues.push(issue);
    }

    if (this.conf.missingErrorMessage === true && exceptionTable === false && destination === false && classBased === false) {
      const listed = parameters?.findDirectExpression(Expressions.ParameterListExceptions)
        ?.findDirectExpressions(Expressions.ParameterException)
        .some(e => e.getFirstChild()!.concatTokens().toUpperCase() === "ERROR_MESSAGE");
      if (listed !== true) {
        const position = parameters?.findDirectTokenByText("EXCEPTIONS") || nameNode.getFirstToken();
        const message = "No error_message, OTHERS does not catch a message that the function module sends without RAISING";
        issues.push(Issue.atToken(file, position, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

  private checkCall(file: ABAPFile, token: AbstractToken, callee: ICallee | undefined,
                    parameters: ExpressionNode | undefined, exceptionTable: boolean, destination: boolean,
                    onlyLiterals: boolean): Issue | undefined {
    if (exceptionTable === true) {
      return undefined;
    }

    const list = parameters?.findDirectExpression(Expressions.ParameterListExceptions);
    if (list === undefined) {
      if (this.conf.missingExceptions === false
          || callee === undefined
          || callee.exceptions.length === 0
          || (this.conf.allowLiteralArguments === true && onlyLiterals === true)) {
        return undefined;
      }
      const message = `Classic exceptions of "${callee.name}" not handled: ${callee.exceptions.join(", ")}, call it with EXCEPTIONS`;
      return Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity);
    }

    if (this.conf.missingOthers === false) {
      return undefined;
    }

    const listed = list.findDirectExpressions(Expressions.ParameterException)
      .map(e => e.getFirstChild()!.concatTokens().toUpperCase());
    if (listed.includes("OTHERS")) {
      return undefined;
    }

    const position = parameters!.findDirectTokenByText("EXCEPTIONS") || list.getFirstToken();

    if (callee === undefined) {
      const message = "EXCEPTIONS without OTHERS, an exception that is not listed ends in a runtime error";
      return Issue.atToken(file, position, message, this.getMetadata().key, this.conf.severity);
    }

    const expected = [...callee.exceptions];
    if (destination === true) {
      expected.push("SYSTEM_FAILURE", "COMMUNICATION_FAILURE");
    }
    const missing = expected.filter(e => listed.includes(e) === false);
    if (missing.length === 0) {
      return undefined;
    }
    const message = `EXCEPTIONS without OTHERS, not mapped: ${missing.join(", ")}`;
    return Issue.atToken(file, position, message, this.getMetadata().key, this.conf.severity);
  }

  /** true if the call has arguments and all of them are literals or me, like describe_by_name( 'T100' ) */
  private onlyLiterals(node: ExpressionNode | undefined): boolean {
    if (node === undefined || node.findFirstExpression(Expressions.MethodCall) !== undefined) {
      return false;
    }
    const sources = node.findAllExpressions(Expressions.Source);
    return sources.length > 0
      && sources.every(s => (s.getChildren().length === 1 && s.getFirstChild()?.get() instanceof Expressions.Constant)
        || s.concatTokens().toUpperCase() === "ME");
  }

  private findMethod(methods: Map<string, MethodDefinition>, token: AbstractToken): ICallee | undefined {
    const method = methods.get(UnhandledClassicException.positionKey(token.getStart()));
    if (method === undefined) {
      return undefined;
    }
    return {
      name: method.getName(),
      exceptions: method.getExceptions().map(e => e.toUpperCase()),
    };
  }

  private findMethodReferences(node: ISpaghettiScopeNode, filename: string, found: Map<string, MethodDefinition>): void {
    for (const r of node.getData().references) {
      if (r.referenceType === ReferenceType.MethodReference
          && r.position.getFilename() === filename
          && r.resolved instanceof MethodDefinition) {
        found.set(UnhandledClassicException.positionKey(r.position.getStart()), r.resolved);
      }
    }

    for (const child of node.getChildren()) {
      this.findMethodReferences(child, filename, found);
    }
  }

  private findFunctionModule(name: string): FunctionModuleDefinition | undefined {
    if (this.functionModules === undefined) {
      this.functionModules = new Map<string, FunctionModuleDefinition>();
      for (const fugr of this.reg.getObjectsByType("FUGR")) {
        for (const module of (fugr as FunctionGroup).getModules()) {
          this.functionModules.set(module.getName().toUpperCase(), module);
        }
      }
    }
    return this.functionModules.get(name.toUpperCase());
  }

  private static positionKey(p: Position): string {
    if (p instanceof VirtualPosition) {
      return p.getRow() + ":" + p.getCol() + ":" + p.vrow + ":" + p.vcol;
    }
    return p.getRow() + ":" + p.getCol();
  }

}
