import getData from "./modules/getData.js"
import getLocals from "./modules/getLocals.js"
import getVars from "./modules/getVars.js"
import log from "./modules/log.js"

async function main() {

  console.log(``)
  console.log(`            █▀ █▀▀ ▄▀█ █▀▄ █▀▀`)
  console.log(`            ▄█ ██▄ █▀█ █▄▀ ██▄`)
  console.log(``)
  console.log(`   █▀▀ ▀▄▀ ▀█▀ █▀█ ▄▀█ █▀▀ ▀█▀ █▀█ █▀█`)
  console.log(`   ██▄ █ █  █  █▀▄ █▀█ █▄▄  █  █▄█ █▀▄`)
  console.log(``)

  log('Init').info();

  await getVars()
  await getLocals()
  await getData()

  log('END').info()
}

main()