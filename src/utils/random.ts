import dayjs, { Dayjs } from 'dayjs'

export const getRandomNumberBetween = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getRandomBool = (): boolean => getRandomNumberBetween(1, 10) % 2 === 0

const getRandomFutureDayjsDate = (): Dayjs => {
  const randomDays: number = Math.floor(Math.random() * 100) + 1
  return dayjs().add(randomDays, 'day')
}

export const getRandomFutureDate = () => getRandomFutureDayjsDate().toDate()

export const getRandomFutureDateTime = () => getRandomFutureDayjsDate().format('YYYY-MM-DD')
