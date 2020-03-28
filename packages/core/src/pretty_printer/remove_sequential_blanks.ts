import {SequentialBlankConf, SequentialBlank} from "../rules";
import {IFile} from "../files/_ifile";
import {IConfiguration} from "../_config";

export class RemoveSequentialBlanks {
  private readonly config: IConfiguration;

  public constructor(config: IConfiguration) {
    this.config = config;
  }

  public execute(file: IFile, modified: string): string {
    const sequentialBlankConfig = this.getSequentialBlankConfig();
    if (sequentialBlankConfig) {
      return this.withoutSequentialBlanks(file, modified, sequentialBlankConfig.lines);
    }

    return modified;
  }

  private withoutSequentialBlanks(file: IFile, modified: string, threshold: number): string {
    const rows = file.getRawRows();

    let blanks = 0;
    const rowsToRemove: number[] = [];
    const newBlankCount = (current: number, row: string): number => {
      return SequentialBlank.isBlankOrWhitespace(row) ? current + 1 : 0;
    };

    for (let i = 0; i < rows.length; i++) {
      blanks = newBlankCount(blanks, rows[i]);

      if (blanks === threshold) {
        // count additional blanks
        for (let j = i; j < rows.length; j++) {
          if (SequentialBlank.isBlankOrWhitespace(rows[j])) {
            rowsToRemove.push(j);
          } else {
            break;
          }
        }
      }
    }
    return this.removeRows(modified.split("\n"), rowsToRemove);
  }
  private removeRows(lines: string[], rowsToRemove: number[]): string {

    const withoutRemoved = lines.filter((_, idx) => {
      return rowsToRemove.indexOf(idx) === -1;
    });

    return withoutRemoved.join("\n").trim();
  }

  private getSequentialBlankConfig(): SequentialBlankConf | undefined {
    return this.config.readByRule(new SequentialBlank().getKey());
  }
}