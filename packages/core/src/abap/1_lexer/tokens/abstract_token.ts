import {Position} from "../../../position";
import {VirtualPosition} from "../../../virtual_position";

// token strings repeat a lot across files (keywords, common names, upper cased copies), share them.
// Longer strings are typically comments or text literals, not worth sharing
const INTERN_MAX_LENGTH = 30;
// bound the table, it lives for the lifetime of the process
const INTERN_MAX_ENTRIES = 100000;
// V8 represents substrings of this length or longer as slices that reference the full source,
// these are flattened before being stored, so the table does not keep removed files alive
const SLICED_MIN_LENGTH = 13;
let interned = new Map<string, string>();

function intern(str: string): string {
  if (str.length > INTERN_MAX_LENGTH) {
    return str;
  }
  const found = interned.get(str);
  if (found !== undefined) {
    return found;
  }
  if (interned.size >= INTERN_MAX_ENTRIES) {
    interned = new Map<string, string>();
  }
  const copy = str.length >= SLICED_MIN_LENGTH ? str.split("").join("") : str;
  interned.set(copy, copy);
  return copy;
}

// the token is its own start position, saves a separate Position object per token
export abstract class AbstractToken extends Position {
  private readonly str: string;
  private readonly strUpper: string;
  // only assigned for tokens from macro expansion, so other tokens don't pay for the field
  private readonly virtual?: VirtualPosition;

  public constructor(start: Position, str: string) {
    super(start.getRow(), start.getCol());
    this.str = intern(str);
    this.strUpper = intern(str.toUpperCase());
    if (start instanceof VirtualPosition) {
      this.virtual = start;
    }
  }

  // special function, for debugging purposes, see https://github.com/abaplint/abaplint/pull/3137
  public [Symbol.for("debug.description")](){
    return `${this.constructor.name} ${this.str}`;
  }

  public getStr(): string {
    return this.str;
  }

  public getUpperStr(): string {
    return this.strUpper;
  }

  public getStart(): Position {
    return this.virtual ?? this;
  }

  public getEnd(): Position {
    return new Position(this.getRow(), this.getCol() + this.str.length);
  }
}
