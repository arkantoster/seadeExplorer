import axios from "axios";
import https from "https";
import db from "./sqlite.js";
import log, { logStream } from "./log.js";

const getData = async () => {
  const SQLite = await db;

  log("Dados").info();

  const instance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

  let spin = log(`Ajustando tabelas`, { indent: 2 });
  try {
    await SQLite.exec(`CREATE TABLE IF NOT EXISTS dados (
      dado             TEXT,
      ano              TEXT,
      codigo_municipio INTEGER NOT NULL,
      codigo_variavel  INTEGER NOT NULL,
      FOREIGN KEY (codigo_municipio) REFERENCES localidades (codigo),
      FOREIGN KEY (codigo_variavel) REFERENCES variaveis (codigo)
  )`);
  } catch (error) {
    spin.fail(`Error: ${error}`);
  }
  spin.succeed("Tabela ajustada");

  spin = log("Gerando combinações", { indent: 2 });

  const collection = [];
  try {
    const municipios = await SQLite.all(
      `SELECT codigo FROM localidades WHERE nome IN ( 'São Paulo', 'Serra Negra', 'Fartura', 'Pirajuí', 'Garça', 'Lorena', 'Taquaritinga', 'Itatiba', 'Araras', 'Itapira', 'Franca', 'Piracicaba', 'Jaú', 'Bauru', 'Tupã' )`
    );
    const variaveis = await SQLite.all(`SELECT codigo FROM variaveis`);

    for (let i = 0; i < municipios.length; i++) {
      const m = municipios[i];
      for (let j = 0; j < variaveis.length; j++) {
        const v = variaveis[j];
        collection.push({
          codigo_municipio: m.codigo,
          codigo_variavel: v.codigo,
          ano: 2018,
        });
        collection.push({
          codigo_municipio: m.codigo,
          codigo_variavel: v.codigo,
          ano: 2019,
        });
      }
    }
    spin.info(`${collection.length} Reqs`);
  } catch (error) {
    spin.fail(`Error: ${error}`);
  }

  log(`Reqs`, { indent: 2 }).info();

  spin = log("", { indent: 4 });

  for (let i = 0; i < collection.length; i++) {
    spin.text = `${i + 1}/${collection.length}`;

    const { codigo_municipio, codigo_variavel, ano } = collection[i];

    try {
      const {
        data: {
          dados: [{ ano: data }],
        },
      } = await instance.get(
        `http://api-imp.seade.gov.br/v1/dados/${codigo_municipio}/${codigo_variavel}/${ano}`
      );
      if (data[ano]) {
        await SQLite.exec(
          `INSERT INTO dados VALUES ('${data[ano]}', '${ano}', ${codigo_municipio}, ${codigo_variavel})`
        );
      } else {
        throw `data not found ${JSON.stringify(collection[i])}`;
      }
    } catch (error) {
      logStream(
        `Error: ${error} || ${codigo_municipio}/${codigo_variavel}/${ano}`
      );
    }
  }
  spin.succeed();
};

export default getData;
