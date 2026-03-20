import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {DataDefinition} from "../objects";
import {CDSDefineView, CDSDefineAbstract, CDSDefineCustom, CDSDefineTableFunction, CDSExtendView, CDSDefineProjection} from "../cds/expressions";
import {CDSName} from "../cds/expressions/cds_name";
import {ExpressionNode} from "../abap/nodes/expression_node";

export class CDSNamingConf extends BasicRuleConfig {
  /** Expected prefix for basic interface views */
  public basicInterfaceView: string = "ZI_";
  /** Expected prefix for composite interface views */
  public compositeInterfaceView: string = "ZI_";
  /** Expected prefix for consumption views */
  public consumptionView: string = "ZC_";
  /** Expected prefix for basic restricted reuse views */
  public basicRestrictedReuseView: string = "ZR_";
  /** Expected prefix for composite restricted reuse views */
  public compositeRestrictedReuseView: string = "ZR_";
  /** Expected prefix for private views */
  public privateView: string = "ZP_";
  /** Expected prefix for remote API views */
  public remoteAPIView: string = "ZA_";
  /** Expected prefix for view extends */
  public viewExtend: string = "ZX_";
  /** Expected prefix for extension include views */
  public extensionIncludeView: string = "ZE_";
  /** Expected prefix for derivation functions */
  public derivationFunction: string = "ZF_";
  /** Expected prefix for abstract entities */
  public abstractEntity: string = "ZD_";
}

export class CDSNaming implements IRule {
  private conf = new CDSNamingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "cds_naming",
      title: "CDS Naming",
      shortDescription: `Checks CDS naming conventions based on the VDM prefix rules`,
      extendedInformation: `Validates that CDS entity names follow the expected prefix conventions:
I_ for interface views, C_ for consumption views, R_ for restricted reuse views,
P_ for private views, A_ for remote API views, X_ for view extends,
E_ for extension include views, F_ for derivation functions, D_ for abstract entities.

Names must also start with Z after the prefix (custom namespace).

https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ee6ff9b281d8448f96b4fe6c89f2bdc8/8a8cee943ef944fe8936f4cc60ba9bc1.html`,
      tags: [RuleTag.SingleFile, RuleTag.Naming],
      badExample: `define view entity ZMY_VIEW as select from source { key id }`,
      goodExample: `define view entity ZI_MY_VIEW as select from source { key id }`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CDSNamingConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry): IRule {
    return this;
  }

  public run(o: IObject): Issue[] {
    if (o.getType() !== "DDLS" || !(o instanceof DataDefinition)) {
      return [];
    }

    const tree = o.getTree();
    if (tree === undefined) {
      return [];
    }

    const file = o.findSourceFile();
    if (file === undefined) {
      return [];
    }

    const name = this.getCDSName(tree);
    if (name === undefined) {
      return [];
    }

    const nameStr = name.toUpperCase();
    const allowedPrefixes = this.getAllowedPrefixes(tree);
    if (allowedPrefixes.length === 0) {
      return [];
    }

    const matched = allowedPrefixes.some(p => nameStr.startsWith(p.toUpperCase()));
    if (!matched) {
      const prefixList = [...new Set(allowedPrefixes)].join(", ");
      const message = `CDS name "${name}" should have one of the expected prefixes: ${prefixList}`;
      return [Issue.atRow(file, 1, message, this.getMetadata().key, this.getConfig().severity)];
    }

    return [];
  }

  private getCDSName(tree: ExpressionNode): string | undefined {
    const nameNodes = tree.findDirectExpressions(CDSName);
    if (nameNodes.length > 0) {
      return nameNodes[0].getFirstToken().getStr();
    }
    return undefined;
  }

  private getAllowedPrefixes(tree: ExpressionNode): string[] {
    const root = tree.get();

    if (root instanceof CDSExtendView) {
      return [this.conf.viewExtend];
    }

    if (root instanceof CDSDefineAbstract) {
      return [this.conf.abstractEntity];
    }

    if (root instanceof CDSDefineTableFunction) {
      return [this.conf.derivationFunction];
    }

    if (root instanceof CDSDefineView || root instanceof CDSDefineProjection || root instanceof CDSDefineCustom) {
      return [
        this.conf.basicInterfaceView,
        this.conf.compositeInterfaceView,
        this.conf.consumptionView,
        this.conf.basicRestrictedReuseView,
        this.conf.compositeRestrictedReuseView,
        this.conf.privateView,
        this.conf.remoteAPIView,
        this.conf.extensionIncludeView,
      ];
    }

    return [];
  }

}
