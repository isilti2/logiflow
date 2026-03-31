interface BrowserMockupProps {
  label?: string;
  className?: string;
  colorScheme?: 'teal' | 'blue' | 'purple' | 'orange';
}

const colorSchemes = {
  teal: {
    bg: 'from-blue-50 via-cyan-50 to-blue-100',
    accent: 'bg-blue-500',
    accent2: 'bg-cyan-300',
    accent3: 'bg-blue-700',
    bar1: 'bg-blue-200',
    bar2: 'bg-cyan-200',
  },
  blue: {
    bg: 'from-blue-50 via-indigo-50 to-blue-100',
    accent: 'bg-blue-400',
    accent2: 'bg-indigo-300',
    accent3: 'bg-blue-600',
    bar1: 'bg-blue-200',
    bar2: 'bg-indigo-200',
  },
  purple: {
    bg: 'from-purple-50 via-violet-50 to-purple-100',
    accent: 'bg-purple-400',
    accent2: 'bg-violet-300',
    accent3: 'bg-purple-600',
    bar1: 'bg-purple-200',
    bar2: 'bg-violet-200',
  },
  orange: {
    bg: 'from-orange-50 via-amber-50 to-orange-100',
    accent: 'bg-orange-400',
    accent2: 'bg-amber-300',
    accent3: 'bg-orange-600',
    bar1: 'bg-orange-200',
    bar2: 'bg-amber-200',
  },
};

export default function BrowserMockup({
  label = 'LogiFlow',
  className = '',
  colorScheme = 'teal',
}: BrowserMockupProps) {
  const colors = colorSchemes[colorScheme];

  return (
    <div className={`rounded-2xl overflow-hidden shadow-2xl border border-gray-200 ${className}`}>
      {/* Browser Chrome */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md text-xs text-gray-400 px-3 py-1 mx-2 text-center">
          app.logiflow.io
        </div>
        <div className="flex gap-1">
          <div className="w-5 h-5 rounded bg-gray-200" />
          <div className="w-5 h-5 rounded bg-gray-200" />
        </div>
      </div>

      {/* App Content Placeholder */}
      <div className={`bg-gradient-to-br ${colors.bg} aspect-video relative overflow-hidden`}>
        {/* Sidebar */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-white/60 border-r border-gray-200/50 p-2">
          <div className="space-y-1.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-3 rounded ${i === 0 ? colors.accent : 'bg-gray-200'} ${i === 0 ? 'w-full' : i % 2 === 0 ? 'w-3/4' : 'w-5/6'}`} />
            ))}
          </div>
          <div className="mt-4 space-y-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-1 items-center">
                <div className={`w-2 h-2 rounded-full ${colors.accent2}`} />
                <div className={`h-2 rounded bg-gray-200 flex-1`} />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - 3D Visualization Placeholder */}
        <div className="absolute left-1/4 top-0 right-0 bottom-0 flex items-center justify-center p-4">
          {/* 3D Box Grid Simulation */}
          <div className="relative w-full max-w-xs">
            {/* Grid of colored blocks */}
            <div className="grid grid-cols-6 gap-0.5 transform perspective-500 rotateX-10">
              {[...Array(24)].map((_, i) => {
                const colorOptions = [
                  'bg-red-400', 'bg-blue-400', 'bg-green-400',
                  'bg-yellow-400', 'bg-purple-400', 'bg-blue-500',
                  'bg-orange-400', 'bg-pink-400'
                ];
                return (
                  <div
                    key={i}
                    className={`${colorOptions[i % colorOptions.length]} h-6 rounded-sm opacity-80 text-white text-[6px] flex items-center justify-center font-bold`}
                  >
                    {i % 3 === 0 ? 'item' : ''}
                  </div>
                );
              })}
            </div>
            {/* Bottom status bar */}
            <div className="mt-2 flex gap-2">
              <div className={`h-1.5 rounded flex-1 ${colors.bar1}`} />
              <div className={`h-1.5 rounded w-1/3 ${colors.bar2}`} />
            </div>
          </div>
        </div>

        {/* Label overlay */}
        <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
}
