import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ExpressionNode} from "../abap/nodes/expression_node";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";

export class PreferRaiseMessageConf extends BasicRuleConfig {
  /** List of exception class names to ignore, case insensitive */
  public ignoreExceptionClasses: string[] = [];
}

export class PreferRaiseMessage extends ABAPRule {

  private conf = new PreferRaiseMessageConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_raise_message",
      title: "Prefer RAISE EXCEPTION with MESSAGE",
      shortDescription: `Prefer RAISE EXCEPTION with MESSAGE instead of supplying parameter TEXT or TEXTID`,
      extendedInformation: `Reports RAISE EXCEPTION statements where parameter TEXT or TEXTID is supplied.

Use a message class instead, so the text is translatable and can be found via where-used.

Exception classes can be excluded via configuration "ignoreExceptionClasses".`,
      tags: [RuleTag.SingleFile],
      goodExample: `RAISE EXCEPTION TYPE zcx_error MESSAGE e001(zclass).`,
      badExample: `RAISE EXCEPTION TYPE zcx_error
  EXPORTING text = 'hello world'.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferRaiseMessageConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const ignore = (this.conf.ignoreExceptionClasses ?? []).map(c => c.toUpperCase());

    for (const statement of file.getStatements()) {
      if (!(statement.get() instanceof Statements.Raise)) {
        continue;
      }
      const concat = statement.concatTokens().toUpperCase();
      if (!concat.startsWith("RAISE EXCEPTION ") && !concat.startsWith("RAISE RESUMABLE EXCEPTION ")) {
        continue;
      } else if (concat.includes(" MESSAGE")) {
        continue;
      }

      let className: string | undefined;
      let parameters: ExpressionNode | undefined;

      const newObject = statement.findDirectExpression(Expressions.Source)
        ?.findDirectExpression(Expressions.MethodCallChain)?.findDirectExpression(Expressions.NewObject);
      if (newObject) {
        className = newObject.findDirectExpression(Expressions.TypeNameOrInfer)?.concatTokens();
        parameters = newObject.findDirectExpression(Expressions.ParameterListS);
      } else {
        className = statement.findDirectExpression(Expressions.ClassName)?.concatTokens();
        parameters = statement.findDirectExpression(Expressions.ParameterListS);
      }

      if (className === undefined || ignore.includes(className.toUpperCase())) {
        continue;
      }

      const name = parameters?.findDirectExpressions(Expressions.ParameterS)
        .map(p => p.findDirectExpression(Expressions.ParameterName)?.concatTokens().toUpperCase())
        .find(n => n === "TEXT" || n === "TEXTID");
      if (name) {
        const message = "Prefer RAISE EXCEPTION with MESSAGE, " + className + " raised with parameter " + name;
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }
}
