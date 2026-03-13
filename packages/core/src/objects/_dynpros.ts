import {xmlToArray} from "../xml_utils";

export type DynproField = {
  name: string,
  type: string,
  length: number,
  line: number,
  column: number,
  height: number,
};
export type DynproHeader = {
  number: string,
  description: string,
  nextScreen: string,
  type: string,
  fields: DynproField[],
};
export type DynproList = DynproHeader[];

function parseNumber(value: string | undefined): number {
  if (value === undefined) {
    return 0;
  }

  return parseInt(value, 10);
}

export function parseDynpros(parsed: any): DynproList {
  const dynpros: DynproList = [];
  const xmlDynpros = parsed.abapGit?.["asx:abap"]?.["asx:values"]?.DYNPROS;
  if (xmlDynpros !== undefined) {
    for (const d of xmlToArray(xmlDynpros.item)) {
      const fields: DynproField[] = [];
      for (const f of xmlToArray(d.FIELDS?.RPY_DYFATC)) {
        fields.push({
          name: f.NAME,
          type: f.TYPE,
          length: parseNumber(f.LENGTH),
          line: parseNumber(f.LINE),
          column: parseNumber(f.COLUMN),
          height: parseNumber(f.HEIGHT),
        });
      }
      dynpros.push({
        number: d.HEADER.SCREEN,
        description: d.HEADER.DESCRIPT,
        nextScreen: d.HEADER.NEXTSCREEN,
        type: d.HEADER.TYPE,
        fields: fields,
      });
    }
  }
  return dynpros;
}