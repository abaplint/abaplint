import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import * as Structures from "../abap/3_structures/structures";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {ExpressionNode, StatementNode} from "../abap/nodes";
import * as Tokens from "../abap/1_lexer/tokens";
import {Severity} from "../severity";

export class UnitTestAssertionsConf extends BasicRuleConfig {
  public severity?: Severity = Severity.Warning;
  /** Report assertions that cannot fail: assert_equals or assert_equals_float with the same operand for act and exp,
   * assert_true with abap_true or 'X', assert_false with abap_false, space or ' ' */
  public cannotFail: boolean = true;
  /** Report the ASSERT statement in FOR TESTING classes */
  public assertStatement: boolean = true;
}

const ASSERT_CLASSES = ["CL_ABAP_UNIT_ASSERT", "CL_AUNIT_ASSERT"];

export class UnitTestAssertions extends ABAPRule {
  private conf = new UnitTestAssertionsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unit_test_assertions",
      title: "Unit test assertions",
      shortDescription: `Reports unit test assertions that cannot fail, and the ASSERT statement in FOR TESTING classes`,
      extendedInformation: `Only code in FOR TESTING classes is checked. Each check has its own option.

cannotFail: an assertion of cl_abap_unit_assert or cl_aunit_assert that passes whatever the code under test does.
assert_equals and assert_equals_float with the same operand for act and exp, assert_true with abap_true or 'X',
assert_false with abap_false, space or ' '. Not reported: operands that contain a method call or NEW, as two calls
can return different values; two different literals or constants; assertions that always fail.

assertStatement: the ASSERT statement. A failing ASSERT ends in the runtime error ASSERTION_FAILED, so the test
run shows a short dump instead of a failed test with act, exp and a message. Use cl_abap_unit_assert instead.
Not reported: ASSERT in classes that are not FOR TESTING.`,
      tags: [],
      badExample: `CLASS ltcl_test DEFINITION FINAL FOR TESTING DURATION SHORT RISK LEVEL HARMLESS.
  PRIVATE SECTION.
    DATA mt_rows TYPE string_table.
    METHODS test FOR TESTING.
ENDCLASS.

CLASS ltcl_test IMPLEMENTATION.
  METHOD test.
    DATA(lv_count) = lines( mt_rows ).
    cl_abap_unit_assert=>assert_equals( act = lv_count exp = lv_count ).
    cl_abap_unit_assert=>assert_true( abap_true ).
    ASSERT lv_count = 2.
  ENDMETHOD.
ENDCLASS.`,
      goodExample: `CLASS ltcl_test DEFINITION FINAL FOR TESTING DURATION SHORT RISK LEVEL HARMLESS.
  PRIVATE SECTION.
    DATA mt_rows TYPE string_table.
    METHODS test FOR TESTING.
ENDCLASS.

CLASS ltcl_test IMPLEMENTATION.
  METHOD test.
    DATA(lv_count) = lines( mt_rows ).
    cl_abap_unit_assert=>assert_equals( act = lv_count exp = 2 ).
    cl_abap_unit_assert=>assert_true( xsdbool( lv_count > 0 ) ).
  ENDMETHOD.
ENDCLASS.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnitTestAssertionsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject): Issue[] {
    const issues: Issue[] = [];
    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    const testClasses = this.testClassNames(obj);
    if (testClasses.size === 0) {
      return [];
    }

    for (const implementation of structure.findAllStructures(Structures.ClassImplementation)) {
      const name = implementation.findFirstStatement(Statements.ClassImplementation)
        ?.findFirstExpression(Expressions.ClassName)?.concatTokens().toUpperCase();
      if (name === undefined || testClasses.has(name) === false) {
        continue;
      }

      for (const statement of implementation.findAllStatementNodes()) {
        if (this.conf.assertStatement === true && statement.get() instanceof Statements.Assert) {
          const message = "Use cl_abap_unit_assert instead of ASSERT in a test class";
          issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
        } else if (this.conf.cannotFail === true && statement.get() instanceof Statements.Call) {
          const message = this.cannotFail(statement);
          if (message !== undefined) {
            issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
          }
        }
      }
    }

    return issues;
  }

  /** names of the FOR TESTING classes defined in any file of the object, upper case */
  private testClassNames(obj: ABAPObject): Set<string> {
    const ret = new Set<string>();
    for (const f of obj.getABAPFiles()) {
      for (const def of f.getInfo().listClassDefinitions()) {
        if (def.isForTesting === true) {
          ret.add(def.name.toUpperCase());
        }
      }
    }
    return ret;
  }

  /** returns the message if the call is an assertion that cannot fail */
  private cannotFail(statement: StatementNode): string | undefined {
    const call = this.assertCall(statement);
    if (call === undefined) {
      return undefined;
    }

    if (call.method === "ASSERT_EQUALS" || call.method === "ASSERT_EQUALS_FLOAT") {
      const act = call.parameters.get("ACT");
      const exp = call.parameters.get("EXP");
      if (act === undefined || exp === undefined || this.hasCall(act) || this.hasCall(exp)) {
        return undefined;
      }
      if (this.normalized(act) === this.normalized(exp)) {
        return "Assertion cannot fail, act and exp are the same";
      }
    } else if (call.method === "ASSERT_TRUE" || call.method === "ASSERT_FALSE") {
      const act = call.parameters.get("ACT");
      if (act === undefined) {
        return undefined;
      }
      const value = this.normalized(act);
      if (call.method === "ASSERT_TRUE" && (value === "ABAP_TRUE" || value === "'X'")) {
        return "Assertion cannot fail, act is abap_true";
      } else if (call.method === "ASSERT_FALSE"
          && (value === "ABAP_FALSE" || value === "SPACE" || value === "''" || value === "' '")) {
        return "Assertion cannot fail, act is abap_false";
      }
    }

    return undefined;
  }

  /** class method call of cl_abap_unit_assert or cl_aunit_assert: method name and the sources by parameter name, upper case */
  private assertCall(statement: StatementNode): {method: string, parameters: Map<string, ExpressionNode>} | undefined {
    let className: ExpressionNode | undefined;
    let methodName: ExpressionNode | undefined;
    let parameters: ExpressionNode | undefined;

    const chain = statement.findDirectExpression(Expressions.MethodCallChain);
    const source = statement.findDirectExpression(Expressions.MethodSource);
    if (chain !== undefined) {
      const children = chain.getChildren();
      const methodCall = chain.findDirectExpression(Expressions.MethodCall);
      if (children.length !== 3 || methodCall === undefined) {
        return undefined;
      }
      className = chain.findDirectExpression(Expressions.ClassName);
      methodName = methodCall.findDirectExpression(Expressions.MethodName);
      parameters = methodCall.findDirectExpression(Expressions.MethodCallParam);
    } else if (source !== undefined) {
      const children = source.getChildren();
      if (children.length !== 3) {
        return undefined;
      }
      className = source.findDirectExpression(Expressions.ClassName);
      methodName = source.findDirectExpression(Expressions.AttributeName);
      parameters = statement.findDirectExpression(Expressions.MethodCallBody);
    }

    if (className === undefined
        || methodName === undefined
        || parameters === undefined
        || ASSERT_CLASSES.includes(className.concatTokens().toUpperCase()) === false) {
      return undefined;
    }

    // CALL METHOD x( ... ) and the functional call have a MethodCallParam, CALL METHOD x EXPORTING ... has not
    const param = parameters.get() instanceof Expressions.MethodCallParam
      ? parameters : parameters.findDirectExpression(Expressions.MethodCallParam);
    const list = param?.findDirectExpression(Expressions.ParameterListS)
      || (param || parameters).findDirectExpression(Expressions.MethodParameters)?.findDirectExpression(Expressions.ParameterListS);

    const map = new Map<string, ExpressionNode>();
    const single = param?.findDirectExpression(Expressions.Source);
    if (single !== undefined) {
      // only the preferred parameter is given, for the assertions checked here it is ACT
      map.set("ACT", single);
    }
    for (const parameter of list?.findDirectExpressions(Expressions.ParameterS) || []) {
      const name = parameter.findDirectExpression(Expressions.ParameterName)?.concatTokens().toUpperCase();
      const value = parameter.findDirectExpression(Expressions.Source);
      if (name !== undefined && value !== undefined) {
        map.set(name, value);
      }
    }

    return {method: methodName.concatTokens().toUpperCase(), parameters: map};
  }

  /** two evaluations of the source can give different values */
  private hasCall(source: ExpressionNode): boolean {
    return source.findFirstExpression(Expressions.MethodCallChain) !== undefined
      || source.findFirstExpression(Expressions.MethodCall) !== undefined
      || source.findFirstExpression(Expressions.NewObject) !== undefined;
  }

  /** the tokens of the source, upper case outside of literals */
  private normalized(source: ExpressionNode): string {
    return source.getAllTokens().map(token => {
      if (token instanceof Tokens.StringToken
          || token instanceof Tokens.StringTemplate
          || token instanceof Tokens.StringTemplateBegin
          || token instanceof Tokens.StringTemplateMiddle
          || token instanceof Tokens.StringTemplateEnd) {
        return token.getStr();
      }
      return token.getStr().toUpperCase();
    }).join(" ");
  }

}
