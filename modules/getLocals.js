import axios from 'axios'
import db from './sqlite.js'
import log from './log.js'

const getLocals = async () => {
  const SQLite = await db

  log('Localidades').info()

  let spin = log(`Ajustando tabelas`, { indent: 2 })
  try {
    await SQLite.exec(`CREATE TABLE localidades(
      codigo INTEGER PRIMARY KEY,
      codigo_ibge TEXT,
      nome TEXT,
      nivel TEXT,
      codigo_pai TEXT,
      nome_pai TEXT
    )`)
  } catch (error) {
    spin.fail(`Error: ${error}`)
    return
  }
  spin.succeed('Tabela ajustada')

  log(`Req`, { indent: 2 }).info()
  try {
    const { data: { localidades } } = await axios.get(`http://api-imp.seade.gov.br/v1/localidade`)

    spin = log(`Size: ${localidades.length}`, { indent: 4 })

    let data = []
    let batchSize = 10
    let added = 0

    for (let i = 0; i < localidades.length; i++) {
      const local = localidades[i];
      data.push(`(${local.codigo}, '${local.codigo_ibge}', '${local.nome.replace('\'', '')}', '${local.nivel}', '${local.codigo_pai}', '${local.nome_pai}')`)
      if (data.length >= batchSize || i + 1 === localidades.length) {
        let resp = await SQLite.run(`INSERT INTO localidades VALUES ${data.join()}`)
        added += data.length
        spin.text = `Size: ${localidades.length}/${added}`
        data = []
      }
    }
    spin.info()
    log('dados inseridos', { indent: 4 }).info()
  } catch (error) {
    spin.fail(`Error: ${error}`)
  }
}

export default getLocals