import chalk from 'chalk';

const log = (scope: string, ...args: any[]) => {
    console.log(`${chalk.gray(`[${new Date().toISOString()}]`)} ${chalk.blue(`[${scope}]`)}`, ...args);
};

const warn = (scope: string, message: string) => log(scope, '⚠️', message);

// 0. Title
const title = (label: string, width = 80) => {
    const paddedLabel = label.padEnd(width, ' ');
    console.log('\n' + chalk.bold.bgWhite.black(paddedLabel));
    console.log('');
};

// 1. ✔ Simple status
const success = (message: string) => {
    console.log(`${chalk.green('✔')} ${message}`);
};

// 2. ⠋ During
const info = (message: string) => {
    console.log(`${chalk.blue('⠋')} ${message}`);
};

// 3. ⠋ During
const error = (message: string, err?: any) => {
    console.log(`${chalk.red('✕')} ${message}`);
    if (err) console.error(err);
};

// 4. Table output
const padRight = (str: string, length: number) => str + ' '.repeat(Math.max(length - str.length, 0));

const renderTable = (
  rows: Array<{ file: string; hash: string; duration: string }>
) => {
  const headers = ['File', 'Blurhash', 'Timing'];

  // Largeur max des colonnes (durée sans parenthèses)
  const colWidths = [
    Math.max(...rows.map(r => r.file.length), headers[0].length),
    Math.max(...rows.map(r => r.hash.length), headers[1].length),
    Math.max(...rows.map(r => r.duration.length), headers[2].length),
  ];

  const top = `┌${colWidths.map(w => '─'.repeat(w + 2)).join('┬')}──┐`;
  const bottom = `└${colWidths.map(w => '─'.repeat(w + 2)).join('┴')}──┘`;

  const headerLine = chalk.gray('│ ') + headers.map((h, i) => padRight(h, colWidths[i])).join(chalk.gray(' │ ')) + chalk.gray('   │');

  const separator = '├' + colWidths.map(w => '─'.repeat(w + 2)).join('┼') + '──┤';

  const body = rows.map(({ file, hash, duration }) => {
    const c1 = padRight(file, colWidths[0]);
    const c2 = padRight(hash, colWidths[1]);
    const c3 = duration.padEnd(colWidths[2]);
    return chalk.gray(`│ ${chalk.blue(c1)} │ ${chalk.white(c2)} │ (${c3}) │`);
  }).join('\n');

  console.log(chalk.gray(top));
  console.log(headerLine);
  console.log(chalk.gray(separator));
  console.log(body);
  console.log(chalk.gray(bottom));
};

export const logger = {
    info,
    success,
    warn,
    error,
    title,
    renderTable,
};