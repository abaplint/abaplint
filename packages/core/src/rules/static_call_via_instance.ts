/* eslint-disable max-len */
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {MethodDefinition} from "../abap/types";
import {Position} from "../position";
import {VirtualPosition} from "../virtual_position";

export class StaticCallViaInstanceConf extends BasicRuleConfig {
  /** Allow in test class includes */
  public allowInTestclassIncludes?: boolean = false;
}

export class StaticCallViaInstance extends ABAPRule {

  private conf = new StaticCallViaInstanceConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "static_call_via_instance",
      title: "Static call via instance variable",
      shortDescription: `Static method call via instance variable`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#dont-call-static-methods-through-instance-variables`,
      tags: [RuleTag.Styleguide],
      badExample: `METHOD run.
  NEW lcl_helper( )->static_method( ).
ENDMETHOD.`,
      goodExample: `METHOD run.
  lcl_helper=>static_method( ).
ENDMETHOD.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: StaticCallViaInstanceConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject): Issue[] {
    const issues: Issue[] = [];

    if (this.getConfig().allowInTestclassIncludes === true && file.getFilename().includes(".testclasses.")) {
      return [];
    }

    const staticMethodCalls = new Set<string>();
    for (const s of this.listMethodCalls(file.getFilename(), new SyntaxLogic(this.reg, obj).run().spaghetti.getTop())) {
      staticMethodCalls.add(StaticCallViaInstance.positionKey(s));
    }
    if (staticMethodCalls.size === 0) {
      return [];
    }

    const tokens = file.getTokens();
    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i];
      if (token.getStr() !== "->") {
        continue;
      }

      const next = tokens[i + 1].getStart();
      // a plain reference position also matches a token inside a macro call at the same row and column
      if (staticMethodCalls.has(StaticCallViaInstance.positionKey(next))
          || (next instanceof VirtualPosition
          && staticMethodCalls.has(StaticCallViaInstance.positionKey(new Position(next.getRow(), next.getCol()))))) {
        const message = "Avoid calling static method via instance";
        issues.push(Issue.atToken(file, token, message, this.getMetadata().key));
      }
    }

    return issues;
  }

  private static positionKey(p: Position): string {
    if (p instanceof VirtualPosition) {
      return p.getRow() + ":" + p.getCol() + ":" + p.vrow + ":" + p.vcol;
    }
    return p.getRow() + ":" + p.getCol();
  }

  private listMethodCalls(filename: string, node: ISpaghettiScopeNode): Position[] {
    const ret: Position[] = [];

    for (const r of node.getData().references) {
      if (r.referenceType !== ReferenceType.MethodReference || r.position.getFilename() !== filename) {
        continue;
      }
      if (r.resolved instanceof MethodDefinition && r.resolved.isStatic() === true) {
        ret.push(r.position.getStart());
      }
    }

    for (const child of node.getChildren()) {
      ret.push(...this.listMethodCalls(filename, child));
    }

    return ret;
  }

}
