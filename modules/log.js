import { createWriteStream } from 'fs';
import moment from 'moment';
import ora from 'ora';

const stream = createWriteStream(`logs/${moment().format()}.log`)

const log = (text, options = {}) => {
  stream.write(`${moment()}: ${text}\n`)
  return ora({ text, ...options }).start()
}

export const logStream = (text) => {
  stream.write(`${moment()}: ${text}\n`)
}

export default log