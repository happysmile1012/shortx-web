import Table from '@/components/Table'
import styles from '@/styles/Home.module.css'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import Balance from '../components/Balance'
import Header from '../components/Header'
import config from '../metadata/config.json'

console.log(config)

const inter = Inter({ subsets: ['latin'] })

const tableColumns = [
  {
    Header: 'Coin',
    accessor: 'col1'
  },
  {
    Header: 'Price',
    accessor: 'col2'
  },
  {
    Header: 'Amount',
    accessor: 'col3'
  },
  {
    Header: 'Next prediction',
    accessor: 'col4'
  },
  {
    Header: 'Current Prediction',
    accessor: 'col5'
  }
]

let tableData = []
config.forEach((data) => {
  let index = 1
  let row = {}
  for (const [key, value] of Object.entries(data)) {
    row[`col${index}`] = value
    index++
  }
  tableData.push(row)
})

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <Header />
        <h1>Predictoor</h1>
        <Balance />
        <Table columns={tableColumns} data={tableData} />
      </main>
    </>
  )
}
