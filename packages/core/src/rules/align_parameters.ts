import {Issue} from "../issue";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Position} from "../position";
import {StructureNode} from "../abap/nodes";
import {INode} from "../abap/nodes/_inode";
import {Statements} from "..";

export class AlignParametersConf extends BasicRuleConfig {
}

interface IParameterData {
  left: INode;
  eq: Position;
  right: INode;
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
      shortDescription: `Checks for vertially aligned parameters`,
      extendedInformation: `Checks:
* function module calls
* method calls
* VALUE constructors
* NEW constructors
* RAISE EXCEPTION statements
* CREATE OBJECT statements
* RAISE EVENT statements

https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#align-parameters

Does not take effect on non functional method calls, use https://rules.abaplint.org/functional_writing/

Also https://rules.abaplint.org/max_one_method_parameter_per_line/ can help aligning parameter syntax`,
      tags: [RuleTag.SingleFile, RuleTag.Whitespace, RuleTag.Styleguide],
      badExample: `CALL FUNCTION 'FOOBAR'
  EXPORTING
    foo = 2
    parameter = 3.

foobar( moo = 1
  param = 1 ).

foo = VALUE #(
    foo = bar
        moo = 2 ).`,
      goodExample: `CALL FUNCTION 'FOOBAR'
  EXPORTING
    foo       = 2
    parameter = 3.

foobar( moo   = 1
        param = 1 ).

foo = VALUE #(
    foo = bar
    moo = 2 ).`,
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
    candidates.push(...this.methodCallParamCandidates(stru));
    candidates.push(...this.valueBodyCandidates(stru));
    candidates.push(...this.raiseAndCreateCandidates(stru));
    candidates.push(...this.newCandidates(stru));

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
        const message = "Align parameters to column " + expectedEqualsColumn;
        return Issue.atPosition(file, p.eq, message, this.getMetadata().key);
      }
    }

    return undefined;
  }

  private newCandidates(stru: StructureNode): ICandidate[] {
    const candidates: ICandidate[] = [];

    for (const vb of stru.findAllExpressionsRecursive(Expressions.NewObject)) {
      const parameters: IParameterData[] = [];

      const fieldAssignments = vb.findDirectExpressions(Expressions.FieldAssignment);
      if (fieldAssignments.length >= 2) {
        for (const fs of fieldAssignments) {
          const children = fs.getChildren();
          if (children.length < 3) {
            continue; // unexpected
          }
          parameters.push({
            left: children[0],
            eq: children[1].getFirstToken().getStart(),
            right: children[2],
          });
        }
        if (parameters.length > 0) {
          candidates.push({parameters});
          continue;
        }
      }

      const list = vb.findDirectExpression(Expressions.ParameterListS);
      if (list) {
        for (const c of list.getChildren()) {
          const children = c.getChildren();
          if (children.length < 3) {
            continue; // unexpected
          }
          parameters.push({
            left: children[0],
            eq: children[1].getFirstToken().getStart(),
            right: children[2],
          });
        }
        if (parameters.length > 0) {
          candidates.push({parameters});
        }
      }
    }

    return candidates;
  }

  private valueBodyCandidates(stru: StructureNode): ICandidate[] {
    const candidates: ICandidate[] = [];

    for (const vb of stru.findAllExpressionsRecursive(Expressions.ValueBody)) {
      const parameters: IParameterData[] = [];
      const fieldAssignments = vb.findDirectExpressions(Expressions.FieldAssignment);
      if (fieldAssignments.length <= 1) {
        continue;
      }
      for (const fs of fieldAssignments) {
        const children = fs.getChildren();
        if (children.length < 3) {
          continue; // unexpected
        }
        parameters.push({
          left: children[0],
          eq: children[1].getFirstToken().getStart(),
          right: children[2],
        });
      }
      if (parameters.length > 0) {
        candidates.push({parameters});
      }
    }

    return candidates;
  }

  private raiseAndCreateCandidates(stru: StructureNode): ICandidate[] {
    const candidates: ICandidate[] = [];

    const statements = stru.findAllStatements(Statements.Raise);
    statements.push(...stru.findAllStatements(Statements.CreateObject));
    statements.push(...stru.findAllStatements(Statements.RaiseEvent));
    for (const raise of statements) {
      const parameters: IParameterData[] = [];
      const param = raise.findDirectExpression(Expressions.ParameterListS);
      for (const p of param?.getChildren() || []) {
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
      if (parameters.length > 0) {
        candidates.push({parameters});
      }
    }

    return candidates;
  }

  private methodCallParamCandidates(stru: StructureNode): ICandidate[] {
    const candidates: ICandidate[] = [];

    for (const mcp of stru.findAllExpressionsRecursive(Expressions.MethodCallParam)) {
      const parameters: IParameterData[] = [];

      for (const param of mcp.findDirectExpression(Expressions.ParameterListS)?.getChildren() || []) {
        const children = param.getChildren();
        if (children.length < 3) {
          continue; // unexpected
        }
        parameters.push({
          left: children[0],
          eq: children[1].getFirstToken().getStart(),
          right: children[2],
        });
      }

      const mp = mcp.findDirectExpression(Expressions.MethodParameters);
      if (mp) {
        for (const p of mp.findDirectExpression(Expressions.ParameterListS)?.getChildren() || []) {
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

        for (const l of mp.findDirectExpressions(Expressions.ParameterListT)) {
          for (const p of l.findDirectExpressions(Expressions.ParameterT) || []) {
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
        }

        const rec = mp.findDirectExpression(Expressions.ParameterT);
        if (rec) {
          const children = rec.getChildren();
          if (children.length < 3) {
            continue; // unexpected
          }
          parameters.push({
            left: children[0],
            eq: children[1].getFirstToken().getStart(),
            right: children[2],
          });
        }


        for (const ex of mp.findDirectExpression(Expressions.ParameterListExceptions)?.getChildren() || []) {
          const children = ex.getChildren();
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