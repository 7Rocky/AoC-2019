const countOcurrences = (arr, num) => {
  let count = 0

  for (const a of arr) {
    if (a === num) count++
  }

  return count
}

const isValidPassword = (password, level) => {
  const digits = String(password).split('').map(Number)
  let isValid = false

  if (level === 1) {
    for (let i = 1; i < digits.length; i++) {
      if (digits[i - 1] > digits[i]) return false
      if (digits[i - 1] === digits[i]) isValid = true
    }
  }

  if (level === 2) {
    for (let i = 0; i < 10; i++) {
      if (digits[i - 1] > digits[i]) return false
      if (countOcurrences(digits, i) === 2) isValid = true
    }
  }

  return isValid
}

const main = () => {
  const input = [372304, 847060]

  for (const level of [1, 2]) {
    let numValidPasswords = 0

    for (let p = input[0]; p <= input[1]; p++) {
      if (isValidPassword(p, level)) numValidPasswords++
    }

    console.log(`Number of valid passwords (${level}): ${numValidPasswords}`)
  }
}

main()
