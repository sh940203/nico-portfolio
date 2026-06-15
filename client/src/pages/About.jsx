import { aboutData } from '../data/about'

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1.5 h-5 bg-np-red" />
      <span className="font-display font-bold text-xs uppercase tracking-widest text-np-black">{children}</span>
      <div className="flex-1 h-px bg-np-black" />
    </div>
  )
}

export default function About() {
  const d = aboutData
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="border-b-4 border-np-black pb-4 mb-8">
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tight text-np-black">About</h1>
        <p className="font-sans-tc text-np-gray-400 text-sm mt-1">關於我</p>
      </div>

      {/* 3-col top section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b-2 border-np-black pb-8 mb-8">
        {/* Photo */}
        <div className="md:col-span-1 bg-np-gray-100 aspect-[3/4] overflow-hidden">
          <img
            src={d.photo}
            alt={d.nameFull}
            className="w-full h-full object-cover grayscale"
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>

        {/* Name & intro */}
        <div className="md:col-span-1 border-l-0 md:border-l-2 border-np-black md:pl-6 flex flex-col gap-3">
          <div>
            <p className="text-[10px] font-sans-tc text-np-gray-400 tracking-widest uppercase">Name</p>
            <p className="font-display font-bold text-2xl text-np-black">{d.nameFull}</p>
            <p className="font-display text-np-gray-400 text-sm">{d.nameEn}</p>
          </div>
          <div>
            <p className="text-[10px] font-sans-tc text-np-gray-400 tracking-widest uppercase">Birthday</p>
            <p className="font-sans-tc text-np-gray-700 text-sm">{d.birthday}</p>
          </div>
          <div>
            <p className="text-[10px] font-sans-tc text-np-gray-400 tracking-widest uppercase">Department</p>
            <p className="font-sans-tc text-np-gray-700 text-sm">{d.department}</p>
          </div>
          <p className="font-serif-tc text-np-gray-700 text-sm leading-relaxed mt-2 italic">&ldquo;{d.intro}&rdquo;</p>
        </div>

        {/* Contact info */}
        <div className="md:col-span-1 border-l-0 md:border-l border-np-gray-400 md:pl-6 flex flex-col gap-3">
          <div>
            <p className="text-[10px] font-sans-tc text-np-gray-400 tracking-widest uppercase mb-2">Contact</p>
            <div className="flex flex-col gap-1.5">
              <a href={`mailto:${d.contact.email}`} className="font-sans-tc text-np-gray-700 text-sm hover:text-np-red transition-colors break-all">
                {d.contact.email}
              </a>
              <p className="font-sans-tc text-np-gray-700 text-sm">{d.contact.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio / self-intro */}
      {d.bio && (
        <div className="mb-8 border-b border-np-gray-100 pb-8">
          <SectionLabel>Profile 自我介紹</SectionLabel>
          <div className="columns-1 md:columns-2 gap-8 space-y-4">
            {d.bio.map((para, i) => (
              <p key={i} className="font-serif-tc text-np-gray-700 text-sm leading-relaxed break-inside-avoid">
                {i === 0 ? <span className="font-display font-bold text-np-red text-lg float-left mr-2 leading-none">&ldquo;</span> : null}
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      <div className="mb-8 border-b border-np-gray-100 pb-8">
        <SectionLabel>Education 學歷</SectionLabel>
        {d.education.map((e, i) => (
          <div key={i} className="flex items-baseline justify-between py-2 border-b border-np-gray-100 last:border-0">
            <div>
              <p className="font-serif-tc font-bold text-np-black text-sm">{e.school}</p>
              <p className="font-sans-tc text-np-gray-700 text-xs">{e.department}</p>
            </div>
            <p className="font-display text-np-gray-400 text-sm flex-shrink-0 ml-4">{e.period}</p>
          </div>
        ))}
      </div>

      {/* Skills / Licenses / Languages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <SectionLabel>Skills 技能</SectionLabel>
          <ul className="flex flex-col gap-1.5">
            {d.skills.map(s => (
              <li key={s} className="font-sans-tc text-np-gray-700 text-sm flex items-center gap-2">
                <span className="w-1 h-1 bg-np-red rounded-full flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionLabel>Licenses 證照</SectionLabel>
          <ul className="flex flex-col gap-2">
            {d.licenses.map(l => (
              <li key={l} className="font-sans-tc text-np-gray-700 text-xs flex items-start gap-2 leading-snug">
                <span className="w-1 h-1 bg-np-red rounded-full flex-shrink-0 mt-1.5" />
                {l}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionLabel>Languages 語言</SectionLabel>
          <ul className="flex flex-col gap-1.5">
            {d.languages.map(l => (
              <li key={l} className="font-sans-tc text-np-gray-700 text-sm flex items-center gap-2">
                <span className="w-1 h-1 bg-np-red rounded-full flex-shrink-0" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
