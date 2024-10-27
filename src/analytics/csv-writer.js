import { createWriteStream, existsSync } from "node:fs";

export class CsvWriter {
  constructor(fileName, header = "") {
    this.fileName = fileName;
    this.stream = createWriteStream(fileName, { flags: "a" });
    if (header.length > 0 && !existsSync(fileName)) {
      this.writeRow(header);
    }
  }

  writeRow(row) {
    const _row = Array.isArray(row) ? row.join(",") : row;
    this.stream.write(_row + "\n");
  }
}
