import {xmlToArray} from "../../xml_utils";

export enum FunctionModuleParameterType {
  importing = "importing",
  exporting = "exporting",
  changing = "changing",
  tables = "tables",
}

export interface IFunctionModuleParameter {
  name: string;
  type: FunctionModuleParameterType;
}

export class FunctionModuleDefinition {
  private name: string;
  private parameters: IFunctionModuleParameter[];

  public constructor(data: any) {
    this.parse(data);
  }

  public getParameters(): readonly IFunctionModuleParameter[] {
    return this.parameters;
  }

  public getName(): string {
    return this.name;
  }

///////////////

  private parse(data: any) {
    this.name = data.FUNCNAME._text;
    this.parameters = [];

    if (data.IMPORT) {
      for (const param of xmlToArray(data.IMPORT.RSIMP)) {
        this.parameters.push({
          name: param.PARAMETER._text,
          type: FunctionModuleParameterType.importing,
        });
      }
    }

    if (data.CHANGING) {
      for (const param of xmlToArray(data.CHANGING.RSCHA)) {
        this.parameters.push({
          name: param.PARAMETER._text,
          type: FunctionModuleParameterType.changing,
        });
      }
    }

    if (data.EXPORT) {
      for (const param of xmlToArray(data.EXPORT.RSEXP)) {
        this.parameters.push({
          name: param.PARAMETER._text,
          type: FunctionModuleParameterType.exporting,
        });
      }
    }

    if (data.TABLES) {
      for (const param of xmlToArray(data.TABLES.RSTBL)) {
        this.parameters.push({
          name: param.PARAMETER._text,
          type: FunctionModuleParameterType.tables,
        });
      }
    }

  }

}