export default function Masthead() {
  const today = new Date()
  const dateStr = today.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="border-b-4 border-np-black py-4 text-center">
      <div className="flex justify-between items-baseline text-xs text-np-gray-400 font-sans-tc mb-2 px-2">
        <span>Vol. 1 No. 1</span>
        <span>{dateStr}</span>
      </div>

      <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tight text-np-black leading-none uppercase">
        Nico Portfolio
      </h1>

      <div className="flex items-center gap-3 justify-center mt-2">
        <div className="flex-1 h-[2px] bg-np-black" />
        <p className="text-sm font-sans-tc text-np-gray-700 whitespace-nowrap px-2">
          嶺東科技大學 時尚經營系 · Lin Tzu Yu
        </p>
        <div className="flex-1 h-[2px] bg-np-black" />
      </div>
    </div>
  )
}
