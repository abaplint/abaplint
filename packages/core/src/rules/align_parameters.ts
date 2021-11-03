import {Issue} from "../issue";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Position} from "../position";
import {ExpressionNode, StructureNode} from "../abap/nodes";

export class AlignParametersConf extends BasicRuleConfig {
}

interface IParameterData {
  left: ExpressionNode;
  eq: Position;
  right: ExpressionNode;
}

interface ICandidate {
  parameters: IParameterData[];
}

export class AlignParameters extends ABAPRule {
  private conf = new AlignParametersConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "align_parameters",
      title: "Align Parameters",
      shortDescription: `Checks for aligned parameters in method calls, function module calls, VALUE constructors.`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide],
      badExample: `CALL FUNCTION 'FOOBAR'
  EXPORTING
    foo = 2
    parameter = 3.`,
      goodExample: `CALL FUNCTION 'FOOBAR'
  EXPORTING
    foo       = 2
    parameter = 3.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AlignParametersConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return issues; // parser error
    }

    const candidates: ICandidate[] = [];
    candidates.push(...this.functionParameterCandidates(stru));
    /*
    stru.findAllExpressionsRecursive(Expressions.MethodCallParam);
    stru.findAllExpressionsRecursive(Expressions.MethodParameters);
    stru.findAllExpressionsRecursive(Expressions.ValueBody);
    */

    return issues;
  }

  private functionParameterCandidates(stru: StructureNode): ICandidate[] {
    const candidates: ICandidate[] = [];
    for (const fp of stru.findAllExpressionsRecursive(Expressions.FunctionParameters)) {
      const exp = fp.findDirectExpression(Expressions.FunctionExporting);
      if (exp) {
        continue; // TODO
      }

      /*
      for (const pt of fp.findDirectExpressions(Expressions.ParameterListT)) {

      }

      fp.findDirectExpression(Expressions.ParameterListExceptions)
      */
    }
    return candidates;
  }

}