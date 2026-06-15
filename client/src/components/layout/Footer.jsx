export default function Footer() {
  return (
    <footer className="border-t-2 border-np-black mt-auto py-6 bg-np-white">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="font-display text-sm text-np-gray-700 tracking-widest uppercase">
          林姿余 Lin Tzu Yu · 嶺東科技大學 時尚經營系
        </p>
        <p className="text-xs text-np-gray-400 font-sans-tc">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  )
}
