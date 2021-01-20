const fs = require('fs')
const readline = require('readline')

const RESET = '\033[0m'

const RED_BACKGROUND = '\033[41m'
const GREEN_BACKGROUND = '\033[42m'

const RED_BOLD_BRIGHT = '\033[1;91m'
const GREEN_BOLD_BRIGHT = '\033[1;92m'
const YELLOW_BOLD_BRIGHT = '\033[1;93m'
const WHITE_BOLD_BRIGHT = '\033[1;97m'

const answer1 = 'Number of pixels 1 on the wanted layer (1): 828'
const answer2 = [
  'Image decoded mesage (2): ',
  '',
  '1111 1    111    11 1111 ',
  '   1 1    1  1    1 1    ',
  '  1  1    111     1 111  ',
  ' 1   1    1  1    1 1    ',
  '1    1    1  1 1  1 1    ',
  '1111 1111 111   11  1    '
]

const getOutput = async () => {
  return new Promise(resolve => {
    const lines = []

    readline
      .createInterface({ input: fs.createReadStream('output.txt') })
      .on('line', line => lines.push(line))
      .on('close', () => resolve(lines))
  })
}

const main = async () => {
  if (process.argv.length > 1 && process.argv[2] === 'time') {
    console.log(Date.now())
  } else {
    const lines = await getOutput()
    const init = Number(lines.shift())
    const time = (Date.now() - init) / 1000

    const answers = [answer1, ...answer2]
    let pass = true

    for (const answer of answers) {
      if (lines.indexOf(answer) === -1) {
        pass = false
        break
      }
    }

    if (pass) {
      console.log(GREEN_BACKGROUND + WHITE_BOLD_BRIGHT + ' PASS ' + RESET)
    } else {
      console.log(RED_BACKGROUND + WHITE_BOLD_BRIGHT + ' FAIL ' + RESET)
    }

    const color = time < 3 ? GREEN_BOLD_BRIGHT : time < 20 ? YELLOW_BOLD_BRIGHT : RED_BOLD_BRIGHT

    console.log(WHITE_BOLD_BRIGHT + ' Time  ' + color + time + ' s' + RESET)
  }
}

main()
