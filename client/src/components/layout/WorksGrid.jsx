import WorkCard from '../ui/WorkCard'

// 每 5 件為一組：1 大（span-2）+ 2 小 + 2 小
export default function WorksGrid({ works, onWorkClick }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {works.map((work, i) => {
        const posInGroup = i % 5
        const isLarge = posInGroup === 0
        return (
          <div key={work.id} className={isLarge ? 'col-span-2' : 'col-span-1'}>
            <WorkCard work={work} onClick={onWorkClick} />
          </div>
        )
      })}
    </div>
  )
}
