import { create } from 'zustand'
import { getWorks } from '../api/works'

const useWorksStore = create((set) => ({
  works: [],
  packaging: [],
  currentWork: null,
  isLoading: false,

  fetchWorks: async (category) => {
    set({ isLoading: true })
    try {
      const res = await getWorks({ category })
      if (category === 'packaging') {
        set({ packaging: res.data.data })
      } else {
        set({ works: res.data.data })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  setCurrentWork: (work) => set({ currentWork: work }),
}))

export default useWorksStore
