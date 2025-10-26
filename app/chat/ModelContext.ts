'use client'

import { createContext, useContext } from 'react'

const ModelContext = createContext(undefined)

function useModel() {
  return useContext(ModelContext)
}
