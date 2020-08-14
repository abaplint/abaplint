import {xmlToArray} from "../../xml_utils";

export enum FunctionModuleParameterDirection {
  importing = "importing",
  exporting = "exporting",
  changing = "changing",
  tables = "tables",
}

export interface IFunctionModuleParameter {
  name: string;
  direction: FunctionModuleParameterDirection;
  type: string;
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
          direction: FunctionModuleParameterDirection.importing,
          type: param.TYP._text,
        });
      }
    }

    if (data.CHANGING) {
      for (const param of xmlToArray(data.CHANGING.RSCHA)) {
        this.parameters.push({
          name: param.PARAMETER._text,
          direction: FunctionModuleParameterDirection.changing,
          type: param.TYP._text,
        });
      }
    }

    if (data.EXPORT) {
      for (const param of xmlToArray(data.EXPORT.RSEXP)) {
        this.parameters.push({
          name: param.PARAMETER._text,
          direction: FunctionModuleParameterDirection.exporting,
          type: param.TYP._text,
        });
      }
    }

    if (data.TABLES) {
      for (const param of xmlToArray(data.TABLES.RSTBL)) {
        this.parameters.push({
          name: param.PARAMETER._text,
          direction: FunctionModuleParameterDirection.tables,
          type: param.TYP._text,
        });
      }
    }

  }

}