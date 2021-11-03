import {Issue} from "../issue";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Position} from "../position";
import {ExpressionNode, StructureNode, TokenNode} from "../abap/nodes";

export class AlignParametersConf extends BasicRuleConfig {
}

interface IParameterData {
  left: ExpressionNode | TokenNode;
  eq: Position;
  right: ExpressionNode | TokenNode;
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
      shortDescription: `Checks for aligned parameters in function module calls.`,
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
    /* TODO,
    stru.findAllExpressionsRecursive(Expressions.MethodCallParam);
    stru.findAllExpressionsRecursive(Expressions.MethodParameters);
    stru.findAllExpressionsRecursive(Expressions.ValueBody);
    */

    for (const c of candidates) {
      const i = this.checkCandidate(c, file);
      if (i) {
        issues.push(i);
      }
    }

    return issues;
  }

  private checkCandidate(candidate: ICandidate, file: ABAPFile): Issue | undefined {
    if (candidate.parameters.length === 0) {
      return undefined;
    }

    let expectedEqualsColumn = 0;
    for (const p of candidate.parameters) {
      const currentCol = p.left.getLastToken().getCol() + p.left.getLastToken().getStr().length + 1;
      if (currentCol > expectedEqualsColumn) {
        expectedEqualsColumn = currentCol;
      }
    }

    for (const p of candidate.parameters) {
      if (p.eq.getCol() !== expectedEqualsColumn) {
        const pos = candidate.parameters[0].eq;
        const message = "Align parameters to column " + expectedEqualsColumn;
        return Issue.atPosition(file, pos, message, this.getMetadata().key);
      }
    }

    return undefined;
  }

  private functionParameterCandidates(stru: StructureNode): ICandidate[] {
    const candidates: ICandidate[] = [];
    for (const fp of stru.findAllExpressionsRecursive(Expressions.FunctionParameters)) {
      const parameters: IParameterData[] = [];

      for (const p of fp.findAllExpressions(Expressions.FunctionExportingParameter)) {
        const children = p.getChildren();
        if (children.length < 3) {
          continue; // unexpected
        }
        parameters.push({
          left: children[0],
          eq: children[1].getFirstToken().getStart(),
          right: children[2],
        });
      }

      for (const list of fp.findDirectExpressions(Expressions.ParameterListT)) {
        for (const pt of list.findDirectExpressions(Expressions.ParameterT)) {
          const children = pt.getChildren();
          if (children.length < 3) {
            continue; // unexpected
          }
          parameters.push({
            left: children[0],
            eq: children[1].getFirstToken().getStart(),
            right: children[2],
          });
        }
      }

      const list = fp.findDirectExpression(Expressions.ParameterListExceptions);
      if (list) {
        for (const pt of list.findDirectExpressions(Expressions.ParameterException)) {
          const children = pt.getChildren();
          if (children.length < 3) {
            continue; // unexpected
          }
          parameters.push({
            left: children[0],
            eq: children[1].getFirstToken().getStart(),
            right: children[2],
          });
        }
      }

      if (parameters.length > 0) {
        candidates.push({parameters});
      }
    }
    return candidates;
  }

}