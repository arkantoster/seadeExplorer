import axios from 'axios'
import db from './sqlite.js'
import log from './log.js'

const SEADE_URL = 'http://api-imp.seade.gov.br/v1'

String.prototype.checkYears = function (year) {
  return this.split('/').some((period) => {
    if (period.includes('-')) {
      const [start, end] = period.split('-')
      return Array.from({ length: Number(end) - Number(start) + 1 }, (_, i) => Number(start) + i).includes(year)
    } else {
      return period == year
    }
  })
}

const getVars = async () => {
  const SQLite = await db

  log('Variáveis').info()

  let spin = log(`Ajustando tabelas`, { indent: 2 })
  try {
    await SQLite.exec(`CREATE TABLE variaveis(
      codigo INTEGER PRIMARY KEY,
      nome TEXT,
      unidade TEXT,
      periodo TEXT,
      definicao TEXT,
      nota TEXT,
      fonte TEXT
    )`)
  } catch (error) {
    spin.fail(`Error: ${error}`)
    return
  }
  spin.succeed('Tabela ajustada')

  log(`Reqs`, { indent: 2 }).info()
  try {
    let isThereMore = true
    let offset = 0 //1405 max
    let limit = 20
    let added = 0
    log('', { indent: 4 }).info(`Paginação: ${limit}`)

    let spin = log('', { indent: 4 })
    while (isThereMore) {
      spin.text = `Offset: ${offset}/${added}`
      const { data: { variavel } } = await axios.get(`${SEADE_URL}/variavel?offset=${offset}&limit=${limit}`)

      for (const [key, value] of Object.entries(variavel)) {
        const { codigo, nome, unidade, periodo, definicao, nota, fonte } = value
        if (periodo.checkYears(2018) && periodo.checkYears(2019)) {
          added++
          await SQLite.run(`INSERT INTO variaveis VALUES(${codigo}, '${nome}', '${unidade}', '${periodo}', '${definicao}', '${[...nota].join('')}', '${[...fonte].join('')}')`)
        }
      }

      isThereMore = Object.keys(variavel).length === limit
      offset += Object.keys(variavel).length
    }
    spin.info(`Offset: ${offset}/${added}`)

  } catch (error) {
    spin.fail(`Error: ${error}`)
  }
}

export default getVars