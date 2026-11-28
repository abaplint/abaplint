import {xmlToArray} from "../xml_utils";

export type DynproField = {
  name: string,
  type: string,
  contType: string,
  contName: string | undefined,
  length: number,
  vislength: number,
  line: number,
  column: number,
  height: number,
  /** REF_FIELD, for tabstrip pushbuttons the name of the assigned subscreen area */
  refField: string | undefined,
};
export type DynproContainer = {
  type: string,
  name: string,
  elementOf: string | undefined,
};
export type DynproHeader = {
  number: string,
  description: string,
  nextScreen: string,
  type: string,
  fields: DynproField[],
  containers: DynproContainer[],
  /** true if the flow logic is stored inline in the XML, as opposed to a separate screen file */
  hasFlowLogic: boolean,
};
export type DynproList = DynproHeader[];

function parseNumber(value: string | undefined): number {
  if (value === undefined) {
    return 0;
  }

  return parseInt(value, 10);
}

function parseText(value: any): string | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  return value;
}

export function parseDynpros(parsed: any): DynproList {
  const dynpros: DynproList = [];
  const xmlDynpros = parsed.abapGit?.["asx:abap"]?.["asx:values"]?.DYNPROS;
  if (xmlDynpros !== undefined) {
    for (const d of xmlToArray(xmlDynpros.item)) {
      if (d?.HEADER === undefined) {
        continue;
      }
      const fields: DynproField[] = [];
      for (const f of xmlToArray(d.FIELDS?.RPY_DYFATC)) {
        fields.push({
          name: f.NAME,
          type: f.TYPE,
          contType: f.CONT_TYPE,
          contName: parseText(f.CONT_NAME),
          length: parseNumber(f.LENGTH),
          vislength: parseNumber(f.VISLENGTH),
          line: parseNumber(f.LINE),
          column: parseNumber(f.COLUMN),
          height: parseNumber(f.HEIGHT),
          refField: parseText(f.REF_FIELD),
        });
      }
      const containers: DynproContainer[] = [];
      for (const c of xmlToArray(d.CONTAINERS?.RPY_DYCATT)) {
        containers.push({
          type: c.TYPE,
          name: c.NAME,
          elementOf: parseText(c.ELEMENT_OF),
        });
      }
      dynpros.push({
        number: d.HEADER?.SCREEN,
        description: d.HEADER?.DESCRIPT,
        nextScreen: d.HEADER?.NEXTSCREEN,
        type: d.HEADER?.TYPE,
        fields: fields,
        containers: containers,
        hasFlowLogic: xmlToArray(d.FLOW_LOGIC?.RPY_DYFLOW).length > 0,
      });
    }
  }
  return dynpros;
}
