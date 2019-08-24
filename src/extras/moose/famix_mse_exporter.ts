import {FamixBaseElement} from "./famix_base_element";

export class FamixMseExporter {
  private element: FamixBaseElement;
  private buffer: string;

  constructor(packageClass: string, element: FamixBaseElement) {
    this.element = element;
    this.buffer = `(${packageClass}  (id: ${this.element.id})`;
  }


  public addProperty (name: string, prop: unknown) {
    if (prop == undefined) { return; }
    if ((prop instanceof Set) && (prop.size === 0)) { return; }

    if (prop instanceof Set) {
      let valueBuffer: string = "";
      for (const value of prop) {
        if (valueBuffer.length > 0) {
          valueBuffer = valueBuffer + " ";
        }
        if (typeof(value) === "string") {
          valueBuffer = valueBuffer + `'${value}'`;
        } else if (value instanceof FamixBaseElement) {
          valueBuffer = valueBuffer + `(ref: ${value.id})`;
        } else {
          valueBuffer = valueBuffer + `${value}`;
        }
      }
      this.buffer = this.buffer + `\n    (${name} ${valueBuffer})`;
    } else if (prop instanceof FamixBaseElement)  {
      this.buffer = this.buffer + `\n    (${name} (ref: ${prop.id}))`;
    } else if (typeof(prop) === "string") {
      this.buffer = this.buffer + `\n    (${name} '${prop}')`;
    } else {
      this.buffer = this.buffer + `\n    (${name} ${prop})`;
    }
  }

  public getMSE(): string {
    return this.buffer + ")\n";
  }

}